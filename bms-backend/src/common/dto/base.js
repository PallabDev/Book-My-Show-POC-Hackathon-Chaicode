import Joi from "joi";

class BaseDto {
    static schema = Joi.object({})
    static validate(data) {
        const { error, value } = this.schema.validate(data, { abortEarly: false, stripUnknown: true });
        if (error) {
            const errorMessages = error.details.map((detail) => detail.message)
            return { error: errorMessages, value: null }
        }
        return { error: null, value }

    }
}
export default BaseDto;