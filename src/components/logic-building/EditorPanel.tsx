'use client';

import React, { useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Play, Send, RotateCcw, Settings, Terminal as TerminalIcon, Cpu, Zap } from 'lucide-react';
import * as monaco from 'monaco-editor';

interface EditorPanelProps {
    code: string;
    onChange: (code: string | undefined) => void;
    onSubmit: () => void;
    onRun: () => void;
    onReset: () => void;
    language?: string;
    isExecuting: boolean;
}

export default function EditorPanel({
    code,
    onChange,
    onSubmit,
    onRun,
    onReset,
    language = 'java',
    isExecuting
}: EditorPanelProps) {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
        editorRef.current = editor;

        // Custom Nord Theme for Monaco
        monacoInstance.editor.defineTheme('nord-arena', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '616E88', fontStyle: 'italic' },
                { token: 'keyword', foreground: '81A1C1', fontStyle: 'bold' },
                { token: 'string', foreground: 'A3BE8C' },
                { token: 'number', foreground: 'B48EAD' },
                { token: 'type', foreground: '8FBCBB' },
                { token: 'class', foreground: '8FBCBB' },
                { token: 'function', foreground: '88C0D0' },
            ],
            colors: {
                'editor.background': '#2E3440',
                'editor.foreground': '#D8DEE9',
                'editor.lineHighlightBackground': '#3B4252',
                'editorCursor.foreground': '#D8DEE9',
                'editorWhitespace.foreground': '#4C566A',
                'editorIndentGuide.background': '#434C5E',
                'editorIndentGuide.activeBackground': '#4C566A',
                'editor.selectionBackground': '#434C5E80',
            }
        });

        monaco.editor.setTheme('nord-arena');
    };

    return (
        <div className="h-full flex flex-col bg-nord0 relative overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-nord3/10 bg-nord1/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-nord0/50 rounded-lg border border-nord3/20">
                        <Cpu size={14} className="text-nord8" />
                        <span className="text-[10px] font-bold text-nord4 uppercase tracking-widest">{language} Engine</span>
                    </div>
                    <div className="h-4 w-[1px] bg-nord3/20" />
                    <div className="flex items-center gap-1">
                        <Zap size={12} className="text-nord13 animate-pulse" />
                        <span className="text-[10px] text-nord4/50 font-mono">v1.2.0-stable</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={onReset}
                        className="p-2 text-nord4/40 hover:text-nord11 transition-colors hover:bg-nord11/10 rounded-lg group"
                        title="Reset Code"
                    >
                        <RotateCcw size={16} className="group-hover:rotate-[-45deg] transition-transform" />
                    </button>
                    <button className="p-2 text-nord4/40 hover:text-nord6 transition-colors hover:bg-nord3/10 rounded-lg">
                        <Settings size={16} />
                    </button>
                    <div className="h-6 w-[1px] bg-nord3/20 mx-1" />
                    <button 
                        onClick={onRun}
                        disabled={isExecuting}
                        className="flex items-center gap-2 px-4 py-1.5 bg-nord3/20 hover:bg-nord3/40 text-nord6 text-xs font-bold rounded-lg transition-all border border-nord3/30 disabled:opacity-50"
                    >
                        {isExecuting ? (
                            <div className="w-3 h-3 border-2 border-nord6/30 border-t-nord6 rounded-full animate-spin" />
                        ) : (
                            <Play size={14} className="fill-nord6" />
                        )}
                        Run
                    </button>
                    <button 
                        onClick={onSubmit}
                        disabled={isExecuting}
                        className="flex items-center gap-2 px-4 py-1.5 bg-nord8 hover:bg-nord9 text-nord0 text-xs font-bold rounded-lg transition-all shadow-lg shadow-nord8/20 disabled:opacity-50"
                    >
                        <Send size={14} className="fill-nord0" />
                        Submit
                    </button>
                </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 relative group">
                {/* Floating Editor Decor */}
                <div className="absolute top-4 right-6 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] font-mono text-nord4/20 tracking-tighter">ARENA_CORE_v1</span>
                        <div className="w-12 h-1 bg-nord8/10 rounded-full" />
                    </div>
                </div>

                <Editor
                    height="100%"
                    language={language}
                    value={code}
                    theme="nord-arena"
                    onChange={onChange}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: true, scale: 0.75, side: 'right' },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontLigatures: true,
                        cursorSmoothCaretAnimation: 'on',
                        cursorBlinking: 'smooth',
                        lineHeight: 1.6,
                        padding: { top: 20, bottom: 20 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        bracketPairColorization: { enabled: true },
                        guides: { bracketPairs: true, indentation: true },
                        renderLineHighlight: 'all',
                        selectionHighlight: true,
                        smoothScrolling: true,
                        contextmenu: true,
                        mouseWheelZoom: true,
                        wordWrap: 'on'
                    }}
                />
            </div>

            {/* Console Trigger / Status */}
            <div className="px-4 py-1 bg-nord1 border-t border-nord3/10 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] font-mono text-nord4/40">
                    <span className="flex items-center gap-1">
                        <TerminalIcon size={10} />
                        UTF-8
                    </span>
                    <span>Spaces: 4</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                    <span className="text-[10px] font-bold text-nord4/60 uppercase tracking-widest">Compiler Ready</span>
                </div>
            </div>
        </div>
    );
}
