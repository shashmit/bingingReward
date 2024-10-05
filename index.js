import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const SEARCH_LIMIT = 40;

// Function to generate a random string for domain
function generateRandomDomain() {
    const length = Math.floor(Math.random() * 10) + 5; 
    const chars = 'abcdefghijklmnopq';
    let domain = '';
    for (let i = 0; i < length; i++) {
        domain += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return domain;
}

// Function to search random websites
async function searchRandomWebsite() {
    let browser;
    let searchCount = 0;

    try {
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            channel: 'chrome',
            args: ['--start-maximized']
        });

        // Create a new page for initial search
        const page = await browser.newPage();
        
        // Function to perform searches
        async function performSearch(useNewTab = true) {
            if (searchCount >= SEARCH_LIMIT) {
                console.log(`Reached search limit of ${SEARCH_LIMIT}. Closing browser...`);
                await browser.close();
                process.exit(0); // Exit the process when done
                return;
            }

            try {
                const randomDomain = generateRandomDomain();
                const searchUrl = `https://www.bing.com/search?q=${randomDomain}&PC=U316&FORM=CHROMN`;
                console.log(`Search #${searchCount + 1}/${SEARCH_LIMIT} - Searching for: ${searchUrl}`);

                if (useNewTab) {
                    // Open search in a new tab
                    const newPage = await browser.newPage();
                    await newPage.goto(searchUrl, {
                        waitUntil: 'networkidle0',
                        timeout: 30000
                    });
                } else {
                    // Search in the same tab
                    await page.goto(searchUrl, {
                        waitUntil: 'networkidle0',
                        timeout: 30000
                    });
                }

                searchCount++;
                console.log(`Search #${searchCount} completed successfully`);
                
                // Schedule the next search if we haven't reached the limit
                if (searchCount < SEARCH_LIMIT) {
                    setTimeout(() => performSearch(useNewTab), 25000); // 25 seconds delay
                } else {
                    console.log(`Completed ${SEARCH_LIMIT} searches. Closing browser...`);
                    await browser.close();
                    process.exit(0);
                }
            } catch (error) {
                console.error('Error during search:', error);
                // If error occurs, try again after 1 second
                if (searchCount < SEARCH_LIMIT) {
                    setTimeout(() => performSearch(useNewTab), 1000);
                }
            }
        }

        // Start the search process
        const useNewTab = true; 
        performSearch(useNewTab);

    } catch (error) {
        console.error('Browser launch error:', error);
        if (browser) {
            await browser.close();
        }
    }
}

// Route to initiate search
app.get('/', async (req, res) => {
    await searchRandomWebsite();
    res.send('Search process initiated - Will complete 40 searches');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Starting automatic website search (40 searches limit)...');
    searchRandomWebsite();
});