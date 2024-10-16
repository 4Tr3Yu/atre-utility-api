# Personal Utility Enpoint

This Node.js service uses Playwright to scrape images from Pinterest boards dynamically. It scrolls down the page to load more content if necessary, ensuring that the specified number of images is collected.

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
```POST /api/scrape/pinterest```
- Description: Returns name of the person when given the url obtained from scaning the QR code from the CI
- Request Body:
	- ```url``` (string): The actual URL obtained from the CI
- Response: TBD.



#### To Do

- Do something with the templates 
