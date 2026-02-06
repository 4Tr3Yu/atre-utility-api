import fs from "node:fs/promises";
import path from "path";
import { chromium } from "playwright";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data", "decks");
const METAGAME_DIR = path.join(__dirname, "..", "data", "metagame");

const BASE_URL = "https://www.mtggoldfish.com";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
const RATE_LIMIT_DELAY_MS = 2000;

/**
 * Converts archetype URL to deck slug
 * "/archetype/standard-simic-ouroboroid-woe" -> "simic-ouroboroid"
 */
function archetypeUrlToSlug(archetypeUrl) {
	// Extract path segment after /archetype/
	const pathSegment = archetypeUrl.replace("/archetype/", "");
	// Remove format prefix (e.g., "standard-") and set suffix (e.g., "-woe")
	const match = pathSegment.match(/^[a-z]+-(.+?)(?:-[a-z]{3})?$/);
	return match ? match[1] : pathSegment;
}

/**
 * Parses deck text from the hidden input
 */
function parseDeckInput(deckText) {
	const lines = deckText.trim().split("\n");
	const mainboard = [];
	const sideboard = [];
	let isSideboard = false;

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;

		if (trimmed.toLowerCase() === "sideboard") {
			isSideboard = true;
			continue;
		}

		const match = trimmed.match(/^(\d+)\s+(.+)$/);
		if (match) {
			const card = {
				quantity: Number.parseInt(match[1], 10),
				name: match[2]
					.replace(/&#39;/g, "'")
					.replace(/&amp;/g, "&")
					.trim(),
			};

			if (isSideboard) {
				sideboard.push(card);
			} else {
				mainboard.push(card);
			}
		}
	}

	return { mainboard, sideboard };
}

/**
 * Ensures the deck directory exists
 */
async function ensureDeckDirectory(format, deckSlug) {
	const dirPath = path.join(DATA_DIR, format, deckSlug);
	await fs.mkdir(dirPath, { recursive: true });
	return dirPath;
}

/**
 * Scrapes a single deck with retry logic
 */
async function scrapeWithRetry(archetypeUrl, retries = MAX_RETRIES) {
	let lastError;

	for (let attempt = 1; attempt <= retries; attempt++) {
		try {
			return await performScrape(archetypeUrl);
		} catch (error) {
			lastError = error;
			console.error(
				`[Deck Scraper] Attempt ${attempt}/${retries} failed for ${archetypeUrl}:`,
				error.message,
			);

			if (attempt < retries) {
				await new Promise((resolve) =>
					setTimeout(resolve, RETRY_DELAY_MS * attempt),
				);
			}
		}
	}

	throw lastError;
}

/**
 * Performs the actual scraping of a deck page
 */
async function performScrape(archetypeUrl) {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext();
	const page = await context.newPage();
	const fullUrl = `${BASE_URL}${archetypeUrl}`;

	try {
		await page.goto(fullUrl, { waitUntil: "domcontentloaded" });
		// Wait for the hidden input to be attached (not visible)
		await page.waitForSelector("#deck_input_deck", {
			timeout: 30000,
			state: "attached",
		});

		// Extract deck list from hidden input
		const deckText = await page.$eval("#deck_input_deck", (el) => el.value);
		const { mainboard, sideboard } = parseDeckInput(deckText);

		// Extract format
		const format = await page.$eval(
			"#deck_input_format",
			(el) => el.value,
		);

		// Extract metadata from header
		const metadata = await page.evaluate(() => {
			const titleEl = document.querySelector(".title");
			const authorEl = titleEl?.querySelector(".author");
			const infoEl = document.querySelector(".deck-container-information");

			const name = titleEl?.childNodes[0]?.textContent?.trim() || "Unknown";
			const author =
				authorEl?.textContent?.replace("by ", "").trim() || "Unknown";

			// Parse deck info text
			const infoText = infoEl?.textContent || "";
			const dateMatch = infoText.match(/Deck Date:\s*(.+?)(?:\n|$)/);
			const eventMatch = infoText.match(/Event:\s*(.+?),\s*(\d+\w*\s*Place)/);
			const recordMatch = infoText.match(/(\d+-\d+-\d+|\d+-\d+)/);

			// Extract deck ID from edit link
			const editLink = document.querySelector('a[href*="/deck/"]');
			const deckIdMatch = editLink?.href?.match(/\/deck\/(\d+)/);

			return {
				name,
				author,
				date: dateMatch ? dateMatch[1].trim() : null,
				event: eventMatch ? eventMatch[1].trim() : null,
				placement: eventMatch ? eventMatch[2].trim() : null,
				record: recordMatch ? recordMatch[1] : null,
				deckId: deckIdMatch ? deckIdMatch[1] : null,
			};
		});

		// Extract archetype breakdown
		const breakdown = await page.evaluate(() => {
			const result = { creatures: [], spells: [], lands: [], sideboard: [] };
			const containers = document.querySelectorAll(".spoiler-card-container");

			for (const container of containers) {
				const header = container.querySelector("h3");
				const category = header?.textContent?.toLowerCase().trim() || "";
				const cards = container.querySelectorAll(".spoiler-card");

				const categoryKey =
					{
						creatures: "creatures",
						spells: "spells",
						lands: "lands",
						sideboard: "sideboard",
					}[category] || "spells";

				for (const card of cards) {
					const nameEl = card.querySelector(".price-card-invisible-label");
					const statsEl = card.querySelector(
						".archetype-breakdown-featured-card-text",
					);

					const name = nameEl?.textContent?.trim() || "";
					const statsText = statsEl?.textContent?.trim() || "";
					const match = statsText.match(/([\d.]+)\s+in\s+(\d+)%\s+of decks/);

					if (name && match) {
						result[categoryKey].push({
							name,
							avgQuantity: Number.parseFloat(match[1]),
							percentOfDecks: Number.parseInt(match[2], 10),
						});
					}
				}
			}

			return result;
		});

		// Extract prices
		const prices = await page.evaluate(() => {
			const paperEl = document.querySelector(".deck-price-v2.paper");
			const onlineEl = document.querySelector(".deck-price-v2.online");

			const paperDollars =
				paperEl?.querySelector(".dollars")?.textContent || "0";
			const paperCents =
				paperEl?.querySelector(".cents")?.textContent?.replace(".", "") || "0";
			const onlineTix = onlineEl?.textContent?.match(/([\d.]+)\s*tix/);

			return {
				paper: Number.parseFloat(`${paperDollars}.${paperCents}`),
				online: onlineTix ? Number.parseFloat(onlineTix[1]) : 0,
			};
		});

		const deckSlug = archetypeUrlToSlug(archetypeUrl);
		const today = new Date().toISOString().split("T")[0];

		const deckData = {
			format,
			archetypeSlug: deckSlug,
			scrapedAt: new Date().toISOString(),
			metadata: {
				...metadata,
				sourceUrl: archetypeUrl,
			},
			mainboard,
			sideboard,
			breakdown,
			prices,
		};

		// Save to file
		const dirPath = await ensureDeckDirectory(format, deckSlug);
		const filePath = path.join(dirPath, `${today}.json`);
		await fs.writeFile(filePath, JSON.stringify(deckData, null, 2), "utf-8");

		console.log(`[Deck Scraper] Saved ${deckSlug} to ${filePath}`);

		return deckData;
	} finally {
		await browser.close();
	}
}

