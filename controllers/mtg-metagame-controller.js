import mtgMetagameScraperService, {
	getMetagameFromFile,
} from "../services/mtg-metagame-scraper-service.js";

const VALID_FORMATS = [
	"standard",
	"modern",
	"pioneer",
	"pauper",
	"legacy",
	"vintage",
];

const scrape = async (req, res) => {
	const { format } = req.body;
	try {
		const result = await mtgMetagameScraperService(format);
		return res.status(200).json({ result });
	} catch (error) {
		console.log("Error from MTG metagame controller: ", error);
		return res.status(500).json({ error: error.message || "Scraping failed" });
	}
};

const getMetagame = async (req, res) => {
	const { format } = req.params;

	if (!VALID_FORMATS.includes(format)) {
		return res.status(400).json({
			error: `Invalid format. Valid formats: ${VALID_FORMATS.join(", ")}`,
		});
	}

	try {
		const result = await getMetagameFromFile(format);
		if (!result) {
			return res.status(404).json({
				error: `No metagame data found for ${format}. Run the scraper first.`,
			});
		}
		return res.status(200).json({ result });
	} catch (error) {
		console.log("Error reading metagame file: ", error);
		return res.status(500).json({ error: error.message || "Read failed" });
	}
};

export default { scrape, getMetagame };
