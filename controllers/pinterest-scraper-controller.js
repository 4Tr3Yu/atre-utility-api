import scraperService from "../services/pinterest-scraper-services.js";

const scrape = async (req, res) => {
	const { body } = req;
	const { url, pins } = body;
	try {
		const result = await scraperService(url, pins);
		return res.status(200).json({ result });
	} catch (error) {
		return res.status(500).json({ error });
	}
};

const docs = (req, res) => {
	res.render("layout", {
		title: "API Documentation",
	});
};

export default { scrape, docs };
