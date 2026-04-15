import Joi from "joi";
import BaseDto from "../../common/dto/base.js";

class CreateMovieDto extends BaseDto {
    static schema = Joi.object({
        title: Joi.string().trim().min(2).max(120).required(),
        description: Joi.string().trim().max(1500).allow("").default(""),
        posterUrl: Joi.string().trim().uri().allow("").default(""),
        language: Joi.string().trim().min(2).max(50).default("Hindi"),
        genre: Joi.string().trim().min(2).max(80).default("Drama"),
        durationMinutes: Joi.number().integer().min(30).max(400).required(),
        startDate: Joi.date().iso().required(),
        endDate: Joi.date().iso().required(),
        showPrice: Joi.number().min(1).max(5000).default(250)
    });
}

export {
    CreateMovieDto
};
