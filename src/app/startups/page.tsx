'use client';

import { useState, useMemo, useEffect } from 'react';
import {
    Search,
    ExternalLink,
    Shield,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
    Sparkles,
    TrendingUp,
    Award,
    Filter,
    X,
    ArrowUpDown,
    Rocket,
    DollarSign,
    Globe,
    Calendar,
    Tag,
    CheckCircle2,
    Info,
} from 'lucide-react';
import perksData from '@/data/perks.json';

/* ── types ─────────────────────────────────────────────────── */
interface Perk {
    company: string;
    title: string;
    summary: string;
    perkType: string;
    amountDisplay: string;
    creditValueUsd?: number;
    currency?: string;
    eligibility: string;
    fundingStages: string[];
    regions: string[];
    categories: string[];
    applyUrl: string;
    sourceUrl: string;
    lastVerified: string;
    verified: boolean;
    isActive: boolean;
    slug: string;
    body: string;
}

/* ── helpers ───────────────────────────────────────────────── */
const ALL_CATEGORIES = Array.from(
    new Set(perksData.perks.flatMap((p: Perk) => p.categories))
).sort();

const ALL_STAGES = Array.from(
    new Set(perksData.perks.flatMap((p: Perk) => p.fundingStages))
);
const STAGE_ORDER = ['Bootstrapped', 'Pre-seed', 'Seed', 'Series A', 'Series B'];
const SORTED_STAGES = STAGE_ORDER.filter(s => ALL_STAGES.includes(s));

type SortKey = 'value' | 'company' | 'recent';

const categoryColors: Record<string, { bg: string; text: string }> = {
    Cloud: { bg: 'rgba(136,192,208,0.15)', text: '#88C0D0' },
    AI: { bg: 'rgba(180,142,173,0.15)', text: '#B48EAD' },
    Security: { bg: 'rgba(191,97,106,0.15)', text: '#BF616A' },
    DevOps: { bg: 'rgba(163,190,140,0.15)', text: '#A3BE8C' },
    'Developer Tools': { bg: 'rgba(129,161,193,0.15)', text: '#81A1C1' },
    Database: { bg: 'rgba(208,135,112,0.15)', text: '#D08770' },
    Analytics: { bg: 'rgba(235,203,139,0.15)', text: '#EBCB8B' },
    Infrastructure: { bg: 'rgba(94,129,172,0.15)', text: '#5E81AC' },
    Monitoring: { bg: 'rgba(143,188,187,0.15)', text: '#8FBCBB' },
    Fintech: { bg: 'rgba(235,203,139,0.15)', text: '#EBCB8B' },
    Marketing: { bg: 'rgba(208,135,112,0.15)', text: '#D08770' },
    Productivity: { bg: 'rgba(163,190,140,0.15)', text: '#A3BE8C' },
    Blockchain: { bg: 'rgba(180,142,173,0.15)', text: '#B48EAD' },
    Web3: { bg: 'rgba(180,142,173,0.15)', text: '#B48EAD' },
    Data: { bg: 'rgba(129,161,193,0.15)', text: '#81A1C1' },
};

function getCatColor(cat: string) {
    return categoryColors[cat] ?? { bg: 'rgba(76,86,106,0.3)', text: '#D8DEE9' };
}

