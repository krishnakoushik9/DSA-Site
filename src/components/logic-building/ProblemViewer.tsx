'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Tag, Maximize2, Type, ChevronDown } from 'lucide-react';

interface ProblemViewerProps {
    title: string;
    content: string;
    loading: boolean;
}

export default function ProblemViewer({ title, content, loading }: ProblemViewerProps) {
    return (
        <div className="h-full flex flex-col bg-nord0 relative overflow-hidden">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-nord3/10 bg-nord0/80 backdrop-blur-md z-10">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-nord8/10 rounded-lg">
                        <BookOpen size={18} className="text-nord8" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-sm font-bold text-nord6 truncate tracking-tight">{title}</h1>
                        <div className="flex items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] text-nord14 font-medium">
                                <Clock size={10} />
                                15-20 mins
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-nord8 font-medium">
                                <Tag size={10} />
                                Logic
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 text-nord4/40 hover:text-nord6 transition-colors hover:bg-nord3/10 rounded-lg">
                        <Type size={16} />
                    </button>
                    <button className="p-2 text-nord4/40 hover:text-nord6 transition-colors hover:bg-nord3/10 rounded-lg">
                        <Maximize2 size={16} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-8 space-y-6">
                        <div className="h-8 bg-nord3/20 rounded-lg w-3/4 animate-pulse" />
                        <div className="space-y-3">
                            <div className="h-4 bg-nord3/10 rounded-md w-full animate-pulse" />
                            <div className="h-4 bg-nord3/10 rounded-md w-5/6 animate-pulse" />
                            <div className="h-4 bg-nord3/10 rounded-md w-4/6 animate-pulse" />
                        </div>
                        <div className="h-40 bg-nord3/5 rounded-xl border border-nord3/10 animate-pulse" />
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-8 py-8 prose prose-invert prose-sm max-w-none 
                        prose-headings:text-nord6 prose-headings:font-bold prose-headings:tracking-tight
                        prose-p:text-nord4/80 prose-p:leading-relaxed
                        prose-code:text-nord8 prose-code:bg-nord8/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                        prose-pre:bg-nord1/50 prose-pre:border prose-pre:border-nord3/20 prose-pre:rounded-xl prose-pre:p-4
                        prose-strong:text-nord6 prose-strong:font-bold
                        prose-li:text-nord4/80
                        "
                    >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                        </ReactMarkdown>

                        {/* Extra Visual Depth - Examples Section Simulation */}
                        <div className="mt-12 space-y-4">
                            <h3 className="text-nord6 text-base font-bold flex items-center gap-2">
                                <ChevronDown size={18} className="text-nord8" />
                                Interactive Walkthrough
                            </h3>
                            <div className="p-6 bg-nord1/30 rounded-2xl border border-nord3/10 border-dashed relative group overflow-hidden">
                                <div className="absolute inset-0 bg-nord8/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <p className="text-xs text-nord4/60 italic relative z-10">
                                    &quot;Break down the problem into smaller logical units before jumping into the code. 
                                    Try to trace the examples on a scratchpad.&quot;
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
