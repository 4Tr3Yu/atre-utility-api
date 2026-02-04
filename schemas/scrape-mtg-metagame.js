import Joi from "joi";

const schema = Joi.object({
	format: Joi.string()
		.valid("standard", "modern", "pioneer", "pauper", "legacy", "vintage")
		.required(),
});

export default schema;
