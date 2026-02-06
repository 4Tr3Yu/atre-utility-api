import { Router } from "express";
import pinterestScraperController from "../controllers/pinterest-scraper-controller.js";
import rutCheckerController from "../controllers/rut-check-controller.js";
import mtgMetagameController from "../controllers/mtg-metagame-controller.js";
import mtgDeckController from "../controllers/mtg-deck-controller.js";
import { validateBodyMiddleware } from "../middlewares/validate-body-midddleware.js";
const router = Router();

router.post(
	"/scrape/pinterest",
	validateBodyMiddleware,
	pinterestScraperController.scrape,
);

router.post(
	"/scrape/rut",

	rutCheckerController.checkRut,
);

router.post(
	"/scrape/mtg-metagame",
	validateBodyMiddleware,
	mtgMetagameController.scrape,
);

router.get("/metagame/:format", mtgMetagameController.getMetagame);

// MTG Deck routes
router.post(
	"/scrape/mtg-deck",
	validateBodyMiddleware,
	mtgDeckController.scrape,
);
router.get("/deck/:format/:deckSlug", mtgDeckController.getDeck);
router.get("/deck/:format/:deckSlug/history", mtgDeckController.getHistory);
router.get("/decks/:format", mtgDeckController.listDecks);

router.get("/docs", pinterestScraperController.docs);

export default router;