/**
 * Reads metagame data directly from file (including internal fields)
 */
async function getMetagameDataInternal(format) {
	const filePath = path.join(METAGAME_DIR, `${format}.json`);
	try {
		const data = await fs.readFile(filePath, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		if (error.code === "ENOENT") {
			return null;
		}
		throw error;
	}
}

/**
 * Scrapes a single deck from an archetype URL
 */
export async function scrapeDeck(archetypeUrl) {
	console.log(`[Deck Scraper] Starting scrape for ${archetypeUrl}`);
	return scrapeWithRetry(archetypeUrl);
}

/**
 * Scrapes top N decks from a format using saved metagame data
 */
export async function scrapeTopDecks(format, limit = 10) {
	const metagameData = await getMetagameDataInternal(format);
	if (!metagameData) {
		throw new Error(
			`No metagame data found for ${format}. Run metagame scraper first.`,
		);
	}

	const decksToScrape = metagameData.decks.slice(0, limit);
	console.log(
		`[Deck Scraper] Scraping top ${decksToScrape.length} decks for ${format}`,
	);

	const results = [];
	const errors = [];

	for (const deck of decksToScrape) {
		if (deck.archetypeUrl) {
			try {
				console.log(`[Deck Scraper] Scraping ${deck.name}...`);
				const result = await scrapeDeck(deck.archetypeUrl);
				results.push(result);
				// Rate limiting delay between requests
				await new Promise((resolve) =>
					setTimeout(resolve, RATE_LIMIT_DELAY_MS),
				);
			} catch (error) {
				console.error(
					`[Deck Scraper] Failed to scrape ${deck.name}:`,
					error.message,
				);
				errors.push({ deck: deck.name, error: error.message });
			}
		}
	}

	console.log(
		`[Deck Scraper] Completed: ${results.length} successful, ${errors.length} failed`,
	);

	return { results, errors };
}

/**
 * Scrapes all decks from a format
 */
export async function scrapeAllDecksForFormat(format) {
	const metagameData = await getMetagameDataInternal(format);
	if (!metagameData) {
		throw new Error(
			`No metagame data found for ${format}. Run metagame scraper first.`,
		);
	}
	return scrapeTopDecks(format, metagameData.decks.length);
}

/**
 * Gets deck data from file storage
 */
export async function getDeckFromFile(format, deckSlug, date = null) {
	const dirPath = path.join(DATA_DIR, format, deckSlug);

	try {
		if (date) {
			const filePath = path.join(dirPath, `${date}.json`);
			const data = await fs.readFile(filePath, "utf-8");
			return JSON.parse(data);
		}

		// Get latest file (sorted descending by name = date)
		const files = await fs.readdir(dirPath);
		const jsonFiles = files.filter((f) => f.endsWith(".json")).sort().reverse();

		if (jsonFiles.length === 0) return null;

		const filePath = path.join(dirPath, jsonFiles[0]);
		const data = await fs.readFile(filePath, "utf-8");
		return JSON.parse(data);
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
}

/**
 * Lists all available decks for a format
 */
export async function listDecksForFormat(format) {
	const formatDir = path.join(DATA_DIR, format);

	try {
		const entries = await fs.readdir(formatDir, { withFileTypes: true });
		return entries.filter((e) => e.isDirectory()).map((e) => e.name);
	} catch (error) {
		if (error.code === "ENOENT") return [];
		throw error;
	}
}

/**
 * Gets all dated snapshots for a deck
 */
export async function getDeckHistory(format, deckSlug) {
	const dirPath = path.join(DATA_DIR, format, deckSlug);

	try {
		const files = await fs.readdir(dirPath);
		const dates = files
			.filter((f) => f.endsWith(".json"))
			.map((f) => f.replace(".json", ""))
			.sort()
			.reverse();

		return dates;
	} catch (error) {
		if (error.code === "ENOENT") return [];
		throw error;
	}
}

export default scrapeDeck;
