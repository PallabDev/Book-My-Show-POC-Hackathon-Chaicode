import crypto from "crypto";
import db from "../../common/config/db.js";
import ApiError from "../../common/config/utils/ApiError.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { exposeDevToken, normalizeEmail, safeParseUser } from "../../common/config/utils/auth.utils.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../../common/config/utils/email.utils.js";
import { generateAuthTokens, generateVerifyToken, getRefreshTokenSecret } from "../../common/config/utils/jwt.utils.js";

const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_TTL_MS = 30 * 60 * 1000;

function hashRawToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
export const signupService = async (firstName, lastName, email, password) => {
    const client = await db.connect();
    try {
        if (!firstName || !lastName || !email || !password) {
            throw ApiError.badRequest("All fields are required");
        }

        const normalizedEmail = normalizeEmail(email);
        const existingUser = await client.query("SELECT userid FROM users WHERE LOWER(email) = LOWER($1)", [normalizedEmail]);
        if (existingUser.rows.length > 0) {
            throw ApiError.conflict("Email already in use");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const { rawToken, hashedToken } = generateVerifyToken();
        const verificationExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS);
        const result = await client.query(
            `
                INSERT INTO users (
                    first_name,
                    last_name,
                    email,
                    password,
                    email_verification_token,
                    email_verification_expires_at
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `,
            [firstName.trim(), lastName.trim(), normalizedEmail, hashedPassword, hashedToken, verificationExpiresAt]
        );

        const user = result.rows[0];

        await sendVerificationEmail({
            to: user.email,
            token: rawToken
        });

        return {
            user: safeParseUser(user),
            verificationToken: exposeDevToken(rawToken)
        };
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw ApiError.internal("Signup failed");
    }
    finally {
        client.release();
    }

}

export const loginService = async (email, password) => {
    if (!email || !password) {
        throw ApiError.badRequest("Email and password are required");
    }
    const client = await db.connect();
    try {
        const normalizedEmail = normalizeEmail(email);
        const result = await client.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND is_deleted = FALSE", [normalizedEmail]);
        if (result.rows.length === 0) {
            throw ApiError.unauthorized("Invalid email or password");
        }
        const user = result.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            throw ApiError.unauthorized("Invalid email or password");
        }
        if (!user.is_verified) {
            throw ApiError.badRequest("Please verify your email before logging in");
        }
        const { accessToken, refreshToken } = generateAuthTokens({ userId: user.userid, role: user.role });
        await client.query("UPDATE users SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP WHERE userid = $2", [refreshToken, user.userid]);
        const responsePayload = {
            accessToken,
            refreshToken,
            user: safeParseUser(user)
        };
        return responsePayload;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw ApiError.internal("Login failed");
    } finally {
        client.release();
    }
};

export const logoutService = async (userId) => {
    const client = await db.connect();
    try {
        await client.query("UPDATE users SET refresh_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE userid = $1", [userId]);
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw ApiError.internal("Logout failed");
    }
    finally {
        client.release();
    }
}

export const getMeService = async (userId) => {
    const client = await db.connect();
    try {
        const result = await client.query("SELECT * FROM users WHERE userid = $1 AND is_deleted = FALSE", [userId]);
        if (result.rows.length === 0) {
            throw ApiError.notFound("User not found");
        }
        const user = result.rows[0];
        return safeParseUser(user);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw ApiError.internal("Failed to fetch user details");
    }
    finally {
        client.release();
    }
}

