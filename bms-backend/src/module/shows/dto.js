import Joi from "joi";
import BaseDto from "../../common/dto/base.js";

class ShowIdParamDto extends BaseDto {
    static schema = Joi.object({
        showId: Joi.number().integer().positive().required()
    });
}

export {
    ShowIdParamDto
};
