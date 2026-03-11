import { NextResponse } from 'next/server';

const JUDGE0_BASE_URL = 'http://56.228.42.31:2358';

export async function POST(req: Request) {
    try {
        const payload = await req.json();

        const endpoint = `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`;

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error('Judge0 API Error:', err);
            return NextResponse.json({ error: `Judge0 Server Error: ${response.status}`, details: err }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (e: any) {
        console.error('Internal API proxy error', e);
        return NextResponse.json({ error: 'Internal Server Error', message: e.message }, { status: 500 });
    }
}
