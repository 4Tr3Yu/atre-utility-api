import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data", "metagame");

const buildMetagameUrl = (format) =>
	`https://www.mtggoldfish.com/metagame/${format}/full#paper`;

const mtgMetagameScraperService = async (format) => {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext();
	const page = await context.newPage();
	const url = buildMetagameUrl(format);

	try {
		await page.goto(url, { waitUntil: "load" });
		await page.waitForLoadState("networkidle");

		// TODO: Add selectors for MTG Goldfish metagame page
		// The page structure has deck tiles with name and percentage
		// Example selectors (adjust based on actual page structure):
		const decks = await page.$$eval(
			".archetype-tile",
			(tiles) => {
				return tiles.map((tile) => {
					// TODO: Adjust these selectors based on actual page structure
					const nameEl = tile.querySelector(".archetype-tile-title");
					const percentEl = tile.querySelector(".archetype-tile-statistic");

					const name = nameEl?.textContent?.trim() || "Unknown";
					const percentText = percentEl?.textContent?.trim() || "0%";
					const percentage = parseFloat(percentText.replace("%", "")) || 0;

					return { name, percentage };
				});
			},
		);

		const result = {
			format,
			scrapedAt: new Date().toISOString(),
			decks,
		};

		// Save to JSON file
		const filePath = path.join(DATA_DIR, `${format}.json`);
		await fs.writeFile(filePath, JSON.stringify(result, null, 2), "utf-8");

		return result;
	} catch (error) {
		console.log("Error scraping MTG metagame: ", error);
		throw error;
	} finally {
		await browser.close();
	}
};

export const getMetagameFromFile = async (format) => {
	const filePath = path.join(DATA_DIR, `${format}.json`);
	try {
		const data = await fs.readFile(filePath, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		if (error.code === "ENOENT") {
			return null;
		}
		throw error;
	}
};

export default mtgMetagameScraperService;
