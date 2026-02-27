'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
    ArrowUp,
    MessageSquare,
    ExternalLink,
    RefreshCw,
    TrendingUp,
    Flame,
    Sparkles,
    Loader2,
    User,
    Clock,
    FileText,
    Briefcase,
    Laugh,
} from 'lucide-react';

interface RedditPost {
    id: string;
    title: string;
    author: string;
    score: number;
    url: string;
    permalink: string;
    thumbnail: string;
    is_video: boolean;
    created_utc: number;
    num_comments: number;
    selftext: string;
    post_hint?: string;
    subreddit: string;
    preview?: {
        images: { source: { url: string; width: number; height: number } }[];
    };
}

type SortMode = 'hot' | 'top' | 'new';

const SUBREDDITS: { id: string; label: string; type: 'meme' | 'job' | 'tech' }[] = [
    { id: 'aimemes', label: 'AI Memes', type: 'meme' },
    { id: 'developersIndia', label: 'Dev India', type: 'tech' },
    { id: 'ArtificialInteligence', label: 'AI', type: 'tech' },
    { id: 'Indiajobs', label: 'India Jobs', type: 'job' },
    { id: 'IndiaJobsOpenings', label: 'Job Openings', type: 'job' },
    { id: 'IndianWorkplace', label: 'Workplace', type: 'job' },
    { id: 'ITjobsinindia', label: 'IT Jobs India', type: 'job' },
];

const SORT_OPTIONS: { value: SortMode; label: string; icon: React.ElementType }[] = [
    { value: 'hot', label: 'Hot', icon: Flame },
    { value: 'top', label: 'Top', icon: TrendingUp },
    { value: 'new', label: 'New', icon: Sparkles },
];

const TYPE_COLORS = {
    meme: { bg: 'bg-nord12/15', text: 'text-nord12', border: 'border-nord12/30' },
    job: { bg: 'bg-nord14/15', text: 'text-nord14', border: 'border-nord14/30' },
    tech: { bg: 'bg-nord8/15', text: 'text-nord8', border: 'border-nord8/30' },
};

const TYPE_ICONS = { meme: Laugh, job: Briefcase, tech: MessageSquare };

