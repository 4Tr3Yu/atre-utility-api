import rutCheckService from "../services/rut-check-service.js";

const checkRut = async (req, res) => {
	const { body } = req;
	const { rut } = body;
	try {
		const result = await rutCheckService(rut);
		return res.status(200).json({ result });
	} catch (error) {
		console.log("Error from controller: ", error);
		return res.status(500).json({ error });
	}
};

export default { checkRut };
