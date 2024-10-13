import { chromium } from "playwright";

const loginURL = process.env.LOGIN_URL ? process.env.LOGIN_URL : "";
const onlineServicesURL = process.env.ONLINE_SERVICES_URL
	? process.env.ONLINE_SERVICES_URL
	: "";
const dteURL = process.env.DTE_URL ? process.env.DTE_URL : "";
const user = process.env.USER ? process.env.USER : "";
const password = process.env.PASSWORD ? process.env.PASSWORD : "";

const rutCheckService = async (rut) => {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext();
	const page = await context.newPage();
	try {
		await page.goto(loginURL, { waitUntil: "load" });
		await page.fill("#rutcntr", user);
		await page.fill("#clave", password);
		await page.click("#bt_ingresar");
		await page.goto(onlineServicesURL, { waitUntil: "load" });
		await page.goto(dteURL, { waitUntil: "load" });

		console.log("logged in");

		await page.fill("#EFXP_RUT_RECEP", rut.split("-")[0]);
		console.log("filled rut");
		await page.fill("#EFXP_DV_RECEP", rut.split("-")[1]);
		console.log("filled dv");
		await page.keyboard.press("Tab");
		console.log("pressed tab");
		await page.waitForResponse(
			(response) =>
				response
					.url()
					.includes(
						"https://siteintercept.qualtrics.com/WRSiteInterceptEngine/Targeting.php?Q_ZoneID=ZN_d7pgyLBlORbDEfs&Q_CLIENTVERSION=2.16.3&Q_CLIENTTYPE=web",
					) && response.status() === 200,
		);

		await page.waitForLoadState("networkidle");
		await page.waitForSelector('[name="EFXP_RZN_SOC_RECEP"]:not([value=""])');
		const name = await page.$eval(
			'[name="EFXP_RZN_SOC_RECEP"]',
			(el) => el.value,
		);
		console.log("name: ", name);
		return { name: name };
	} catch (error) {
		console.log("Error: ", error);
		return error;
	} finally {
		await browser.close();
	}
};

export default rutCheckService;
