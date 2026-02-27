'use client';

import { useEffect, useState, useMemo } from 'react';
import {
    Gift,
    Search,
    Filter,
    DollarSign,
    ExternalLink,
    ShieldCheck,
    Zap,
    Tag,
    Loader2
} from 'lucide-react';
import PerkDetailModal, { PerkFrontmatter } from '@/components/PerkDetailModal';

interface PerksData {
    stats: {
        totalMarketValue: number;
        activeCount: number;
        verifiedCount: number;
        lastUpdated: string;
    };
    perks: PerkFrontmatter[];
}

export default function PerksPage() {
    const [data, setData] = useState<PerksData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedPerk, setSelectedPerk] = useState<PerkFrontmatter | null>(null);

    useEffect(() => {
        const fetchPerks = async () => {
            try {
                const res = await fetch('/api/scrape-perks');
                if (!res.ok) throw new Error('Failed to fetch perks');
                const json = await res.json();
                setData(json);
            } catch (err: any) {
                setError(err.message || 'Error fetching perks');
            } finally {
                setLoading(false);
            }
        };
        fetchPerks();
    }, []);

    const categories = useMemo(() => {
        if (!data) return ['All'];
        const cats = new Set<string>();
        data.perks.forEach(p => p.categories?.forEach(c => cats.add(c)));
        return ['All', ...Array.from(cats)].sort();
    }, [data]);

    const filteredPerks = useMemo(() => {
        if (!data) return [];
        return data.perks.filter(p => {
            const matchSearch = p.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchCategory = selectedCategory === 'All' || p.categories?.includes(selectedCategory);
            return matchSearch && matchCategory;
        });
    }, [data, searchQuery, selectedCategory]);

    return (
        <div className="space-y-6 stagger-children relative min-h-[80vh]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Gift className="text-nord8" size={24} />
                        <h1 className="text-2xl font-bold text-nord6 tracking-tight">Startup Perks</h1>
                    </div>
                    <p className="text-nord4/60 text-sm max-w-xl">
                        Exclusive credits, discounts, and benefits for building your startup.
                        Curated list of resources gathered from around the web.
                    </p>
                </div>
                {data && (
                    <div className="flex gap-3">
                        <div className="card-nord px-4 py-2 flex flex-col items-center justify-center min-w-[100px]">
                            <span className="text-[10px] text-nord4/50 font-bold uppercase tracking-wider mb-0.5">Value</span>
                            <span className="text-lg font-extrabold text-nord14">
                                ${(data.stats.totalMarketValue / 1000).toFixed(0)}k+
                            </span>
                        </div>
                        <div className="card-nord px-4 py-2 flex flex-col items-center justify-center min-w-[100px]">
                            <span className="text-[10px] text-nord4/50 font-bold uppercase tracking-wider mb-0.5">Active</span>
                            <span className="text-lg font-extrabold text-nord8">
                                {data.stats.activeCount}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {error ? (
                <div className="bg-nord11/10 border border-nord11/30 rounded-2xl p-6 text-center">
                    <p className="text-nord11 font-medium">{error}</p>
                </div>
            ) : loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 className="w-8 h-8 text-nord8 animate-spin" />
                    <p className="text-nord4/60 text-sm font-medium animate-pulse">Scraping latest perks data...</p>
                </div>
            ) : (
                <>
                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-nord4/40" size={18} />
                            <input
                                type="text"
                                placeholder="Search companies or deals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-nord1/50 border border-nord3/50 text-nord6 placeholder:text-nord4/40 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-nord8/50 focus:ring-1 focus:ring-nord8/50 transition-all"
                            />
                        </div>
                        <div className="relative min-w-[160px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-nord4/40" size={16} />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full bg-nord1/50 border border-nord3/50 text-nord6 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-nord8/50 focus:ring-1 focus:ring-nord8/50 transition-all appearance-none cursor-pointer"
                            >
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredPerks.map((perk) => (
                            <div
                                key={perk.slug}
                                onClick={() => setSelectedPerk(perk)}
                                className="group card-nord p-5 cursor-pointer hover:border-nord8/40 transition-all duration-300 flex flex-col h-full hover:shadow-lg hover:shadow-nord8/5 relative overflow-hidden"
                            >
                                {/* Background glow on hover */}
                                <div className="absolute inset-0 bg-gradient-to-br from-nord8/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                <div className="flex items-start justify-between mb-3 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-nord6 group-hover:text-nord8 transition-colors">
                                            {perk.company}
                                        </h3>
                                        {perk.verified && <ShieldCheck size={16} className="text-nord14" />}
                                    </div>
                                    {perk.perkType === 'credit' && (
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs font-semibold text-nord14 px-2 py-0.5 rounded-md bg-nord14/15 flex items-center gap-1">
                                                <DollarSign size={12} /> Credits
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm font-medium text-nord4/90 mb-2 relative z-10 max-w-[90%]">{perk.title}</p>
                                <p className="text-xs text-nord4/60 line-clamp-2 mb-4 relative z-10">{perk.summary}</p>

                                <div className="mt-auto pt-4 border-t border-nord3/30 flex items-center justify-between relative z-10">
                                    <span className="text-sm font-bold text-nord8">{perk.amountDisplay}</span>
                                    <button className="text-[10px] font-semibold text-nord4/50 group-hover:text-nord8 transition-colors flex items-center gap-1 uppercase tracking-wider">
                                        View Details <ExternalLink size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredPerks.length === 0 && (
                            <div className="col-span-full py-12 text-center border border-dashed border-nord3/50 rounded-2xl">
                                <p className="text-nord4/60">No perks found matching your filters.</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {selectedPerk && (
                <PerkDetailModal perk={selectedPerk} onClose={() => setSelectedPerk(null)} />
            )}
        </div>
    );
}
