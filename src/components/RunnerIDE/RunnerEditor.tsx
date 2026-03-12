'use client';

import { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { MONACO_LANGUAGE_MAP } from '@/services/judge0RunnerAPI';

interface RunnerEditorProps {
    code: string;
    language: string;
    onCodeChange: (value: string) => void;
    onRun: () => void;
    onClearOutput: () => void;
    onSave?: () => void;
}

export default function RunnerEditor({
    code,
    language,
    onCodeChange,
    onRun,
    onClearOutput,
    onSave,
}: RunnerEditorProps) {
    const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
    const onRunRef = useRef(onRun);
    const onClearRef = useRef(onClearOutput);
    const onSaveRef = useRef(onSave);
    onRunRef.current = onRun;
    onClearRef.current = onClearOutput;
    onSaveRef.current = onSave;

    const monacoLang = MONACO_LANGUAGE_MAP[language] || 'plaintext';

    const handleEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;

        // Ctrl+Enter → Run Code
        editor.addAction({
            id: 'runner-execute-code',
            label: 'Run Code',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
            run: () => {
                onRunRef.current();
            },
        });

        // Ctrl+L → Clear Output
        editor.addAction({
            id: 'runner-clear-output',
            label: 'Clear Output',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL],
            run: () => {
                onClearRef.current();
            },
        });

        // Ctrl+S → Save Code
        editor.addAction({
            id: 'runner-save-code',
            label: 'Save code to cloud',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
            run: () => {
                if (onSaveRef.current) {
                    onSaveRef.current();
                }
            },
        });

        // Focus editor on mount
        editor.focus();

        // Define custom dark theme
        monaco.editor.defineTheme('runner-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6e7681', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'ff7b72' },
                { token: 'string', foreground: 'a5d6ff' },
                { token: 'number', foreground: '79c0ff' },
                { token: 'type', foreground: 'ffa657' },
                { token: 'function', foreground: 'd2a8ff' },
                { token: 'variable', foreground: 'ffa657' },
                { token: 'operator', foreground: 'ff7b72' },
                { token: 'delimiter', foreground: 'c9d1d9' },
            ],
            colors: {
                'editor.background': '#0d1117',
                'editor.foreground': '#e6edf3',
                'editor.lineHighlightBackground': '#161b2240',
                'editor.selectionBackground': '#264f7840',
                'editor.inactiveSelectionBackground': '#264f7820',
                'editorLineNumber.foreground': '#484f58',
                'editorLineNumber.activeForeground': '#e6edf3',
                'editorCursor.foreground': '#e6edf3',
                'editorIndentGuide.background': '#21262d',
                'editorIndentGuide.activeBackground': '#30363d',
                'editor.selectionHighlightBackground': '#264f7830',
                'editorBracketMatch.background': '#264f7820',
                'editorBracketMatch.border': '#ffffff60',
                'editorGutter.background': '#0d1117',
                'scrollbar.shadow': '#00000000',
                'scrollbarSlider.background': '#484f5830',
                'scrollbarSlider.hoverBackground': '#484f5860',
                'scrollbarSlider.activeBackground': '#ffffff50',
                'editorWidget.background': '#161b22',
                'editorWidget.border': '#30363d',
                'input.background': '#0d1117',
                'input.border': '#30363d',
                'focusBorder': '#e6edf3',
                'list.activeSelectionBackground': '#264f78',
                'list.hoverBackground': '#161b22',
            },
        });

        monaco.editor.setTheme('runner-dark');
    };

    return (
        <div className="h-full w-full overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
            <Editor
                height="100%"
                language={monacoLang}
                value={code}
                onChange={(value) => onCodeChange(value ?? '')}
                onMount={handleEditorMount}
                theme="vs-dark"
                loading={
                    <div
                        className="flex items-center justify-center h-full"
                        style={{ backgroundColor: '#0d1117' }}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div
                                className="w-8 h-8 border-2 rounded-full animate-spin"
                                style={{
                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                    borderTopColor: '#e6edf3',
                                }}
                            />
                            <span className="text-sm" style={{ color: '#484f58' }}>
                                Loading Editor...
                            </span>
                        </div>
                    </div>
                }
                options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                    fontLigatures: true,
                    lineHeight: 22,
                    tabSize: 4,
                    insertSpaces: true,
                    detectIndentation: false,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    folding: true,
                    wordWrap: 'on',
                    renderWhitespace: 'none',
                    bracketPairColorization: { enabled: true },
                    guides: {
                        bracketPairs: true,
                        indentation: true,
                    },
                    padding: { top: 16, bottom: 16 },
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    smoothScrolling: true,
                    contextmenu: true,
                    suggest: {
                        showKeywords: true,
                        showSnippets: true,
                    },
                    quickSuggestions: true,
                    formatOnPaste: true,
                    renderLineHighlight: 'line',
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    scrollbar: {
                        vertical: 'auto',
                        horizontal: 'auto',
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8,
                    },
                }}
            />
        </div>
    );
}
