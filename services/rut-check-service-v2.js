import { chromium } from "playwright";

const rutificadorURL = "https://www.rutificador.co/rut/buscar/?f=";

const rutCheckService = async (rut) => {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext();
	const page = await context.newPage();
	const rutURL = rutificadorURL + rut;
	try {
		await page.goto(rutURL, { waitUntil: "load" });
		const blockedUrls = [
			"https://sympathizecrewfrugality.com",
			"https://www.google-analytics.com",
			"https://cdn.creative-stat1.com",
			"https://cdn.show-sb.com",
			"https://blissfulmass.com",
			"https://thimblehaltedbounce.com",
			"https://www.googletagservices.com",
			"https://venomouslife.com",
			"https://bulkconflictpeculiarities.com",
			"https://zodiacdinner.com",
			"https://cdn.creative-stat1.com",
			"https://unitedlawsfriendship.com",
			"https://static.cloudflareinsights.com",
			"https://bobpiety.com",
			"https://proftrafficcounter.com/stats",
			"https://unseenreport.com",
			"https://capaciousdrewreligion.com",
			"https://www.googletagmanager.com",
			"https://recordedthereby.com",
			"https://universaltrout.com",
			"https://epochheelbiography.com",
			"sbar.",
			"ntv.",
			"ads.",
			"ads-",
			"https://unseenreport.com",
			"pxf.",
			"cdn.",
			"ren.",
			"impr.",
		];

		await page.route("**/*", (route) => {
			const url = route.request().url();
			if (blockedUrls.some((blockedUrl) => url.includes(blockedUrl))) {
				route.abort(); // Block the request
			} else {
				route.continue(); // Allow the request
			}
		});

		await page.waitForLoadState("networkidle");
		console.log("Page loaded");
		// await page.waitForSelector("tbody.rs>tr>td");
		const name = await page.$eval("tbody.rs>tr>td", (el) => el.textContent);
		console.log("eval complete");
		const nameParts = name.split(" ");
		return {
			full: name,
			first: nameParts[2],
			last: nameParts[0],
			middle: nameParts[3],
			secondLast: nameParts[1],
		};
	} catch (error) {
		console.log("Error: ", error);
		return error;
	} finally {
		await browser.close();
	}
};

export default rutCheckService;