function timeAgo(utc: number): string {
    const diff = Math.floor(Date.now() / 1000 - utc);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

function formatScore(n: number): string {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function getImageUrl(post: RedditPost): string | null {
    const previewSrc = post.preview?.images?.[0]?.source?.url;
    if (previewSrc) return previewSrc;
    if (post.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return post.url;
    return null;
}

async function fetchSubreddit(sub: string, sort: SortMode): Promise<RedditPost[]> {
    try {
        const res = await fetch(
            `https://www.reddit.com/r/${sub}/${sort}.json?limit=15&raw_json=1`,
            { headers: { Accept: 'application/json' } }
        );
        if (!res.ok) return [];
        const json = await res.json();
        return (json?.data?.children ?? [])
            .map((c: { data: RedditPost }) => ({ ...c.data, subreddit: sub }))
            .filter((p: RedditPost) => !p.is_video && p.title);
    } catch {
        return [];
    }
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function KrackUpdatesPage() {
    const [posts, setPosts] = useState<RedditPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<string[]>([]);
    const [sort, setSort] = useState<SortMode>('hot');
    const [refreshKey, setRefreshKey] = useState(0);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'meme' | 'job' | 'tech'>('all');

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setErrors([]);
        const results = await Promise.allSettled(
            SUBREDDITS.map(s => fetchSubreddit(s.id, sort))
        );
        const errs: string[] = [];
        const all: RedditPost[] = [];
        results.forEach((r, i) => {
            if (r.status === 'fulfilled') all.push(...r.value);
            else errs.push(SUBREDDITS[i].label);
        });
        setPosts(shuffle(all));
        setErrors(errs);
        setLoading(false);
    }, [sort, refreshKey]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const filtered = useMemo(() => {
        if (activeFilter === 'all') return posts;
        const ids = SUBREDDITS.filter(s => s.type === activeFilter).map(s => s.id);
        return posts.filter(p => ids.includes(p.subreddit));
    }, [posts, activeFilter]);

    const subMeta = useMemo(() => {
        const map: Record<string, { label: string; type: 'meme' | 'job' | 'tech' }> = {};
        SUBREDDITS.forEach(s => { map[s.id] = { label: s.label, type: s.type }; });
        return map;
    }, []);

    return (
        <div className="space-y-6 stagger-children">
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-nord12 to-nord11 flex items-center justify-center shadow-lg shadow-nord12/20">
                            <Laugh className="text-white" size={18} />
                        </div>
                        <h1 className="text-2xl font-bold text-nord6 tracking-tight">Krack Updates</h1>
                        <span className="text-[10px] font-mono text-nord4/40 px-2 py-0.5 rounded-lg bg-nord3/20 border border-nord3/30">
                            {SUBREDDITS.length} subreddits
                        </span>
                    </div>
                    <p className="text-nord4/60 text-sm ml-12">
                        Memes, jobs &amp; tech news — all in one feed 🚀
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Sort */}
                    <div className="flex rounded-xl overflow-hidden border border-nord3/40">
                        {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                            <button key={value} onClick={() => setSort(value)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all duration-200 ${sort === value
                                    ? 'bg-nord8/20 text-nord8'
                                    : 'bg-nord1/60 text-nord4/50 hover:text-nord4 hover:bg-nord2/50'
                                    }`}
                            >
                                <Icon size={13} />{label}
                            </button>
                        ))}
                    </div>
                    {/* Refresh */}
                    <button onClick={() => setRefreshKey(k => k + 1)} disabled={loading}
                        className="p-2 rounded-xl border border-nord3/40 bg-nord1/60 text-nord4/50 hover:text-nord8 hover:border-nord8/40 transition-all duration-200 disabled:opacity-30"
                        title="Refresh"
                    >
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* ── Filter pills ── */}
            <div className="flex gap-2 flex-wrap">
                {(['all', 'meme', 'job', 'tech'] as const).map(f => (
                    <button key={f} onClick={() => setActiveFilter(f)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 capitalize ${activeFilter === f
                            ? 'bg-nord8/20 text-nord8 border-nord8/40'
                            : 'bg-nord1/50 text-nord4/50 border-nord3/30 hover:text-nord4 hover:border-nord3/60'
                            }`}
                    >
                        {f === 'all' ? '✦ All' : f === 'meme' ? '😂 Memes' : f === 'job' ? '💼 Jobs' : '⚙️ Tech'}
                        {f !== 'all' && (
                            <span className="ml-1.5 text-[10px] opacity-50">
                                {posts.filter(p => {
                                    const ids = SUBREDDITS.filter(s => s.type === f).map(s => s.id);
                                    return ids.includes(p.subreddit);
                                }).length}
                            </span>
                        )}
                    </button>
                ))}
                <span className="ml-auto text-xs text-nord4/30 self-center">
                    {filtered.length} posts
                </span>
            </div>

            {/* ── Loading ── */}
            {loading && (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                    <Loader2 className="w-7 h-7 text-nord8 animate-spin" />
                    <p className="text-nord4/50 text-sm animate-pulse">
                        Fetching from {SUBREDDITS.length} subreddits…
                    </p>
                </div>
            )}

            {/* ── Errors banner ── */}
            {!loading && errors.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-nord13/10 border border-nord13/20 text-nord13 text-xs">
                    <span>⚠ Could not load: {errors.join(', ')}</span>
                </div>
            )}

            {/* ── Masonry Grid ── */}
            {!loading && (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 overflow-hidden w-full">
                    {filtered.map((post) => {
                        const img = getImageUrl(post);
                        const isExpanded = expandedId === post.id;
                        const meta = subMeta[post.subreddit] ?? { label: post.subreddit, type: 'tech' as const };
                        const colors = TYPE_COLORS[meta.type];
                        const TypeIcon = TYPE_ICONS[meta.type];
                        const hasText = !img && post.selftext;

                        return (
                            <div
                                key={`${post.subreddit}-${post.id}`}
                                className="break-inside-avoid mb-4 group card-nord overflow-hidden cursor-pointer hover:border-nord8/40 transition-all duration-300 hover:shadow-lg hover:shadow-nord8/5 relative"
                                onClick={() => setExpandedId(isExpanded ? null : post.id)}
                            >
                                {/* Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-nord8/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

                                {/* Source badge */}
                                <div className={`absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-semibold ${colors.bg} ${colors.text} ${colors.border}`}>
                                    <TypeIcon size={9} />
                                    r/{meta.label}
                                </div>

                                {/* Image */}
                                {img && (
                                    <div className="relative overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={img} alt={post.title}
                                            className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                            loading="lazy"
                                            onError={(e) => {
                                                const wrapper = (e.target as HTMLImageElement).parentElement;
                                                if (wrapper) wrapper.style.display = 'none';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-nord0/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>
                                )}

                                {/* Text preview (for text posts) */}
                                {hasText && (
                                    <div className="px-3 pt-8 pb-0">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <FileText size={11} className="text-nord4/30" />
                                            <span className="text-[10px] text-nord4/30 font-mono">text post</span>
                                        </div>
                                        <p className={`text-nord4/60 text-xs leading-relaxed italic ${isExpanded ? '' : 'line-clamp-3'}`}>
                                            {post.selftext.slice(0, 240)}{post.selftext.length > 240 && !isExpanded ? '…' : ''}
                                        </p>
                                    </div>
                                )}

                                {/* Content */}
                                <div className={`p-3 relative z-10 ${img ? '' : 'pt-2'}`}>
                                    <p className={`text-nord5 text-sm font-medium leading-snug mb-2 ${img ? 'mt-1' : ''} ${isExpanded ? '' : 'line-clamp-2'}`}>
                                        {post.title}
                                    </p>

                                    <div className="flex items-center justify-between text-[11px] text-nord4/40">
                                        <div className="flex items-center gap-2.5">
                                            <span className="flex items-center gap-1">
                                                <ArrowUp size={11} className="text-nord12" />
                                                <span className="font-semibold text-nord12">{formatScore(post.score)}</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare size={11} />
                                                {post.num_comments}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center gap-1">
                                                <User size={10} />
                                                u/{post.author}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {timeAgo(post.created_utc)}
                                            </span>
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <a
                                            href={`https://reddit.com${post.permalink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="mt-3 flex items-center gap-1.5 w-full justify-center py-1.5 rounded-lg border border-nord8/30 text-nord8 text-xs font-medium hover:bg-nord8/10 transition-colors"
                                        >
                                            View on Reddit <ExternalLink size={12} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {!loading && filtered.length === 0 && (
                        <div className="col-span-full py-12 text-center border border-dashed border-nord3/40 rounded-2xl">
                            <p className="text-nord4/40 text-sm">Nothing to show. Try a different filter or refresh.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
