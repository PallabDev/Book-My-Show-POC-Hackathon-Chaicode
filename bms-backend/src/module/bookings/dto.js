import Joi from "joi";
import BaseDto from "../../common/dto/base.js";

class BookSeatDto extends BaseDto {
    static schema = Joi.object({
        showId: Joi.number().integer().positive().required(),
        seatLabel: Joi.string().trim().uppercase().pattern(/^[A-E](10|[1-9])$/).required()
    });
}

export {
    BookSeatDto
};
