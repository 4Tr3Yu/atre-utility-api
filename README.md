# Pinterest Scraper Service

This Node.js service uses Playwright to scrape images from Pinterest boards dynamically. It scrolls down the page to load more content if necessary, ensuring that the specified number of images is collected.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **Playwright**: The service uses Playwright for browser automation. Install Playwright via npm:

```bash
  npm install playwright
```
## API Routes

The scraper service exposes the following API routes:

```POST /api/scrape```
- Description: Scrapes a Pinterest board for a specified number of images.
- Request Body:
	- ```url``` (string): The Pinterest board URL to scrape, follow https://pinterest.com/```username``` , you can actually specify a ```/board``` here BUT **I havent tested what will happen if there are not enough pins to handle the requested amount**.
	- ```pins  ``` (number): The number of images to scrape.
- Response: A JSON array containing the scraped images with their src and alt attributes.


### Request Example

```bash
	POST /api/scrape HTTP/1.1
	Host: localhost:3000
	Content-Type: application/json

	{
		"url": "https://cl.pinterest.com/4tr3yumon/",
		"pins": 10
	}
```
### Response Example
```json
	{
		"result": [
			{
				"src": "https://i.pinimg.com/some-image-url.jpg",
				"alt": "Description of the image"
			},
			{
				"src": "https://i.pinimg.com/another-image-url.jpg",
				"alt": "Another description"
			}
			// ...more images
		]
	}
```

#### To Do
- Maybe add different enpoint to handle different kinds of boards
- Handle not enough pins in board
- Do something with the templates 