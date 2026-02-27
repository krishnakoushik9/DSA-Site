import React, { useState, useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-java';
// Note: You must ensure a Prism theme is loaded, either globally or via import.
// For Next.js, importing directly from prismjs/themes might require config, 
// so we'll rely on inline styles or a global CSS if not present.

interface LogicBuildingIDEProps {
    problemTitle: string;
    initialCode?: string;
    onSubmit: (code: string) => void;
}

export default function LogicBuildingIDE({ problemTitle, initialCode = 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}', onSubmit }: LogicBuildingIDEProps) {
    const [code, setCode] = useState(initialCode);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setCode(initialCode);
    }, [initialCode]);

    useEffect(() => {
        if (codeRef.current) {
            Prism.highlightElement(codeRef.current);
        }
    }, [code]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.currentTarget.selectionStart;
            const end = e.currentTarget.selectionEnd;

            const newCode = code.substring(0, start) + '    ' + code.substring(end);
            setCode(newCode);

            // Move cursor
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
                }
            }, 0);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-nord3/30 shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-[#333]">
                <div className="flex items-center gap-2">
                    <span className="text-nord4/50 text-xs font-mono">Java IDE</span>
                    <span className="text-nord8 text-sm font-semibold truncate max-w-[200px]">{problemTitle}</span>
                </div>
                <button
                    onClick={() => onSubmit(code)}
                    className="px-4 py-1.5 bg-nord8 hover:bg-nord9 text-nord0 text-xs font-bold rounded-md transition-colors shadow-lg"
                >
                    Submit Code
                </button>
            </div>
            <div className="relative flex-1 overflow-auto bg-[#1e1e1e]">
                <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck="false"
                    className="absolute inset-0 w-full h-full p-4 font-mono text-sm leading-relaxed text-transparent bg-transparent border-none outline-none resize-none z-10 caret-nord6"
                    style={{ whiteSpace: 'pre', tabSize: 4 }}
                />
                <pre
                    className="absolute inset-0 w-full h-full p-4 m-0 font-mono text-sm leading-relaxed pointer-events-none"
                    style={{ tabSize: 4 }}
                    aria-hidden="true"
                >
                    <code ref={codeRef} className="language-java block" style={{ padding: 0, background: 'none' }}>
                        {code}
                    </code>
                </pre>
            </div>
        </div>
    );
}
