import Joi from "joi";
const schema = Joi.object({
	url: Joi.string().uri().required(),
	pins: Joi.number().integer().required(),
});

export default schema;
