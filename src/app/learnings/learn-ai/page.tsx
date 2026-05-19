'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';
import { BrainCircuit, BookOpen, Sparkles, ChevronRight, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { LEARN_AI_INTRO, LEARN_AI_SECTIONS, LearnLink, LearnSection } from '@/data/learn-ai';
import Link from 'next/link';

const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            delay: 0.05 + i * 0.04,
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
        },
    }),
};

const listContainerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.04,
            delayChildren: 0.08,
        },
    },
};

const listItemVariants = {
    hidden: { opacity: 0, x: -12 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

function LinkRow({ link, accent }: { link: LearnLink; accent: string }) {
    return (
        <motion.li variants={listItemVariants}>
            <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group/link flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:translate-x-1"
                style={{
                    color: 'var(--th-nord5)',
                    background: 'color-mix(in srgb, var(--th-nord1) 40%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--th-nord3) 25%, transparent)',
                }}
            >
                <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200 group-hover/link:scale-150"
                    style={{ background: accent }}
                />
                <span className="flex-1 truncate group-hover/link:text-white transition-colors">{link.label}</span>
                <ExternalLink
                    size={13}
                    className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all duration-200 shrink-0"
                    style={{ color: accent }}
                />
            </a>
        </motion.li>
    );
}

function SectionCard({ section, index }: { section: LearnSection; index: number }) {
    const Icon = section.icon;
    return (
        <motion.div
            custom={index}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={cardVariants}
            whileHover={{ y: -4 }}
            className="group relative rounded-2xl p-5 border overflow-hidden transition-shadow duration-300 hover:shadow-2xl"
            style={{
                background: 'color-mix(in srgb, var(--th-nord0) 80%, transparent)',
                borderColor: 'color-mix(in srgb, var(--th-nord3) 30%, transparent)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* Accent glow */}
            <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity duration-500"
                style={{ background: `color-mix(in srgb, ${section.accent} 35%, transparent)` }}
            />
            {/* Top accent stripe */}
            <div
                className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${section.accent}, transparent)` }}
            />

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                        style={{
                            background: `color-mix(in srgb, ${section.accent} 18%, transparent)`,
                            border: `1px solid color-mix(in srgb, ${section.accent} 35%, transparent)`,
                            color: section.accent,
                        }}
                    >
                        <Icon size={20} />
                    </div>
                    <h3 className="text-base font-bold leading-tight" style={{ color: 'var(--th-nord6)' }}>
                        {section.title}
                    </h3>
                </div>

                {section.links && section.links.length > 0 && (
                    <motion.ul
                        variants={listContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        className="space-y-1.5"
                    >
                        {section.links.map((link) => (
                            <LinkRow key={link.href} link={link} accent={section.accent} />
                        ))}
                    </motion.ul>
                )}

                {section.subsections?.map((sub) => (
                    <div key={sub.title} className="mt-4">
                        <div
                            className="text-xs font-semibold uppercase tracking-wider mb-2 px-1"
                            style={{ color: section.accent, opacity: 0.85 }}
                        >
                            {sub.title}
                        </div>
                        <motion.ul
                            variants={listContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            className="space-y-1.5"
                        >
                            {sub.links.map((link) => (
                                <LinkRow key={link.href} link={link} accent={section.accent} />
                            ))}
                        </motion.ul>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}

export default function LearnAIPage() {
    const { username } = useAppStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const totalLinks = LEARN_AI_SECTIONS.reduce(
        (acc, s) => acc + (s.links?.length ?? 0) + (s.subsections?.reduce((a, sub) => a + sub.links.length, 0) ?? 0),
        0
    );

    return (
        <div className="max-w-[1280px] mx-auto space-y-8 animate-fade-in pb-20 px-4">
            {/* Header */}
            <div
                className="relative overflow-hidden rounded-3xl p-8 md:p-12 border shadow-2xl transition-colors duration-300"
                style={{
                    background: 'linear-gradient(135deg, var(--th-nord1), var(--th-nord0))',
                    borderColor: 'color-mix(in srgb, var(--th-nord8) 20%, transparent)',
                }}
            >
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

            {/* Intro */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-6 md:p-8 border relative overflow-hidden"
                style={{
                    background: 'color-mix(in srgb, var(--th-nord0) 80%, transparent)',
                    borderColor: 'color-mix(in srgb, var(--th-nord3) 30%, transparent)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <h2
                    className="text-2xl md:text-3xl font-extrabold mb-2 text-transparent bg-clip-text"
                    style={{ backgroundImage: 'linear-gradient(90deg, var(--th-nord8), var(--th-nord9))' }}
                >
                    {LEARN_AI_INTRO.heading}
                </h2>
                <p className="text-base leading-relaxed" style={{ color: 'var(--th-nord4)' }}>
                    {LEARN_AI_INTRO.body}
                </p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
                    <span
                        className="px-3 py-1.5 rounded-full border"
                        style={{
                            color: 'var(--th-nord8)',
                            background: 'color-mix(in srgb, var(--th-nord8) 10%, transparent)',
                            borderColor: 'color-mix(in srgb, var(--th-nord8) 30%, transparent)',
                        }}
                    >
                        {LEARN_AI_SECTIONS.length} Topics
                    </span>
                    <span
                        className="px-3 py-1.5 rounded-full border"
                        style={{
                            color: 'var(--th-nord14)',
                            background: 'color-mix(in srgb, var(--th-nord14) 10%, transparent)',
                            borderColor: 'color-mix(in srgb, var(--th-nord14) 30%, transparent)',
                        }}
                    >
                        {totalLinks} Curated Resources
                    </span>
                </div>
            </motion.div>

            {/* Section grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {LEARN_AI_SECTIONS.map((section, i) => (
                    <SectionCard key={section.id} section={section} index={i} />
                ))}
            </div>
        </div>
    );
}
