import ApiError from "../../common/config/utils/ApiError.js";
import ApiResponse from "../../common/config/utils/ApiResponse.js";
import { clearAuthCookies, setAuthCookies } from "../../common/config/utils/auth.utils.js";
import {
    getMeService,
    loginService,
    logoutService,
    refreshTokenService,
    resetPasswordService,
    sendResetPasswordTokenService,
    signupService,
    verifyEmailService
} from "./services.js";

const signupController = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const signupPayload = await signupService(firstName, lastName, email, password);
    if (!signupPayload?.user) {
        throw new ApiError(500, "Signup failed");
    }
    return ApiResponse.created(res, "User signup successfully", signupPayload);
}

const loginController = async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await loginService(email, password);
    if (!user || !accessToken || !refreshToken) {
        throw ApiError.unauthorized("Login failed");
    }
    setAuthCookies(res, { accessToken, refreshToken });
    const response = {
        user,
        accessToken,
        refreshToken
    };
    return ApiResponse.ok(res, "User login successfully", response);
}

const logoutController = async (req, res) => {
    const userId = req.userId;
    await logoutService(userId);
    clearAuthCookies(res);
    return ApiResponse.ok(res, "User logged out successfully");
}

const getMeController = async (req, res) => {
    const userId = req.userId;
    const user = await getMeService(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    return ApiResponse.ok(res, "User details fetched successfully", user);
}

const refreshTokenController = async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const response = await refreshTokenService(refreshToken);
    setAuthCookies(res, response);
    return ApiResponse.ok(res, "Token refreshed successfully", response);
}

const verifyEmailController = async (req, res) => {
    const { token } = req.body;
    const user = await verifyEmailService(token);
    return ApiResponse.ok(res, "Email verified successfully", user);
}

const sendResetPasswordTokenController = async (req, res) => {
    const { email } = req.body;
    const response = await sendResetPasswordTokenService(email);
    return ApiResponse.ok(res, "Reset password token generated successfully", response);
}

const resetPasswordController = async (req, res) => {
    const { token, password } = req.body;
    const user = await resetPasswordService(token, password);
    return ApiResponse.ok(res, "Password reset successfully", user);
}


export {
    signupController,
    loginController,
    logoutController,
    getMeController,
    refreshTokenController,
    verifyEmailController,
    sendResetPasswordTokenController,
    resetPasswordController
};
