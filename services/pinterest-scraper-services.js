import { chromium } from "playwright";

const scraperService = async (url, pins) => {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext();
	const page = await context.newPage();
	let latestImages = [];
	try {
		await page.goto(url, { waitUntil: "load" });

		// This way is for scrolling down to get more images, need to test it -> it was good
		while (latestImages.length < pins) {
			const collectedImages = await page.$$eval(
				'div[data-test-id="feed"] div[data-grid-item-idx]',
				(images) => {
					return images.map((img) => {
						const imgData = {
							src: img.querySelector("img").getAttribute("src"),
							alt: img.querySelector("img").getAttribute("alt"),
						};
						return imgData;
					});
				},
			);

			latestImages = [...latestImages, ...collectedImages];

			if (latestImages.length >= pins) break;

			await page.evaluate(() => {
				window.scrollBy(0, window.innerHeight);
			});

			await page.waitForTimeout(2000);
		}

		// no scroll way -> it was good only when elements are loaded at the begining of the page -> keeept it here for reference

		/* const resolveContanerSelector = (number) =>
			`div[data-test-id="feed"] div[data-grid-item-idx="${number}"]`; */

		/* for (let i = 0; i < pins; i++) {
			const selector = resolveContanerSelector(i);
			await page.waitForSelector(selector, { state: "visible" });
			const img = await page.$(`${selector} img`);
			const imgData = {
				src: await img.getAttribute("src"),
				alt: await img.getAttribute("alt"),
			};
			latestImages.push(imgData);
		} */

		await browser.close();
		return latestImages;
	} catch (error) {
		console.log("Error: ", error);
		return error;
	}
};

export default scraperService;
