import fs from "node:fs/promises";
import path from "path";
import { chromium } from "playwright";
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
		await page.goto(url, { waitUntil: "domcontentloaded" });
		await page.waitForSelector(".archetype-tile", { timeout: 30000 });

		const decks = await page.$$eval(".archetype-tile", (tiles) => {
			return tiles.map((tile) => {
				const nameEl = tile.querySelector(
					".archetype-tile-title .deck-price-paper a",
				);
				const percentEl = tile.querySelector(
					".metagame-percentage .archetype-tile-statistic-value",
				);
				const countEl = tile.querySelector(
					".archetype-tile-statistic-value-extra-data",
				);
				const colorEls = tile.querySelectorAll(".manacost i");
				const cardEls = tile.querySelectorAll(
					".archetype-tile-description ul li",
				);
				const imageEl = tile.querySelector(".card-image-tile");
				const linkEl = tile.querySelector(".card-image-tile-link-overlay");

				const name = nameEl?.textContent?.trim() || "Unknown";
				const percentText =
					percentEl?.childNodes[0]?.textContent?.trim() || "0%";
				const percentage = Number.parseFloat(percentText.replace("%", "")) || 0;

				const countText = countEl?.textContent?.trim() || "(0)";
				const count = Number.parseInt(countText.replace(/[()]/g, ""), 10) || 0;

				const colorMap = {
					"ms-w": "W",
					"ms-u": "U",
					"ms-b": "B",
					"ms-r": "R",
					"ms-g": "G",
				};
				const colors = Array.from(colorEls)
					.map((el) => {
						for (const [cls, color] of Object.entries(colorMap)) {
							if (el.classList.contains(cls)) return color;
						}
						return null;
					})
					.filter(Boolean);

				const keyCards = Array.from(cardEls).map(
					(el) => el.textContent?.trim() || "",
				);

				const imageStyle = imageEl?.getAttribute("style") || "";
				const imageMatch = imageStyle.match(/url\(['"]?([^'"]+)['"]?\)/);
				const image = imageMatch ? imageMatch[1] : null;

				const archetypeUrl = linkEl?.getAttribute("href") || null;

				return {
					name,
					percentage,
					count,
					colors,
					keyCards,
					image,
					archetypeUrl,
				};
			});
		});

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
		const parsed = JSON.parse(data);

		// Filter out count, image, and archetypeUrl from response
		const decks = parsed.decks.map(({ count, image, archetypeUrl, ...rest }) => rest);

		return { ...parsed, decks };
	} catch (error) {
		if (error.code === "ENOENT") {
			return null;
		}
		throw error;
	}
};

export default mtgMetagameScraperService;
