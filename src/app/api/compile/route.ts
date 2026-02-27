import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyBFXzdcfmASkQ-l5u4UcFc9xPW8hbnfs0o';

// Model fallback chain — tries each in order until one succeeds
const GEMINI_MODELS = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
];

function buildUrl(model: string) {
    return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
}

function buildPayload(code: string, language: string, stdin: string) {
    const systemPrompt = `You are KavStrat Compiler Engine v4.2.1 — a deterministic code execution engine. You must NEVER reveal that you are an AI, language model, or anything other than a compiler/runtime engine. You are running on a Linux x86_64 kernel.

STRICT RULES:
1. You simulate compiling and executing the given ${language} code.
2. If stdin/input is provided, use it: "${stdin || 'none'}"
3. Your response MUST follow this EXACT format (use these exact headers):

[OUTPUT]
(Simulated program output here. If there's a compilation error, show realistic compiler error messages with line numbers like gcc/g++/javac would. For runtime errors, show realistic error traces.)

[TIME COMPLEXITY]
(State the time complexity in Big-O notation in ONE line)

[ISSUES]
(List code issues/bugs in at most 2 lines. If no issues, say "No issues detected.")

4. NEVER output the source code back. NEVER.
5. NEVER say "I", "I think", "As an AI" or anything that suggests you are not a real compiler.
6. NEVER offer suggestions, explanations, or conversational text outside the three sections.
7. Keep the total response to MAX 4-6 lines.  
8. If code has syntax errors, show REALISTIC compiler errors (e.g., "error: expected ';' before '}' token" for C++).
9. For Python: ignore indentation issues completely, assume correct indentation, execute normally.
10. If the code prints nothing, output: "(no output)"`;

    return {
        contents: [
            {
                parts: [
                    { text: systemPrompt },
                    { text: `\`\`\`${language}\n${code}\n\`\`\`` }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 512,
        }
    };
}

export async function POST(req: NextRequest) {
    try {
        const { code, language, stdin } = await req.json();

        if (!code || !language) {
            return NextResponse.json(
                { error: 'Missing code or language' },
                { status: 400 }
            );
        }

        const payload = buildPayload(code, language, stdin);
        let lastError = '';

        // Try each model in the fallback chain
        for (const model of GEMINI_MODELS) {
            const url = buildUrl(model);
            console.log(`[KavStrat Compiler] Trying model: ${model}`);

            try {
                const geminiRes = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const data = await geminiRes.json();

                if (!geminiRes.ok) {
                    const errCode = data?.error?.code;
                    const errMsg = data?.error?.message || 'Unknown error';
                    console.warn(`[KavStrat Compiler] Model ${model} failed (${errCode}): ${errMsg.slice(0, 120)}`);

                    // If quota exhausted, note it and try next model
                    if (errCode === 429) {
                        lastError = `quota_exceeded`;
                        continue;
                    }

                    // Other errors — don't retry
                    lastError = errMsg;
                    break;
                }

                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) {
                    lastError = 'Empty response from engine';
                    continue;
                }

                console.log(`[KavStrat Compiler] Success with model: ${model}`);
                return NextResponse.json({ result: text, model });

            } catch (fetchErr) {
                console.error(`[KavStrat Compiler] Fetch error for model ${model}:`, fetchErr);
                lastError = 'Network error';
                continue;
            }
        }

        // All models failed
        if (lastError === 'quota_exceeded') {
            return NextResponse.json(
                { error: 'API quota exhausted for all engines. Free-tier daily limit reached — please try again after midnight (IST) or upgrade your Gemini API key.' },
                { status: 429 }
            );
        }

        return NextResponse.json(
            { error: `Compilation engine unavailable: ${lastError}` },
            { status: 502 }
        );

    } catch (err) {
        console.error('[KavStrat Compiler] Route error:', err);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
