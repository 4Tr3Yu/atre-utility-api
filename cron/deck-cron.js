import cron from "node-cron";
import { scrapeTopDecks } from "../services/mtg-deck-scraper-service.js";

// Formats to scrape on cron schedule
const FORMATS_TO_SCRAPE = ["standard", "modern"];

// Number of top decks to scrape per format
const DECKS_PER_FORMAT = 10;

// Cron schedule: Every Sunday at 4:00 AM (after metagame cron at 3:00 AM)
// Format: minute hour day-of-month month day-of-week
// 0 4 * * 0 = At 04:00 on Sunday
const CRON_SCHEDULE = process.env.DECK_CRON_SCHEDULE || "0 4 * * 0";

const scrapeAllFormatDecks = async () => {
	console.log(`[Deck Cron] Starting deck scrape at ${new Date().toISOString()}`);

	for (const format of FORMATS_TO_SCRAPE) {
		try {
			console.log(`[Deck Cron] Scraping top ${DECKS_PER_FORMAT} ${format} decks...`);
			const { results, errors } = await scrapeTopDecks(format, DECKS_PER_FORMAT);
			console.log(
				`[Deck Cron] ${format}: ${results.length} successful, ${errors.length} failed`,
			);
		} catch (error) {
			console.error(`[Deck Cron] Error scraping ${format}:`, error.message);
		}
	}

	console.log(`[Deck Cron] Deck scrape completed at ${new Date().toISOString()}`);
};

// Schedule the cron job
cron.schedule(CRON_SCHEDULE, scrapeAllFormatDecks);

console.log(`[Deck Cron] Deck cron job scheduled: ${CRON_SCHEDULE}`);
console.log(`[Deck Cron] Formats to scrape: ${FORMATS_TO_SCRAPE.join(", ")}`);
console.log(`[Deck Cron] Decks per format: ${DECKS_PER_FORMAT}`);

export default scrapeAllFormatDecks;
