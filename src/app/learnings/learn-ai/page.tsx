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
            <div
                className="relative overflow-hidden rounded-3xl p-8 md:p-12 border shadow-2xl transition-colors duration-300"
                style={{
                    background: 'linear-gradient(135deg, var(--th-nord1), var(--th-nord0))',
                    borderColor: 'color-mix(in srgb, var(--th-nord8) 20%, transparent)'
                }}
            >
                {/* Glow effects */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'color-mix(in srgb, var(--th-nord8) 15%, transparent)' }} />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full blur-3xl pointer-events-none" style={{ background: 'color-mix(in srgb, var(--th-nord9) 15%, transparent)' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] blur-3xl rounded-full pointer-events-none" style={{ background: 'color-mix(in srgb, var(--th-nord3) 20%, transparent)' }} />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-24 h-24 shrink-0 rounded-2xl bg-gradient-to-br from-nord8 to-nord9 flex items-center justify-center shadow-lg shadow-nord8/30 animate-pulse-glow">
                        <BrainCircuit size={48} className="text-white" />
                    </div>

                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-4 border" style={{ color: 'var(--th-nord8)', background: 'color-mix(in srgb, var(--th-nord8) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--th-nord8) 30%, transparent)' }}>
                            <Sparkles size={14} /> Masterclass
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight drop-shadow-md" style={{ color: 'var(--th-nord6)' }}>
                            Welcome to AI Engineering, <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text drop-shadow-lg" style={{ backgroundImage: 'linear-gradient(90deg, var(--th-nord8), var(--th-nord9))' }}>
                                {username || 'Explorer'}!
                            </span>
                        </h1>
                        <p className="text-lg max-w-2xl leading-relaxed font-medium" style={{ color: 'var(--th-nord4)' }}>
                            A carefully curated curriculum designed to take you from foundational mathematics to building production-ready Agentic applications.
                        </p>
                    </div>
                </div>

                {/* Sub-course nav hint */}
                <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderColor: 'color-mix(in srgb, var(--th-nord3) 30%, transparent)' }}>
                    <div className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--th-nord4)' }}>
                        <BookOpen size={16} /> Look below for theory
                    </div>
                    <Link href="/learnings/deep-learning" className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all" style={{ background: 'color-mix(in srgb, var(--th-nord3) 20%, transparent)', borderColor: 'color-mix(in srgb, var(--th-nord3) 40%, transparent)', color: 'var(--th-nord5)' }}>
                        <span>Start Practical Deep Learning (Chollet)</span>
                        <ChevronRight size={16} className="text-nord8 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* Markdown Content Area */}
            <div className="rounded-3xl p-6 md:p-10 shadow-xl relative overflow-hidden border transition-colors duration-300" style={{ background: 'color-mix(in srgb, var(--th-nord0) 80%, transparent)', backdropFilter: 'blur(16px)', borderColor: 'color-mix(in srgb, var(--th-nord3) 30%, transparent)' }}>
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none" style={{ color: 'var(--th-nord4)' }}>
                    <Star size={200} />
                </div>

                <div className="prose-container relative z-10 w-full">
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .wmde-markdown {
                            background: transparent !important;
                            color: var(--th-nord5) !important;
                            font-size: 16px;
                            line-height: 1.8;
                        }
                        .wmde-markdown h1 {
                            font-size: 2.5em;
                            font-weight: 800;
                            border-bottom: 2px solid color-mix(in srgb, var(--th-nord8) 20%, transparent);
                            padding-bottom: 0.5em;
                            margin-bottom: 1em;
                            background: linear-gradient(90deg, var(--th-nord8), var(--th-nord9));
                            -webkit-background-clip: text;
                            -webkit-text-fill-color: transparent;
                        }
                        .wmde-markdown h2 {
                            font-size: 1.8em;
                            font-weight: 700;
                            color: var(--th-nord6) !important;
                            margin-top: 1.5em;
                            border-bottom: 1px solid color-mix(in srgb, var(--th-nord3) 30%, transparent);
                            padding-bottom: 0.5em;
                        }
                        .wmde-markdown h3 {
                            font-size: 1.4em;
                            color: var(--th-nord8) !important;
                            margin-top: 1.5em;
                        }
                        .wmde-markdown a {
                            color: var(--th-nord8) !important;
                            text-decoration: none;
                            transition: all 0.2s;
                            box-shadow: inset 0 -2px 0 0 color-mix(in srgb, var(--th-nord8) 30%, transparent);
                        }
                        .wmde-markdown a:hover {
                            color: var(--th-nord9) !important;
                            box-shadow: inset 0 -20px 0 0 color-mix(in srgb, var(--th-nord8) 10%, transparent);
                        }
                        .wmde-markdown ul li::marker {
                            color: var(--th-nord8);
                        }
                        .wmde-markdown li {
                            margin-bottom: 0.5em;
                        }
                        .wmde-markdown p {
                            color: var(--th-nord5);
                            font-weight: 500;
                        }
                    `}} />
                    <ReactMarkdown>{LEARN_AI_MARKDOWN}</ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
