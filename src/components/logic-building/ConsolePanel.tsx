'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal as TerminalIcon, XCircle, CheckCircle2, AlertCircle, Trash2, ChevronRight, Share2 } from 'lucide-react';

interface Log {
    type: 'info' | 'error' | 'success' | 'warning';
    message: string;
    timestamp: string;
}

interface ConsolePanelProps {
    logs: Log[];
    onClear: () => void;
}

export default function ConsolePanel({ logs, onClear }: ConsolePanelProps) {
    return (
        <div className="h-full flex flex-col bg-nord0 border-t border-nord3/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-nord3/10 bg-nord1/30">
                <div className="flex items-center gap-2">
                    <TerminalIcon size={14} className="text-nord8" />
                    <span className="text-xs font-bold text-nord4/60 uppercase tracking-widest">Execution Terminal</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 text-nord4/30 hover:text-nord6 transition-colors">
                        <Share2 size={14} />
                    </button>
                    <button 
                        onClick={onClear}
                        className="p-1.5 text-nord4/30 hover:text-nord11 transition-colors"
                        title="Clear Console"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs custom-scrollbar">
                {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-2 opacity-20">
                        <TerminalIcon size={32} className="text-nord4" />
                        <p className="text-[10px] uppercase tracking-[0.2em]">Awaiting Instruction...</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <AnimatePresence initial={false}>
                            {logs.map((log, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex gap-3 p-2 rounded-lg border ${
                                        log.type === 'error' ? 'bg-nord11/5 border-nord11/20 text-nord11' :
                                        log.type === 'success' ? 'bg-nord14/5 border-nord14/20 text-nord14' :
                                        log.type === 'warning' ? 'bg-nord13/5 border-nord13/20 text-nord13' :
                                        'bg-nord3/5 border-nord3/20 text-nord4/80'
                                    }`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">
                                        {log.type === 'error' && <XCircle size={14} />}
                                        {log.type === 'success' && <CheckCircle2 size={14} />}
                                        {log.type === 'warning' && <AlertCircle size={14} />}
                                        {log.type === 'info' && <ChevronRight size={14} className="text-nord8" />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">
                                                [{log.type}]
                                            </span>
                                            <span className="text-[9px] opacity-30">
                                                {log.timestamp}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-wrap leading-relaxed">{log.message}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
