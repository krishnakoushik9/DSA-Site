import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const response = await fetch('https://api.interviewcafe.io/v1/jobs?limit=50&offset=0', {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch jobs API, status: ${response.status}`);
        }

        const data = await response.json();
        const rawJobs = data.jobs || [];

        const structuredJobs = rawJobs.map((j: any) => ({
            id: j.id || Math.random().toString(36).substring(7),
            title: j.title || "Software Developer",
            company: j.company || "Tech Company",
            location: j.location || "India",
            url: `https://www.interviewcafe.io/jobs/${j.id}`,
            postedAt: j.created_at || j.updated_at || new Date().toISOString()
        }));

        return NextResponse.json({ success: true, jobs: structuredJobs });

    } catch (error) {
        console.error("InterviewCafe API Fetch Error:", error);
        return NextResponse.json({ success: false, error: 'Failed to fetch jobs' }, { status: 500 });
    }
}
