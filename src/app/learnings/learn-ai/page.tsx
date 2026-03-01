'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';
import { BrainCircuit, BookOpen, Star, Sparkles, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';
import { LEARN_AI_MARKDOWN } from '@/data/learn-ai';
import Link from 'next/link';

// We dynamically import ReactMarkdown because rendering Notebook Cells needs it
const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

export default function LearnAIPage() {
    const { username } = useAppStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="max-w-[1000px] mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header / Animated Greeting */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 md:p-12 border border-nord8/20 shadow-2xl">
                {/* Glow effects */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-nord8/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-nord9/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-nord3/20 blur-3xl rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-24 h-24 shrink-0 rounded-2xl bg-gradient-to-br from-nord8 to-nord9 flex items-center justify-center shadow-lg shadow-nord8/30 animate-pulse-glow">
                        <BrainCircuit size={48} className="text-white" />
                    </div>

                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nord8/10 border border-nord8/30 text-nord8 text-sm font-semibold mb-4">
                            <Sparkles size={14} /> Masterclass
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
                            Welcome to AI Engineering, <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nord8 to-nord9 drop-shadow-lg">
                                {username || 'Explorer'}!
                            </span>
                        </h1>
                        <p className="text-nord4/80 text-lg max-w-2xl leading-relaxed">
                            A carefully curated curriculum designed to take you from foundational mathematics to building production-ready Agentic applications.
                        </p>
                    </div>
                </div>

                {/* Sub-course nav hint */}
                <div className="mt-8 pt-8 border-t border-nord3/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-nord4/60">
                        <BookOpen size={16} /> Look below for theory
                    </div>
                    <Link href="/learnings/deep-learning" className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-nord3/50 hover:bg-nord3 border border-nord3 text-sm font-medium text-nord4 hover:text-white transition-all">
                        <span>Start Practical Deep Learning (Chollet)</span>
                        <ChevronRight size={16} className="text-nord8 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Markdown Content Area */}
            <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-nord3/30 rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <Star size={200} />
                </div>

                <div data-color-mode="dark" className="prose-container relative z-10">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .wmde-markdown {
                            background: transparent !important;
                            color: #D8DEE9 !important;
                            font-size: 16px;
                            line-height: 1.8;
                        }
                        .wmde-markdown h1 {
                            font-size: 2.5em;
                            font-weight: 800;
                            border-bottom: 2px solid rgba(136, 192, 208, 0.2);
                            padding-bottom: 0.5em;
                            margin-bottom: 1em;
                            background: -webkit-linear-gradient(0deg, #88C0D0, #81A1C1);
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        }
                        .wmde-markdown h2 {
                            font-size: 1.8em;
                            font-weight: 700;
                            color: #ECEFF4 !important;
                            margin-top: 1.5em;
                            border-bottom: 1px solid rgba(76, 86, 106, 0.3);
                            padding-bottom: 0.5em;
                        }
                        .wmde-markdown h3 {
                            font-size: 1.4em;
                            color: #88C0D0 !important;
                        }
                        .wmde-markdown a {
                            color: #88C0D0 !important;
                            text-decoration: none;
                            transition: all 0.2s;
                            box-shadow: inset 0 -2px 0 0 rgba(136, 192, 208, 0.3);
                        }
                        .wmde-markdown a:hover {
                            color: #81A1C1 !important;
                            box-shadow: inset 0 -20px 0 0 rgba(136, 192, 208, 0.1);
                        }
                        .wmde-markdown ul li::marker {
                            color: #88C0D0;
                        }
                        .wmde-markdown li {
                            margin-bottom: 0.5em;
                        }
                    `}} />
                    <ReactMarkdown>{LEARN_AI_MARKDOWN}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
