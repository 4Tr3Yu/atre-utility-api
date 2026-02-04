import cron from "node-cron";
import mtgMetagameScraperService from "../services/mtg-metagame-scraper-service.js";

// Formats to scrape on cron schedule
const FORMATS_TO_SCRAPE = ["standard", "modern"];

// Cron schedule: Every Sunday at 3:00 AM
// Format: minute hour day-of-month month day-of-week
// 0 3 * * 0 = At 03:00 on Sunday
const CRON_SCHEDULE = process.env.METAGAME_CRON_SCHEDULE || "0 3 * * 0";

const scrapeAllFormats = async () => {
	console.log(`[Cron] Starting metagame scrape at ${new Date().toISOString()}`);

	for (const format of FORMATS_TO_SCRAPE) {
		try {
			console.log(`[Cron] Scraping ${format}...`);
			await mtgMetagameScraperService(format);
			console.log(`[Cron] ${format} scraped successfully`);
		} catch (error) {
			console.error(`[Cron] Error scraping ${format}:`, error.message);
		}
	}

	console.log(`[Cron] Metagame scrape completed at ${new Date().toISOString()}`);
};

// Schedule the cron job
cron.schedule(CRON_SCHEDULE, scrapeAllFormats);

console.log(`[Cron] Metagame cron job scheduled: ${CRON_SCHEDULE}`);
console.log(`[Cron] Formats to scrape: ${FORMATS_TO_SCRAPE.join(", ")}`);

export default scrapeAllFormats;