function formatUsd(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n}`;
}

/* ── page ──────────────────────────────────────────────────── */
export default function StartupsPage() {
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedStage, setSelectedStage] = useState<string | null>(null);
    const [verifiedOnly, setVerifiedOnly] = useState(false);
    const [sortBy, setSortBy] = useState<SortKey>('value');
    const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const perks = perksData.perks as Perk[];
    const stats = perksData.stats;

    /* filter + sort */
    const filtered = useMemo(() => {
        let list = [...perks];

        if (query) {
            const q = query.toLowerCase();
            list = list.filter(
                (p) =>
                    p.company.toLowerCase().includes(q) ||
                    p.title.toLowerCase().includes(q) ||
                    p.summary.toLowerCase().includes(q) ||
                    p.categories.some((c) => c.toLowerCase().includes(q))
            );
        }
        if (selectedCategory) {
            list = list.filter((p) => p.categories.includes(selectedCategory));
        }
        if (selectedStage) {
            list = list.filter((p) => p.fundingStages.includes(selectedStage));
        }
        if (verifiedOnly) {
            list = list.filter((p) => p.verified);
        }

        switch (sortBy) {
            case 'value':
                list.sort((a, b) => (b.creditValueUsd ?? 0) - (a.creditValueUsd ?? 0));
                break;
            case 'company':
                list.sort((a, b) => a.company.localeCompare(b.company));
                break;
            case 'recent':
                list.sort(
                    (a, b) =>
                        new Date(b.lastVerified).getTime() -
                        new Date(a.lastVerified).getTime()
                );
                break;
        }
        return list;
    }, [perks, query, selectedCategory, selectedStage, verifiedOnly, sortBy]);

    const totalFilteredValue = filtered.reduce(
        (acc, p) => acc + (p.creditValueUsd ?? 0),
        0
    );

    if (!mounted) return null;

    return (
        <div className="min-h-screen py-8 px-4 md:px-8 max-w-7xl mx-auto">
            {/* ───── Hero Header ───── */}
            <div className="relative mb-10">
                {/* Glow background */}
                <div
                    className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #88C0D0 0%, transparent 70%)' }}
                />
                <div
                    className="absolute -top-10 right-0 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #B48EAD 0%, transparent 70%)' }}
                />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase"
                            style={{ background: 'rgba(163,190,140,0.15)', color: '#A3BE8C' }}>
                            Startup Directory
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3"
                        style={{ color: '#ECEFF4' }}>
                        <span className="bg-gradient-to-r from-nord8 via-nord9 to-nord15 bg-clip-text text-transparent">
                            Startup
                        </span>{' '}
                        Perks
                    </h1>
                    <p className="text-nord4/60 text-lg max-w-2xl mb-8">
                        High-fidelity directory of infrastructure grants and software perks for
                        modern founders. Save up to{' '}
                        <span className="text-nord14 font-semibold">
                            ${stats.totalMarketValue.toLocaleString()}+
                        </span>{' '}
                        in credits.
                    </p>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            {
                                icon: DollarSign,
                                label: 'Total Market Value',
                                value: `$${stats.totalMarketValue.toLocaleString()}+`,
                                color: '#A3BE8C',
                            },
                            {
                                icon: Rocket,
                                label: 'Active Perks',
                                value: stats.activeCount.toString(),
                                color: '#88C0D0',
                            },
                            {
                                icon: ShieldCheck,
                                label: 'Verified',
                                value: stats.verifiedCount.toString(),
                                color: '#B48EAD',
                            },
                            {
                                icon: Calendar,
                                label: 'Last Updated',
                                value: stats.lastUpdated,
                                color: '#EBCB8B',
                            },
                        ].map((s, i) => (
                            <div
                                key={i}
                                className="rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02]"
                                style={{
                                    background: 'rgba(59,66,82,0.6)',
                                    border: '1px solid rgba(76,86,106,0.3)',
                                    backdropFilter: 'blur(16px)',
                                }}
                            >
                                <s.icon size={18} style={{ color: s.color }} className="mb-2" />
                                <p className="text-[11px] uppercase tracking-wider text-nord4/40 mb-1">
                                    {s.label}
                                </p>
                                <p className="text-xl font-bold" style={{ color: s.color }}>
                                    {s.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ───── Search + Filter Bar ───── */}
            <div className="mb-6 space-y-4">
                {/* Search row */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-nord4/40"
                        />
                        <input
                            id="perks-search"
                            type="text"
                            placeholder="Search by provider, stage, or category..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm bg-nord1 border border-nord3/40 text-nord5 placeholder:text-nord4/30 focus:outline-none focus:border-nord8/60 focus:ring-1 focus:ring-nord8/30 transition-all"
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-nord4/40 hover:text-nord5 transition"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Sort dropdown */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all border ${showFilters
                                ? 'bg-nord8/15 text-nord8 border-nord8/30'
                                : 'bg-nord1 text-nord4/70 border-nord3/40 hover:border-nord8/30'
                                }`}
                        >
                            <Filter size={16} />
                            Filters
                            {(selectedCategory || selectedStage || verifiedOnly) && (
                                <span className="w-2 h-2 rounded-full bg-nord8 animate-pulse" />
                            )}
                        </button>

                        <div className="relative">
                            <select
                                id="sort-perks"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortKey)}
                                className="appearance-none bg-nord1 border border-nord3/40 rounded-xl px-4 py-3 pr-10 text-sm text-nord4/70 focus:outline-none focus:border-nord8/30 transition cursor-pointer"
                            >
                                <option value="value">Highest Value</option>
                                <option value="company">Company A-Z</option>
                                <option value="recent">Recently Verified</option>
                            </select>
                            <ArrowUpDown
                                size={14}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-nord4/40 pointer-events-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Filter panel */}
                {showFilters && (
                    <div
                        className="rounded-2xl p-5 space-y-4 animate-fade-in-up"
                        style={{
                            background: 'rgba(59,66,82,0.5)',
                            border: '1px solid rgba(76,86,106,0.3)',
                            backdropFilter: 'blur(12px)',
                        }}
                    >
                        {/* Categories */}
                        <div>
                            <p className="text-[11px] uppercase tracking-wider text-nord4/40 mb-2 flex items-center gap-1.5">
                                <Tag size={12} /> Categories
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {ALL_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() =>
                                            setSelectedCategory(
                                                selectedCategory === cat ? null : cat
                                            )
                                        }
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                                        style={{
                                            background:
                                                selectedCategory === cat
                                                    ? getCatColor(cat).bg
                                                    : 'rgba(46,52,64,0.6)',
                                            color:
                                                selectedCategory === cat
                                                    ? getCatColor(cat).text
                                                    : 'rgba(216,222,233,0.5)',
                                            border: `1px solid ${selectedCategory === cat
                                                ? getCatColor(cat).text + '40'
                                                : 'rgba(76,86,106,0.3)'
                                                }`,
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stages */}
                        <div>
                            <p className="text-[11px] uppercase tracking-wider text-nord4/40 mb-2 flex items-center gap-1.5">
                                <TrendingUp size={12} /> Startup Stage
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {SORTED_STAGES.map((stage) => (
                                    <button
                                        key={stage}
                                        onClick={() =>
                                            setSelectedStage(
                                                selectedStage === stage ? null : stage
                                            )
                                        }
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${selectedStage === stage
                                            ? 'bg-nord8/15 text-nord8 border-nord8/30'
                                            : 'bg-nord0/60 text-nord4/50 border-nord3/30 hover:border-nord8/20'
                                            }`}
                                    >
                                        {stage}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Verified toggle + clear */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={verifiedOnly}
                                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 rounded-full bg-nord3/60 peer-checked:bg-nord14/60 relative transition-colors">
                                    <div
                                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-nord5 transition-transform ${verifiedOnly ? 'translate-x-4' : ''
                                            }`}
                                    />
                                </div>
                                <span className="text-sm text-nord4/60">
                                    Show Verified Only
                                </span>
                            </label>

                            {(selectedCategory || selectedStage || verifiedOnly) && (
                                <button
                                    onClick={() => {
                                        setSelectedCategory(null);
                                        setSelectedStage(null);
                                        setVerifiedOnly(false);
                                    }}
                                    className="text-xs text-nord11/60 hover:text-nord11 transition"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Result count */}
                <div className="flex items-center justify-between text-sm text-nord4/40">
                    <span>
                        Showing <span className="text-nord8 font-semibold">{filtered.length}</span>{' '}
                        perks worth{' '}
                        <span className="text-nord14 font-semibold">
                            {formatUsd(totalFilteredValue)}
                        </span>
                    </span>
                </div>
            </div>

            {/* ───── Perks Table ───── */}
            <div className="space-y-2">
                {/* Table header */}
                <div
                    className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 rounded-xl text-[11px] uppercase tracking-wider text-nord4/30 font-semibold"
                    style={{ background: 'rgba(46,52,64,0.4)' }}
                >
                    <div className="col-span-2">Provider</div>
                    <div className="col-span-4">Offer</div>
                    <div className="col-span-3">Categories</div>
                    <div className="col-span-2">Value</div>
                    <div className="col-span-1 text-right">Action</div>
                </div>

                {/* Perk rows */}
                {filtered.map((perk, idx) => {
                    const isExpanded = expandedSlug === perk.slug;
                    return (
                        <div
                            key={perk.slug}
                            className="animate-fade-in-up"
                            style={{ animationDelay: `${Math.min(idx * 20, 400)}ms` }}
                        >
                            {/* Main row */}
                            <div
                                className="rounded-2xl transition-all duration-300 cursor-pointer group"
                                style={{
                                    background: isExpanded
                                        ? 'rgba(59,66,82,0.8)'
                                        : 'rgba(59,66,82,0.4)',
                                    border: `1px solid ${isExpanded
                                        ? 'rgba(136,192,208,0.2)'
                                        : 'rgba(76,86,106,0.2)'
                                        }`,
                                    backdropFilter: 'blur(8px)',
                                }}
                                onClick={() =>
                                    setExpandedSlug(isExpanded ? null : perk.slug)
                                }
                            >
                                {/* Desktop */}
                                <div className="hidden md:grid grid-cols-12 gap-4 items-center px-5 py-4">
                                    {/* Provider */}
                                    <div className="col-span-2 flex items-center gap-2">
                                        <div
                                            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                                            style={{
                                                background: `linear-gradient(135deg, ${getCatColor(perk.categories[0]).bg}, rgba(46,52,64,0.8))`,
                                                color: getCatColor(perk.categories[0]).text,
                                                border: `1px solid ${getCatColor(perk.categories[0]).text}30`,
                                            }}
                                        >
                                            {perk.company.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-semibold text-nord5 truncate">
                                                    {perk.company}
                                                </span>
                                                {perk.verified && (
                                                    <ShieldCheck
                                                        size={14}
                                                        className="text-nord14 flex-shrink-0"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Offer */}
                                    <div className="col-span-4 min-w-0">
                                        <p className="text-sm font-medium text-nord5 truncate">
                                            {perk.title}
                                        </p>
                                        <p className="text-xs text-nord4/40 truncate mt-0.5">
                                            {perk.summary}
                                        </p>
                                    </div>

                                    {/* Categories */}
                                    <div className="col-span-3 flex flex-wrap gap-1.5">
                                        {perk.categories.slice(0, 3).map((cat) => (
                                            <span
                                                key={cat}
                                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                                style={{
                                                    background: getCatColor(cat).bg,
                                                    color: getCatColor(cat).text,
                                                }}
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Value */}
                                    <div className="col-span-2">
                                        <span className="text-sm font-bold text-nord14">
                                            {perk.creditValueUsd
                                                ? formatUsd(perk.creditValueUsd)
                                                : 'Varies'}
                                        </span>
                                        <p className="text-[10px] text-nord4/30 mt-0.5">
                                            {perk.perkType}
                                        </p>
                                    </div>

                                    {/* Expand */}
                                    <div className="col-span-1 flex justify-end">
                                        <div className="text-nord4/30 group-hover:text-nord8 transition">
                                            {isExpanded ? (
                                                <ChevronUp size={18} />
                                            ) : (
                                                <ChevronDown size={18} />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile */}
                                <div className="md:hidden p-4">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                                            style={{
                                                background: `linear-gradient(135deg, ${getCatColor(perk.categories[0]).bg}, rgba(46,52,64,0.8))`,
                                                color: getCatColor(perk.categories[0]).text,
                                                border: `1px solid ${getCatColor(perk.categories[0]).text}30`,
                                            }}
                                        >
                                            {perk.company.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-sm font-semibold text-nord5">
                                                    {perk.company}
                                                </span>
                                                {perk.verified && (
                                                    <ShieldCheck size={14} className="text-nord14" />
                                                )}
                                                <span className="ml-auto text-sm font-bold text-nord14">
                                                    {perk.creditValueUsd
                                                        ? formatUsd(perk.creditValueUsd)
                                                        : 'Varies'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-nord4/50 mb-2 line-clamp-2">
                                                {perk.title}
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                                {perk.categories.slice(0, 2).map((cat) => (
                                                    <span
                                                        key={cat}
                                                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                                        style={{
                                                            background: getCatColor(cat).bg,
                                                            color: getCatColor(cat).text,
                                                        }}
                                                    >
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-nord4/30">
                                            {isExpanded ? (
                                                <ChevronUp size={16} />
                                            ) : (
                                                <ChevronDown size={16} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Expanded detail ── */}
                            {isExpanded && (
                                <div
                                    className="rounded-b-2xl -mt-2 pt-6 pb-5 px-5 animate-fade-in-up"
                                    style={{
                                        background: 'rgba(46,52,64,0.6)',
                                        borderLeft: '1px solid rgba(136,192,208,0.15)',
                                        borderRight: '1px solid rgba(136,192,208,0.15)',
                                        borderBottom: '1px solid rgba(136,192,208,0.15)',
                                    }}
                                >
                                    <div className="grid md:grid-cols-3 gap-6">
                                        {/* Left: Details */}
                                        <div className="md:col-span-2 space-y-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-nord6 mb-1">
                                                    {perk.title}
                                                </h3>
                                                <p className="text-sm text-nord4/60 leading-relaxed">
                                                    {perk.body || perk.summary}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[11px] uppercase tracking-wider text-nord4/30 mb-1.5 flex items-center gap-1">
                                                    <Shield size={11} /> Eligibility
                                                </p>
                                                <p className="text-sm text-nord4/70">
                                                    {perk.eligibility}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[11px] uppercase tracking-wider text-nord4/30 mb-1.5 flex items-center gap-1">
                                                    <TrendingUp size={11} /> Funding Stages
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {perk.fundingStages.map((s) => (
                                                        <span
                                                            key={s}
                                                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-nord0/60 text-nord4/60 border border-nord3/20"
                                                        >
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Sidebar */}
                                        <div className="space-y-4">
                                            <a
                                                href={perk.applyUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn-frost w-full flex items-center justify-center gap-2 text-sm"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Claim Offer
                                                <ExternalLink size={14} />
                                            </a>

                                            <div
                                                className="rounded-xl p-4 space-y-3"
                                                style={{
                                                    background: 'rgba(59,66,82,0.4)',
                                                    border: '1px solid rgba(76,86,106,0.2)',
                                                }}
                                            >
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-nord4/30">
                                                        Value
                                                    </p>
                                                    <p className="text-sm font-semibold text-nord14">
                                                        {perk.amountDisplay}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-nord4/30">
                                                        Last Verified
                                                    </p>
                                                    <p className="text-sm text-nord4/70">
                                                        {new Date(perk.lastVerified).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-nord4/30">
                                                        Regions
                                                    </p>
                                                    <div className="flex items-center gap-1 text-sm text-nord4/70">
                                                        <Globe size={12} />
                                                        {perk.regions.join(', ')}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-nord4/30">
                                                        Status
                                                    </p>
                                                    <div className="flex items-center gap-1.5">
                                                        <div
                                                            className={`w-2 h-2 rounded-full ${perk.isActive
                                                                ? 'bg-nord14'
                                                                : 'bg-nord11'
                                                                }`}
                                                        />
                                                        <span
                                                            className={`text-sm font-medium ${perk.isActive
                                                                ? 'text-nord14'
                                                                : 'text-nord11'
                                                                }`}
                                                        >
                                                            {perk.isActive
                                                                ? 'Active'
                                                                : 'Inactive'}
                                                        </span>
                                                        {perk.verified && (
                                                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-nord14/15 text-nord14 font-semibold">
                                                                VERIFIED
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-nord4/30">
                                                        Source
                                                    </p>
                                                    <a
                                                        href={perk.sourceUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-nord8 hover:underline flex items-center gap-1"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Official source
                                                        <ExternalLink size={11} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="text-center py-20">
                        <Sparkles size={48} className="mx-auto text-nord3 mb-4" />
                        <p className="text-nord4/40 text-lg">No perks match your filters</p>
                        <button
                            onClick={() => {
                                setQuery('');
                                setSelectedCategory(null);
                                setSelectedStage(null);
                                setVerifiedOnly(false);
                            }}
                            className="mt-4 text-sm text-nord8 hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* ── Footer attribution ── */}
            <div className="mt-12 text-center">
                <p className="text-xs text-nord4/20">
                    Data sourced from{' '}
                    <a
                        href="https://startup-perks.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-nord8/40 hover:text-nord8 transition"
                    >
                        startup-perks.com
                    </a>{' '}
                    · CC BY 4.0 · Auto-updated via scraping API
                </p>
            </div>
        </div>
    );
}
