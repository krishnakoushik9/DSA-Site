import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();

        // Optimize page load
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        const jobsApiPromise = new Promise((resolve) => {
            page.on('response', async (res) => {
                const url = res.url();
                if (url.includes('api.interviewcafe.io') && url.includes('posts')) {
                    try {
                        const json = await res.json();
                        // Interviewcafe structures jobs in json.data -> posts or something similar
                        resolve(json);
                    } catch (e) {
                        // ignore json parse errors
                    }
                }
            });
        });

        // Use domcontentloaded to handle heavy CSR
        await page.goto('https://www.interviewcafe.io/jobs', { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Wait for the API to trigger or max 10s
        const apiResponse: any = await Promise.race([
            jobsApiPromise,
            new Promise(r => setTimeout(() => r(null), 10000))
        ]);

        let structuredJobs = [];

        if (apiResponse && apiResponse.data) {
            // Extract from API json if we caught it
            // API Data shape varies, so we will still attempt DOM fallback if it fails
            try {
                const rawJobs = Array.isArray(apiResponse.data) ? apiResponse.data : (apiResponse.data.posts || []);
                structuredJobs = rawJobs.map((j: any) => ({
                    id: j.id || Math.random().toString(36).substring(7),
                    title: j.title || "Software Developer",
                    company: j.company?.name || "Tech Company",
                    location: j.location || "India",
                    url: `https://www.interviewcafe.io/jobs/${j.slug || j.id || ''}`,
                    postedAt: j.created_at || new Date().toISOString()
                }));
            } catch (e) { }
        }

        // If API intercept failed or was empty, we scrape the DOM directly
        if (structuredJobs.length === 0) {
            // Give React time to render DOM payload
            await new Promise(r => setTimeout(r, 5000));

            structuredJobs = await page.evaluate(() => {
                const jobCards = Array.from(document.querySelectorAll('a[href^="/jobs/"]'));
                return jobCards.map((card, idx) => {
                    const titleEl = card.querySelector('h2, h3');
                    const companyEl = card.querySelector('p'); // typically company is below title

                    const title = titleEl ? (titleEl as HTMLElement).innerText : 'Job Posting';
                    const companyName = companyEl ? (companyEl as HTMLElement).innerText : 'InterviewCafe Job';
                    // We generate a mock URL and timestamp for consistency with Reddit structure
                    return {
                        id: `ic-job-${idx}`,
                        title: title,
                        company: companyName,
                        url: (card as HTMLAnchorElement).href,
                        postedAt: new Date().toISOString() // We don't have exact time in DOM always easily available
                    }
                }).filter(j => j.title && j.title !== 'Job Posting');
            });
        }

        return NextResponse.json({ success: true, jobs: structuredJobs });

    } catch (error) {
        console.error("Puppeteer Scrape Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to scrape jobs' }, { status: 500 });
    } finally {
        if (browser) await browser.close();
    }
}
