import Joi from "joi";
import BaseDto from "../../common/dto/base.js";

class SignupDto extends BaseDto {
    static schema = Joi.object({
        firstName: Joi.string().trim().min(2).max(50).required(),
        lastName: Joi.string().trim().min(1).max(50).required(),
        email: Joi.string().trim().email().required(),
        password: Joi.string().min(6).max(100).required()
    });
}

class LoginDto extends BaseDto {
    static schema = Joi.object({
        email: Joi.string().trim().email().required(),
        password: Joi.string().min(6).max(100).required()
    });
}

class VerifyEmailDto extends BaseDto {
    static schema = Joi.object({
        token: Joi.string().trim().required()
    });
}

class ForgotPasswordDto extends BaseDto {
    static schema = Joi.object({
        email: Joi.string().trim().email().required()
    });
}

class ResetPasswordDto extends BaseDto {
    static schema = Joi.object({
        token: Joi.string().trim().required(),
        password: Joi.string().min(6).max(100).required()
    });
}

class RefreshTokenDto extends BaseDto {
    static schema = Joi.object({
        refreshToken: Joi.string().trim().optional()
    });
}

export {
    SignupDto,
    LoginDto,
    VerifyEmailDto,
    ForgotPasswordDto,
    ResetPasswordDto,
    RefreshTokenDto
};
