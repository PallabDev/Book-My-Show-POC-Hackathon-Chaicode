import crypto from "crypto"
import jwt from "jsonwebtoken"

const getTokenSecret = (name, fallback) => {
    const secret = process.env[name]

    if (secret) {
        return secret
    }

    if (process.env.NODE_ENV !== "production") {
        return fallback
    }

    throw new Error(`${name} is required`)
}

const getAccessTokenSecret = () => getTokenSecret("ACCESS_TOKEN_SECRET", "bms-dev-access-secret")
const getRefreshTokenSecret = () => getTokenSecret("REFRESH_TOKEN_SECRET", "bms-dev-refresh-secret")

const generateVerifyToken = () => {
    const rawToken = crypto.randomBytes(32).toString("hex")
    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex")

    return { rawToken, hashedToken }
}

const generateAuthTokens = (payload) => {
    const accessTokenSecret = getAccessTokenSecret()
    const refreshTokenSecret = getRefreshTokenSecret()
    const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
    const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"

    const accessToken = jwt.sign(payload, accessTokenSecret, {
        expiresIn: accessTokenExpiresIn
    })
    const refreshToken = jwt.sign(payload, refreshTokenSecret, {
        expiresIn: refreshTokenExpiresIn
    })


    return { accessToken, refreshToken }
}

export {
    generateAuthTokens,
    generateVerifyToken,
    getAccessTokenSecret,
    getRefreshTokenSecret
}
