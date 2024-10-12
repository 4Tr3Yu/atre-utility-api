import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import scraperRoutes from "./routes/scraper-routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", scraperRoutes);
app.get("/", (req, res) => {
	res.redirect("/api/docs");
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