export const refreshTokenService = async (refreshToken) => {
    if (!refreshToken) {
        throw ApiError.unauthorized("Refresh token is required");
    }

    const client = await db.connect();
    try {
        const refreshTokenSecret = getRefreshTokenSecret();
        const decoded = jwt.verify(refreshToken, refreshTokenSecret);
        const userId = decoded?.userId;

        if (!userId) {
            throw ApiError.unauthorized("Invalid refresh token");
        }

        const result = await client.query("SELECT * FROM users WHERE userid = $1", [userId]);
        if (result.rows.length === 0) {
            throw ApiError.unauthorized("Invalid refresh token");
        }

        const user = result.rows[0];
        if (!user.refresh_token || user.refresh_token !== refreshToken) {
            throw ApiError.unauthorized("Invalid refresh token");
        }

        const tokens = generateAuthTokens({ userId: user.userid, role: user.role });
        await client.query("UPDATE users SET refresh_token = $1, updated_at = CURRENT_TIMESTAMP WHERE userid = $2", [tokens.refreshToken, user.userid]);

        return {
            ...tokens,
            user: safeParseUser(user)
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            throw ApiError.unauthorized("Invalid or expired refresh token");
        }

        throw ApiError.internal("Failed to refresh token");
    } finally {
        client.release();
    }
}

export const verifyEmailService = async (token) => {
    if (!token) {
        throw ApiError.badRequest("Verification token is required");
    }

    const client = await db.connect();
    try {
        const hashedToken = hashRawToken(token);
        const result = await client.query(
            `
                SELECT *
                FROM users
                WHERE email_verification_token = $1
                  AND email_verification_expires_at IS NOT NULL
                  AND email_verification_expires_at > CURRENT_TIMESTAMP
            `,
            [hashedToken]
        );

        if (result.rows.length === 0) {
            throw ApiError.badRequest("Invalid verification token");
        }

        const user = result.rows[0];
        const updatedUser = await client.query(
            `
                UPDATE users
                SET is_verified = TRUE,
                    email_verification_token = NULL,
                    email_verification_expires_at = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE userid = $1
                RETURNING *
            `,
            [user.userid]
        );

        return safeParseUser(updatedUser.rows[0]);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw ApiError.internal("Email verification failed");
    } finally {
        client.release();
    }
}

export const sendResetPasswordTokenService = async (email) => {
    if (!email) {
        throw ApiError.badRequest("Email is required");
    }

    const client = await db.connect();
    try {
        const normalizedEmail = normalizeEmail(email);
        const result = await client.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND is_deleted = FALSE", [normalizedEmail]);

        if (result.rows.length === 0) {
            throw ApiError.notFound("User not found");
        }

        const user = result.rows[0];
        const { rawToken, hashedToken } = generateVerifyToken();
        const resetTokenExpiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

        await client.query(
            `
                UPDATE users
                SET password_reset_token = $1,
                    password_reset_expires_at = $2,
                    updated_at = CURRENT_TIMESTAMP
                WHERE userid = $3
            `,
            [hashedToken, resetTokenExpiresAt, user.userid]
        );

        await sendPasswordResetEmail({
            to: user.email,
            token: rawToken
        });

        return {
            email: user.email,
            resetToken: exposeDevToken(rawToken)
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw ApiError.internal("Failed to generate reset password token");
    } finally {
        client.release();
    }
}

export const resetPasswordService = async (token, password) => {
    if (!token || !password) {
        throw ApiError.badRequest("Token and password are required");
    }

    const client = await db.connect();
    try {
        const hashedToken = hashRawToken(token);
        const result = await client.query(
            `
                SELECT *
                FROM users
                WHERE password_reset_token = $1
                  AND password_reset_expires_at IS NOT NULL
                  AND password_reset_expires_at > CURRENT_TIMESTAMP
            `,
            [hashedToken]
        );

        if (result.rows.length === 0) {
            throw ApiError.badRequest("Invalid reset password token");
        }

        const user = result.rows[0];
        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await client.query(
            `
                UPDATE users
                SET password = $1,
                    password_reset_token = NULL,
                    password_reset_expires_at = NULL,
                    refresh_token = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE userid = $2
                RETURNING *
            `,
            [hashedPassword, user.userid]
        );

        return safeParseUser(updatedUser.rows[0]);
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw ApiError.internal("Failed to reset password");
    } finally {
        client.release();
    }
}
