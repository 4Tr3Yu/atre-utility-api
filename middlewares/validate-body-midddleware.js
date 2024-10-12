import { setResponseRaw } from "../util/common-response.js";

function sendErrorResponse(res, e) {
	const jsonResp = { status: "Error in validateBodyMiddleware", error: e };
	return setResponseRaw(res, 400, jsonResp);
}

export const validateBodyMiddleware = async (req, res, next) => {
	console.log(req.path);
	const schemaPath = req.path.split("/").slice(1, 3).join("-");
	const schemaModule = await import(`../schemas/${schemaPath}.js`);
	const schema = schemaModule.default;
	const { error } = schema.validate(req.body);

	if (error) {
		return sendErrorResponse(res, error.details[0].message);
	}

	next();
};
