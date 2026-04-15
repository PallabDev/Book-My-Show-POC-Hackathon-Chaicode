const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

const ACCESS_TOKEN_COOKIE_MAX_AGE = 15 * 60 * 1000;
const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function isProduction() {
    return process.env.NODE_ENV === "production";
}

function getCookieDomain() {
    return process.env.COOKIE_DOMAIN?.trim() || undefined;
}

function getCookieBaseOptions() {
    const options = {
        httpOnly: true,
        secure: isProduction(),
        sameSite: isProduction() ? "none" : "lax",
        path: "/"
    };

    const domain = getCookieDomain();
    if (domain) {
        options.domain = domain;
    }

    return options;
}

function buildCookieOptions(maxAge) {
    return {
        ...getCookieBaseOptions(),
        maxAge
    };
}

function setAuthCookies(res, tokens) {
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, buildCookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE));
    res.cookie(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, buildCookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE));
}

function clearAuthCookies(res) {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getCookieBaseOptions());
    res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, getCookieBaseOptions());
}

function safeParseUser(user) {
    if (!user) {
        return null;
    }

    const {
        password,
        refresh_token,
        email_verification_token,
        email_verification_expires_at,
        password_reset_token,
        password_reset_expires_at,
        ...safeUser
    } = user;

    return safeUser;
}

function normalizeEmail(email) {
    return email?.trim().toLowerCase();
}

function exposeDevToken(token) {
    return process.env.NODE_ENV === "production" ? undefined : token;
}

export {
    ACCESS_TOKEN_COOKIE_NAME,
    REFRESH_TOKEN_COOKIE_NAME,
    clearAuthCookies,
    exposeDevToken,
    normalizeEmail,
    safeParseUser,
    setAuthCookies
};
