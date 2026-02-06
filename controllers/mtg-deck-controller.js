import {
	scrapeDeck,
	scrapeTopDecks,
	scrapeAllDecksForFormat,
	getDeckFromFile,
	listDecksForFormat,
	getDeckHistory,
} from "../services/mtg-deck-scraper-service.js";

const VALID_FORMATS = [
	"standard",
	"modern",
	"pioneer",
	"pauper",
	"legacy",
	"vintage",
];

const scrape = async (req, res) => {
	const { archetypeUrl, format, limit } = req.body;

	try {
		let result;

		if (archetypeUrl) {
			// Scrape single deck by URL
			result = await scrapeDeck(archetypeUrl);
		} else if (format && limit) {
			// Scrape top N decks from format
			result = await scrapeTopDecks(format, limit);
		} else if (format) {
			// Scrape all decks from format
			result = await scrapeAllDecksForFormat(format);
		}

		return res.status(200).json({ result });
	} catch (error) {
		console.log("Error from MTG deck controller: ", error);
		return res.status(500).json({ error: error.message || "Scraping failed" });
	}
};

const getDeck = async (req, res) => {
	const { format, deckSlug } = req.params;
	const { date } = req.query;

	if (!VALID_FORMATS.includes(format)) {
		return res.status(400).json({
			error: `Invalid format. Valid formats: ${VALID_FORMATS.join(", ")}`,
		});
	}

	try {
		const result = await getDeckFromFile(format, deckSlug, date);
		if (!result) {
			return res.status(404).json({
				error: `No deck data found for ${format}/${deckSlug}. Run the scraper first.`,
			});
		}
		return res.status(200).json({ result });
	} catch (error) {
		console.log("Error reading deck file: ", error);
		return res.status(500).json({ error: error.message || "Read failed" });
	}
};

const listDecks = async (req, res) => {
	const { format } = req.params;

	if (!VALID_FORMATS.includes(format)) {
		return res.status(400).json({
			error: `Invalid format. Valid formats: ${VALID_FORMATS.join(", ")}`,
		});
	}

	try {
		const decks = await listDecksForFormat(format);
		return res.status(200).json({ result: { format, decks } });
	} catch (error) {
		console.log("Error listing decks: ", error);
		return res.status(500).json({ error: error.message || "List failed" });
	}
};

const getHistory = async (req, res) => {
	const { format, deckSlug } = req.params;

	if (!VALID_FORMATS.includes(format)) {
		return res.status(400).json({
			error: `Invalid format. Valid formats: ${VALID_FORMATS.join(", ")}`,
		});
	}

	try {
		const dates = await getDeckHistory(format, deckSlug);
		if (dates.length === 0) {
			return res.status(404).json({
				error: `No history found for ${format}/${deckSlug}. Run the scraper first.`,
			});
		}
		return res.status(200).json({ result: { format, deckSlug, dates } });
	} catch (error) {
		console.log("Error getting deck history: ", error);
		return res.status(500).json({ error: error.message || "History failed" });
	}
};

export default { scrape, getDeck, listDecks, getHistory };
