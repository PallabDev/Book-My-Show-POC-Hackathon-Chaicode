import https from "node:https";
import ApiError from "./ApiError.js";

const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";

function getRequiredEnv(name) {
    const value = process.env[name]?.trim();

    if (!value) {
        throw ApiError.internal(`${name} is not configured`);
    }

    return value;
}

function getEmailFromAddress() {
    const from = process.env.EMAIL_FROM?.trim() || process.env.RESEND_FROM?.trim();

    if (!from) {
        throw ApiError.internal("EMAIL_FROM is not configured");
    }

    return from;
}

function getFrontendUrl() {
    const frontendUrl = process.env.FRONTEND_URL?.trim() || process.env.FRONTEND_ORIGIN?.split(",")[0]?.trim();

    if (!frontendUrl) {
        throw ApiError.internal("FRONTEND_URL is not configured");
    }

    return frontendUrl.replace(/\/+$/, "");
}

function buildFrontendTokenUrl(path, token) {
    return `${getFrontendUrl()}${path}?token=${encodeURIComponent(token)}`;
}

function parseJsonResponse(responseBody) {
    if (!responseBody) {
        return null;
    }

    try {
        return JSON.parse(responseBody);
    } catch {
        return null;
    }
}

function requestJson(url, payload, headers) {
    return new Promise((resolve, reject) => {
        const requestUrl = new URL(url);
        const body = JSON.stringify(payload);

        const request = https.request(
            {
                hostname: requestUrl.hostname,
                path: `${requestUrl.pathname}${requestUrl.search}`,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body),
                    ...headers
                }
            },
            (response) => {
                let responseBody = "";

                response.setEncoding("utf8");
                response.on("data", (chunk) => {
                    responseBody += chunk;
                });
                response.on("end", () => {
                    const parsedResponse = parseJsonResponse(responseBody);

                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        resolve(parsedResponse);
                        return;
                    }

                    reject(ApiError.internal(parsedResponse?.message || parsedResponse?.error || "Failed to send email"));
                });
            }
        );

        request.on("error", () => {
            reject(ApiError.internal("Email service is unavailable"));
        });
        request.write(body);
        request.end();
    });
}

function buildActionEmail({ title, message, actionLabel, actionUrl }) {
    return {
        text: `${message}\n\n${actionLabel}: ${actionUrl}\n\nIf you did not request this, you can ignore this email.`,
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
                <h2>${title}</h2>
                <p>${message}</p>
                <p>
                    <a href="${actionUrl}" style="display: inline-block; padding: 10px 16px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 6px;">
                        ${actionLabel}
                    </a>
                </p>
                <p>If the button does not work, open this link:</p>
                <p><a href="${actionUrl}">${actionUrl}</a></p>
                <p>If you did not request this, you can ignore this email.</p>
            </div>
        `
    };
}

export const sendEmail = async ({ to, subject, text, html }) => {
    if (!to || !subject || (!text && !html)) {
        throw ApiError.badRequest("Missing required email fields");
    }

    try {
        const apiKey = getRequiredEnv("RESEND_API_KEY");

        return await requestJson(
            RESEND_EMAILS_ENDPOINT,
            {
                from: getEmailFromAddress(),
                to,
                subject,
                text,
                html
            },
            {
                Authorization: `Bearer ${apiKey}`
            }
        );
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw ApiError.internal("Email service error");
    }
};

export const sendVerificationEmail = async ({ to, token }) => {
    if (!token) {
        throw ApiError.badRequest("Verification token is required");
    }

    const verificationUrl = buildFrontendTokenUrl("/verify-email", token);
    const email = buildActionEmail({
        title: "Verify your Book My Show email",
        message: "Please verify your email address to finish creating your Book My Show account.",
        actionLabel: "Verify email",
        actionUrl: verificationUrl
    });

    return sendEmail({
        to,
        subject: "Verify your Book My Show account",
        ...email
    });
};

export const sendPasswordResetEmail = async ({ to, token }) => {
    if (!token) {
        throw ApiError.badRequest("Password reset token is required");
    }

    const resetUrl = buildFrontendTokenUrl("/reset-password", token);
    const email = buildActionEmail({
        title: "Reset your Book My Show password",
        message: "Use this secure link to reset your Book My Show password.",
        actionLabel: "Reset password",
        actionUrl: resetUrl
    });

    return sendEmail({
        to,
        subject: "Reset your Book My Show password",
        ...email
    });
};
