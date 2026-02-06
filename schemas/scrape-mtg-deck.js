import Joi from "joi";

const schema = Joi.object({
	// Option 1: Scrape by direct URL
	archetypeUrl: Joi.string()
		.pattern(/^\/archetype\/[a-z0-9-]+$/)
		.optional(),

	// Option 2: Scrape by format (with optional limit)
	format: Joi.string()
		.valid("standard", "modern", "pioneer", "pauper", "legacy", "vintage")
		.optional(),

	limit: Joi.number().integer().min(1).max(100).optional(),
})
	.or("archetypeUrl", "format") // At least one must be provided
	.with("limit", "format"); // limit requires format

export default schema;
