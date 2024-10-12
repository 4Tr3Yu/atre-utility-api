import Joi from "joi";
import { setResponseRaw } from "../util/common-response.js";

function sendErrorResponse(res, e) {
	const jsonResp = { status: "Error in validateBodyMiddleware", error: e };
	return setResponseRaw(res, 400, jsonResp);
}

const schema = Joi.object({
	url: Joi.string().uri().required(),
	pins: Joi.number().required(),
});

export const validateBodyMiddleware = (req, res, next) => {
	const { error } = schema.validate(req.body);

	if (error) {
		return sendErrorResponse(res, error.details[0].message);
	}

	next();
};
