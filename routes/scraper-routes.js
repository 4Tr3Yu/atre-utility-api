import { Router } from "express";
import scraperController from "../controllers/scraper-controller.js";
import { validateBodyMiddleware } from "../middlewares/validate-body-midddleware.js";
const router = Router();

router.post("/scrape", validateBodyMiddleware, scraperController.scrape);
router.get("/docs", scraperController.docs);

export default router;
