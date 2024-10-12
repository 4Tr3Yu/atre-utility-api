import Joi from "joi";
const schema = Joi.object({
	rut: Joi.string().required(),
});

export default schema;
