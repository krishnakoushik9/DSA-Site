/**
 * Judge0 Runner API Service
 * 
 * All API communication with the Judge0 backend goes through this service.
 * Designed for future extensibility:
 *   - Rate limiting
 *   - Test cases
 *   - Multi-file programs
 *   - Stdin input panel
 */

// Backend proxy call to bypass Vercel HTTPS mixed-content policies touching HTTP judge server.
// The actual Judge0 base URL is now configured inside /app/api/execute/route.ts
const EXECUTE_PROXY_URL = '/api/execute';

// Supported language IDs
export const LANGUAGE_MAP: Record<string, number> = {
    'C': 50,
    'C++': 54,
    'Java': 62,
    'Python': 71,
};

export const LANGUAGE_LABELS: Record<string, string> = {
    'C': 'C (GCC 9.2.0)',
    'C++': 'C++ (GCC 9.2.0)',
    'Java': 'Java (OpenJDK)',
    'Python': 'Python (3.8)',
};

// Monaco language mode mapping
export const MONACO_LANGUAGE_MAP: Record<string, string> = {
    'C': 'c',
    'C++': 'cpp',
    'Java': 'java',
    'Python': 'python',
};

// Default templates for each language
export const LANGUAGE_TEMPLATES: Record<string, string> = {
    'Python': `print("Hello World")`,

    'C++': `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World";
    return 0;
}`,

    'C': `#include <stdio.h>

int main() {
    printf("Hello World");
    return 0;
}`,

    'Java': `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,
};

export interface Judge0Response {
    stdout: string | null;
    stderr: string | null;
    compile_output: string | null;
    message: string | null;
    time: string | null;
    memory: number | null;
    status: {
        id: number;
        description: string;
    };
}

export interface RunResult {
    success: boolean;
    output: string;
    executionTime: string | null;
    memory: number | null;
    statusDescription: string;
    raw: Judge0Response;
}

/**
 * Submit code for execution via Judge0
 * 
 * @param sourceCode - The source code string
 * @param languageId - The Judge0 language ID (50, 54, 62, 71)
 * @param stdin - Optional standard input (for future use)
 * @returns Parsed RunResult
 */
export async function executeCode(
    sourceCode: string,
    languageId: number,
    stdin?: string
): Promise<RunResult> {
    const endpoint = EXECUTE_PROXY_URL;

    const payload: Record<string, unknown> = {
        source_code: sourceCode,
        language_id: languageId,
    };

    if (stdin) {
        payload.stdin = stdin;
    }

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        if (response.status === 500) {
            throw new Error(`Execution error. Execution server may be down.`);
        }
        let errorMessage = `API error: ${response.status} ${response.statusText}`;
        try {
            const errData = await response.json();
            if (errData && errData.error) {
                errorMessage = errData.error;
            }
        } catch (e) { }
        throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    return parseResponse(data as Judge0Response);
}

/**
 * Parse Judge0 response into a clean RunResult
 */
function parseResponse(data: Judge0Response): RunResult {
    const statusId = data.status?.id ?? 0;
    const statusDescription = data.status?.description ?? 'Unknown';

    // Status ID 3 = Accepted (successful execution)
    const isSuccess = statusId === 3;

    let output = '';

    if (data.stdout) {
        output = data.stdout;
    }

    if (data.stderr) {
        output += (output ? '\n' : '') + data.stderr;
    }

    if (data.compile_output) {
        output += (output ? '\n' : '') + data.compile_output;
    }

    if (data.message) {
        output += (output ? '\n' : '') + data.message;
    }

    if (!output.trim()) {
        output = isSuccess
            ? '(No output)'
            : `Error: ${statusDescription}`;
    }

    return {
        success: isSuccess,
        output: output,
        executionTime: data.time,
        memory: data.memory,
        statusDescription,
        raw: data,
    };
}

/**
 * Get supported languages as an array
 */
export function getSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_MAP);
}
