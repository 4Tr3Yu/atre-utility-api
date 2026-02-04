# Personal Utility Endpoint

This Node.js service uses Playwright to scrape images from Pinterest boards dynamically. It scrolls down the page to load more content if necessary, ensuring that the specified number of images is collected.

**Production URL:** https://atre-utility-api-production.up.railway.app

## Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **Playwright**: The service uses Playwright for browser automation. Install Playwright via npm:

```bash
npm install playwright
```
Comands for installing browser:
```bash
npx playwright install
```

```bash
sudo npx playwright install-deps
```
Alternatively, use apt:   
```bash                           
sudo apt-get install libatk1.0-0t64\             
	libatk-bridge2.0-0t64\                       
	libcups2t64\                                 
	libxdamage1\                                 
	libpango-1.0-0\                              
	libcairo2\                                   
	libasound2t64\                               
	libatspi2.0-0t64  
 ```
## API Routes

### Pinterest
```POST /api/scrape/pinterest```
- Description: Scrapes a Pinterest board for a specified number of images.
- Request Body:
	- ```url``` (string): The Pinterest board URL to scrape, follow https://pinterest.com/```username``` , you can actually specify a ```/board``` here BUT **I havent tested what will happen if there are not enough pins to handle the requested amount**.
	- ```pins  ``` (number): The number of images to scrape.
- Response: A JSON array containing the scraped images with their src and alt attributes.

### RUT
```POST /api/scrape/rut```
- Description: Returns name of the person when given the RUT number.
- Request Body:
	- ```rut``` (string): Chilean RUT number
- Response: JSON with name parts (full, first, last, middle, secondLast).

### MTG Metagame
```POST /api/scrape/mtg-metagame```
- Description: Scrapes MTG Goldfish for current metagame archetypes and saves to JSON.
- Request Body:
	- ```format``` (string): MTG format - standard, modern, pioneer, pauper, legacy, vintage
- Response: JSON with format, scrapedAt timestamp, and array of decks:
```json
{
  "format": "standard",
  "scrapedAt": "2024-02-04T12:00:00.000Z",
  "decks": [
    {
      "name": "Simic Ouroboroid",
      "percentage": 14.7,
      "count": 839,
      "colors": ["U", "G"],
      "keyCards": ["Ouroboroid", "Badgermole Cub", "Quantum Riddler"],
      "image": "https://cdn1.mtggoldfish.com/images/h/Ouroboroid-EOE-672.jpg",
      "archetypeUrl": "/archetype/standard-simic-ouroboroid-woe"
    }
  ]
}
```

```GET /api/metagame/:format```
- Description: Returns saved metagame data for a given format.
- URL Parameter:
	- ```format``` (string): MTG format - standard, modern, pioneer, pauper, legacy, vintage
- Response: Same as scraper response (reads from saved JSON file).

#### Cron Job
The metagame scraper can run automatically on a schedule. To enable:
```env
ENABLE_METAGAME_CRON=true
```
Default schedule: Every Sunday at 3:00 AM (configurable via `METAGAME_CRON_SCHEDULE`).

#### To Do

- Do something with the templates
- Complete MTG Goldfish selectors for scraping
