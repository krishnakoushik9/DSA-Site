import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch LeetCode Contests
        const lcQuery = `
            query {
                topTwoContests {
                    title
                    titleSlug
                    startTime
                    duration
                }
            }
        `;
        const lcResponse = await fetch('https://leetcode.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: lcQuery }),
        });
        const lcData = await lcResponse.json();
        const lcContests = (lcData?.data?.topTwoContests || []).map((c: any) => ({
            id: `lc-${c.titleSlug}`,
            title: c.title,
            platform: 'LeetCode',
            startTime: c.startTime * 1000, // to ms
            duration: c.duration * 1000, // to ms
            url: `https://leetcode.com/contest/${c.titleSlug}`,
        }));

        // Fetch Codeforces Contests
        const cfResponse = await fetch('https://codeforces.com/api/contest.list');
        const cfData = await cfResponse.json();
        const cfContests = (cfData?.result || [])
            .filter((c: any) => c.phase === 'BEFORE')
            .map((c: any) => ({
                id: `cf-${c.id}`,
                title: c.name,
                platform: 'Codeforces',
                startTime: c.startTimeSeconds * 1000, // to ms
                duration: c.durationSeconds * 1000, // to ms
                url: `https://codeforces.com/contests/${c.id}`,
            }));

        const allContests = [...lcContests, ...cfContests].sort((a, b) => a.startTime - b.startTime);

        return NextResponse.json(allContests);
    } catch (error) {
        console.error('Error fetching contests:', error);
        return NextResponse.json({ error: 'Failed to fetch contests' }, { status: 500 });
    }
}
