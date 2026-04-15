import { Router } from "express";
import {
    getMeController,
    loginController,
    logoutController,
    refreshTokenController,
    resetPasswordController,
    sendResetPasswordTokenController,
    signupController,
    verifyEmailController
} from "./controller.js";
import { authenticate, checkRole, validateDto } from "./middleware.js";
import {
    ForgotPasswordDto,
    LoginDto,
    RefreshTokenDto,
    ResetPasswordDto,
    SignupDto,
    VerifyEmailDto
} from "./dto.js";

const router = Router();

router.post("/signup", validateDto(SignupDto), signupController);
router.post("/login", validateDto(LoginDto), loginController);
router.post("/verify-email", validateDto(VerifyEmailDto), verifyEmailController);
router.post("/forgot-password", validateDto(ForgotPasswordDto), sendResetPasswordTokenController);
router.post("/reset-password", validateDto(ResetPasswordDto), resetPasswordController);
router.post("/refresh-token", validateDto(RefreshTokenDto), refreshTokenController);
router.post("/logout", authenticate, checkRole(["admin", "user"]), logoutController);
router.get("/me", authenticate, checkRole(["admin", "user"]), getMeController);

export default router;
