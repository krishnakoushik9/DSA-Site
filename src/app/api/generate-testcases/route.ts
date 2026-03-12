import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { code, language } = await req.json();

        if (!code) {
            return NextResponse.json({ error: 'Code is required' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY || "AIzaSyAljokJzgomoPAhJTEuhamQIrfS1VO4XpQ";
        if (!apiKey) {
            return NextResponse.json({ error: 'API key missing' }, { status: 500 });
        }

        const prompt = `You are an expert programming test case generator.
Given the following ${language} code, analyze what algorithmic problem it solves.
Generate an array of 3 to 12 diverse test cases (including typical bounds and edge cases) to test it deeply. If the code does not read any input from standard input (stdin) whatsoever (e.g. uses strictly hardcoded static variables or just prints Hello World), you MUST return an empty array [].
IMPORTANT: Respond ONLY with a valid JSON array. No markdown, no backticks.
Format:
[
  {
    "input": "stdin string (multi-line if needed, exactly as read by program)",
    "expectedOutput": "expected stdout string"
  }
]

Code:
${code}`;

        // Attempting to use the user's requested model, with fallback to 1.5-flash
        let modelName = "gemini-2.0-flash"; // let's try gemini-1.5-flash first to be safe, but wait, use requested.
        const requestedModel = "gemini-3.1-flash-lite-preview";

        let response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${requestedModel}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2 }
            })
        });

        // Fallback if the requested experimental model doesn't work
        if (!response.ok) {
            if (response.status === 429) {
                return NextResponse.json({ error: 'RESOURCE_EXHAUSTED' }, { status: 429 });
            }
            console.log(`Fallback from ${requestedModel} to gemini-1.5-flash...`);
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.2 }
                })
            });
        }

        if (!response.ok) {
            if (response.status === 429) {
                return NextResponse.json({ error: 'RESOURCE_EXHAUSTED' }, { status: 429 });
            }
            const err = await response.text();
            console.error('Gemini API Error:', err);
            return NextResponse.json({ error: 'Failed to generate test cases from AI' }, { status: 500 });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        try {
            // Clean markdown blocks if present
            let cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
            const json = JSON.parse(cleanText);
            return NextResponse.json({ testCases: json });
        } catch (e) {
            console.error("Parse error:", text);
            return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
        }

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
