const puppeteer = require('puppeteer');

async function scrapeNetwork() {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        console.log("Navigating to InterviewCafe Jobs...");

        // Set a normal user agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        page.on('response', async (res) => {
            const url = res.url();
            const type = res.request().resourceType();

            if (type === 'fetch' || type === 'xhr') {
                try {
                    const text = await res.text();
                    if (text.includes('company') || text.includes('Application Developer') || text.includes('skills')) {
                        console.log("-----------------------------------------");
                        console.log("FOUND JOBS API URL:", url);
                        console.log("RESPONSE SNIPPET:", text.substring(0, 500));
                        console.log("-----------------------------------------");
                        process.exit(0);
                    }
                } catch (e) { }
            }
        });

        await page.goto('https://www.interviewcafe.io/jobs', { waitUntil: 'networkidle0', timeout: 60000 });

        await new Promise(r => setTimeout(r, 10000));
    } catch (err) {
        console.error("ERROR:", err);
    } finally {
        await browser.close();
    }
}

scrapeNetwork();
