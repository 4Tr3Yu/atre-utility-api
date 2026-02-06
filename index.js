import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import apiRoutes from "./routes/api-routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api", apiRoutes);
app.get("/", (req, res) => {
	res.redirect("/api/docs");
});

// Optional: Enable metagame cron job via environment variable
if (process.env.ENABLE_METAGAME_CRON === "true") {
	import("./cron/metagame-cron.js");
}

// Optional: Enable deck cron job via environment variable
if (process.env.ENABLE_DECK_CRON === "true") {
	import("./cron/deck-cron.js");
}

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
