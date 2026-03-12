import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    try {
        const { code, language } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        if (!GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY is not configured in environment variables');
            return NextResponse.json({ error: 'API key missing' }, { status: 500 });
        }

        const prompt = `You are an expert programming test case generator.
Given the following ${language} code, analyze what algorithmic problem it solves. 
Generate an array of 3 to 12 diverse test cases (including typical bounds and edge cases) to test it deeply. 
If the code does not read any input from standard input (stdin) whatsoever (e.g. uses strictly hardcoded static variables or just prints Hello World), you MUST return an empty array [].

The output must be a valid JSON array of objects with "input" and "expectedOutput" fields.

Code:
${code}`;

        // Using reliable models
        const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
        let lastError = '';

        for (const model of models) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: {
                            temperature: 0.2,
                            response_mime_type: "application/json"
                        }
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    lastError = `Model ${model} failed: ${errorText}`;
                    if (response.status === 429) {
                        continue; // Try next model if quota hit
                    }
                    console.error(`Gemini API Error (${model}):`, errorText);
                    continue;
                }

                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

                if (!text) {
                    lastError = `Empty response from ${model}`;
                    continue;
                }

                try {
                    const json = JSON.parse(text);
                    // Ensure it's an array, if Gemini returned { "testCases": [...] } or similar
                    const testCases = Array.isArray(json) ? json : (json.testCases || json.cases || []);
                    return NextResponse.json({ testCases });
                } catch (e) {
                    console.error(`Parse error for ${model}:`, text);
                    lastError = 'JSON parse error';
                    continue;
                }
            } catch (err: any) {
                console.error(`Fetch error for ${model}:`, err);
                lastError = err.message;
                continue;
            }
        }

        return NextResponse.json({ error: `Failed to generate test cases: ${lastError}` }, { status: 500 });

    } catch (e: any) {
        console.error('Route error:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

