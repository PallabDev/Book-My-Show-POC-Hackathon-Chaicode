import jwt from "jsonwebtoken";
import db from "../../common/config/db.js";
import ApiError from "../../common/config/utils/ApiError.js";
import { getAccessTokenSecret } from "../../common/config/utils/jwt.utils.js";

const validateDto = (DtoClass, source = "body") => {
    return (req, res, next) => {
        const payload = req[source] || {};
        const { error, value } = DtoClass.validate(payload);

        if (error) {
            return next(ApiError.badRequest(error.join(", ")));
        }

        req[source] = value;
        next();
    };
};

const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const accessToken = req.cookies.accessToken || bearerToken;

    if (!accessToken) {
        return next(ApiError.unauthorized("Access token is required"));
    }

    try {
        const accessTokenSecret = getAccessTokenSecret();
        const decoded = jwt.verify(accessToken, accessTokenSecret);

        if (!decoded?.userId) {
            return next(ApiError.unauthorized("Invalid or expired access token"));
        }

        const result = await db.query(
            "SELECT userid, first_name, last_name, email, role, is_verified FROM users WHERE userid = $1 AND is_deleted = FALSE",
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return next(ApiError.unauthorized("User not found"));
        }

        req.userId = decoded.userId;
        req.user = result.rows[0];
        next();
    } catch (error) {
        next(ApiError.unauthorized("Invalid or expired access token"));
    }
};

const checkRole = (allowedRoles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized("Authentication is required"));
        }

        if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
            return next();
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(ApiError.forbidden("You do not have permission to access this resource"));
        }

        next();
    };
};

export {
    checkRole,
    validateDto,
    authenticate
};
