import { NextRequest, NextResponse } from 'next/server';

/* ── types ─────────────────────────────────────────────────── */
interface PerkFrontmatter {
    company: string;
    title: string;
    summary: string;
    perkType: string;
    amountDisplay: string;
    creditValueUsd?: number;
    currency?: string;
    eligibility: string;
    fundingStages: string[];
    regions: string[];
    categories: string[];
    applyUrl: string;
    sourceUrl: string;
    lastVerified: string;
    verified: boolean;
    isActive: boolean;
    slug: string;
    body: string;
}

/* ── YAML-lite parser (no deps) ────────────────────────────── */
function parseYamlLite(yaml: string): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    const lines = yaml.split('\n');
    let currentKey = '';
    let currentArray: string[] | null = null;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;

        // Array item
        if (trimmed.startsWith('- ')) {
            if (currentArray !== null) {
                currentArray.push(trimmed.slice(2).trim().replace(/^["']|["']$/g, ''));
            }
            continue;
        }

        // Key: value  or  Key:
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx === -1) continue;

        // Save previous array
        if (currentArray !== null && currentKey) {
            result[currentKey] = currentArray;
            currentArray = null;
        }

        const key = trimmed.slice(0, colonIdx).trim();
        const rawVal = trimmed.slice(colonIdx + 1).trim();

        if (rawVal === '') {
            // Could be start of an array
            currentKey = key;
            currentArray = [];
        } else {
            currentKey = key;
            // Parse value
            let val: unknown = rawVal.replace(/^["']|["']$/g, '');
            if (val === 'true') val = true;
            else if (val === 'false') val = false;
            else if (/^\d+$/.test(val as string)) val = parseInt(val as string, 10);
            else if (/^\d+\.\d+$/.test(val as string)) val = parseFloat(val as string);
            result[key] = val;
        }
    }

    // Save last array
    if (currentArray !== null && currentKey) {
        result[currentKey] = currentArray;
    }

    return result;
}

/* ── fetch sitemap slugs ───────────────────────────────────── */
async function fetchSlugs(): Promise<string[]> {
    const res = await fetch('https://startup-perks.com/sitemap-0.xml', {
        headers: { 'User-Agent': 'KavStrat-Perks-Scraper/1.0' },
    });
    const xml = await res.text();
    const matches = xml.matchAll(
        /<loc>https:\/\/startup-perks\.com\/perks\/([^/]+)\/<\/loc>/g
    );
    return [...matches].map((m) => m[1]);
}

/* ── fetch single perk ─────────────────────────────────────── */
async function fetchPerk(slug: string): Promise<PerkFrontmatter | null> {
    const url = `https://raw.githubusercontent.com/jnd0/startup-perks/main/src/content/perks/${slug}.md`;
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'KavStrat-Perks-Scraper/1.0' },
        });
        if (!res.ok) return null;
        const content = await res.text();

        const parts = content.split('---');
        if (parts.length < 3) return null;

        const frontmatter = parseYamlLite(parts[1]);
        const body = parts.slice(2).join('---').trim();

        return {
            company: (frontmatter.company as string) || slug,
            title: (frontmatter.title as string) || '',
            summary: (frontmatter.summary as string) || '',
            perkType: (frontmatter.perkType as string) || 'credit',
            amountDisplay: (frontmatter.amountDisplay as string) || '',
            creditValueUsd: (frontmatter.creditValueUsd as number) || 0,
            currency: (frontmatter.currency as string) || 'USD',
            eligibility: (frontmatter.eligibility as string) || '',
            fundingStages: (frontmatter.fundingStages as string[]) || [],
            regions: (frontmatter.regions as string[]) || ['Global'],
            categories: (frontmatter.categories as string[]) || [],
            applyUrl: (frontmatter.applyUrl as string) || '',
            sourceUrl: (frontmatter.sourceUrl as string) || '',
            lastVerified: (frontmatter.lastVerified as string) || '',
            verified: (frontmatter.verified as boolean) || false,
            isActive: (frontmatter.isActive as boolean) ?? true,
            slug,
            body,
        };
    } catch {
        return null;
    }
}

/* ── API Route Handler ─────────────────────────────────────── */

/**
 * GET /api/scrape-perks
 * 
 * Scrapes all startup perks from the GitHub repo.
 * Returns fresh JSON data for the frontend.
 * 
 * Query params:
 *   ?slug=xxx  → fetch single perk
 *   (none)     → fetch all perks
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const singleSlug = searchParams.get('slug');

        if (singleSlug) {
            // Single perk fetch
            const perk = await fetchPerk(singleSlug);
            if (!perk) {
                return NextResponse.json(
                    { error: `Perk '${singleSlug}' not found` },
                    { status: 404 }
                );
            }
            return NextResponse.json({ perk });
        }

        // Full scrape
        const slugs = await fetchSlugs();
        const perks: PerkFrontmatter[] = [];

        // Batch fetch with concurrency control (10 at a time)
        const batchSize = 10;
        for (let i = 0; i < slugs.length; i += batchSize) {
            const batch = slugs.slice(i, i + batchSize);
            const results = await Promise.allSettled(
                batch.map((slug) => fetchPerk(slug))
            );
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value) {
                    perks.push(result.value);
                }
            }
        }

        const totalValue = perks.reduce(
            (acc, p) => acc + (p.creditValueUsd ?? 0),
            0
        );
        const activeCount = perks.filter((p) => p.isActive).length;
        const verifiedCount = perks.filter((p) => p.verified).length;

        const data = {
            stats: {
                totalMarketValue: totalValue,
                activeCount,
                verifiedCount,
                lastUpdated: new Date().toISOString().split('T')[0],
            },
            perks,
        };

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('Scrape error:', error);
        return NextResponse.json(
            { error: 'Failed to scrape perks data' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/scrape-perks
 * 
 * Triggers a full re-scrape and returns updated data.
 * Can be called by a cron job (e.g. Vercel Cron) to keep data fresh.
 * 
 * Body (optional):
 *   { "slugs": ["aws-activate", "vercel-for-startups"] }
 *   → only re-scrape specific slugs
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const specificSlugs = (body as { slugs?: string[] }).slugs;

        const slugs = specificSlugs ?? (await fetchSlugs());
        const perks: PerkFrontmatter[] = [];

        const batchSize = 10;
        for (let i = 0; i < slugs.length; i += batchSize) {
            const batch = slugs.slice(i, i + batchSize);
            const results = await Promise.allSettled(
                batch.map((slug) => fetchPerk(slug))
            );
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value) {
                    perks.push(result.value);
                }
            }
        }

        const totalValue = perks.reduce(
            (acc, p) => acc + (p.creditValueUsd ?? 0),
            0
        );

        return NextResponse.json({
            success: true,
            message: `Scraped ${perks.length} perks`,
            stats: {
                totalMarketValue: totalValue,
                activeCount: perks.filter((p) => p.isActive).length,
                verifiedCount: perks.filter((p) => p.verified).length,
                lastUpdated: new Date().toISOString().split('T')[0],
            },
            perks,
        });
    } catch (error) {
        console.error('Scrape error:', error);
        return NextResponse.json(
            { error: 'Failed to scrape perks data' },
            { status: 500 }
        );
    }
}
