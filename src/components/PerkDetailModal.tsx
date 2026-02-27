import React from 'react';
import {
    X,
    ExternalLink,
    ShieldCheck,
    MapPin,
    Tag,
    Building2,
    Banknote,
    DollarSign,
    Info,
    CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface PerkFrontmatter {
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

interface PerkDetailModalProps {
    perk: PerkFrontmatter | null;
    onClose: () => void;
}

export default function PerkDetailModal({ perk, onClose }: PerkDetailModalProps) {
    if (!perk) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-nord0 border border-nord3/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-fade-in-up flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Profile */}
                <div className="sticky top-0 bg-nord1/95 backdrop-blur z-10 border-b border-nord3/40 px-6 py-5 flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold tracking-tight text-nord6">
                                {perk.company}
                            </h2>
                            {perk.verified && (
                                <span title="Verified"><ShieldCheck size={18} className="text-nord14" /></span>
                            )}
                            {!perk.isActive && (
                                <span className="px-2 py-0.5 rounded-full bg-nord11/15 text-nord11 text-[10px] font-bold tracking-wider uppercase">
                                    Inactive
                                </span>
                            )}
                        </div>
                        <p className="text-nord4/80 text-sm">{perk.title}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-nord4/50 hover:bg-nord2 hover:text-nord6 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 md:p-8 space-y-8">
                    {/* Key Attributes Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="card-nord p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-nord8 mb-1">
                                <DollarSign size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-nord4/60">Value</span>
                            </div>
                            <span className="font-semibold text-lg text-nord6">{perk.amountDisplay || 'Varies'}</span>
                            {perk.creditValueUsd ? <span className="text-xs text-nord4/40">~${perk.creditValueUsd} USD</span> : null}
                        </div>
                        <div className="card-nord p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-nord15 mb-1">
                                <Tag size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-nord4/60">Type</span>
                            </div>
                            <span className="font-semibold text-nord6 capitalize">{perk.perkType}</span>
                        </div>
                        <div className="card-nord p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-nord13 mb-1">
                                <Building2 size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-nord4/60">Stages</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {perk.fundingStages?.length ? perk.fundingStages.map(s => (
                                    <span key={s} className="px-1.5 py-0.5 bg-nord3/40 rounded text-xs text-nord4">{s}</span>
                                )) : <span className="text-nord4/50 text-xs">Any</span>}
                            </div>
                        </div>
                        <div className="card-nord p-4 flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-nord12 mb-1">
                                <MapPin size={16} />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-nord4/60">Regions</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {perk.regions?.length ? perk.regions.map(r => (
                                    <span key={r} className="px-1.5 py-0.5 bg-nord3/40 rounded text-xs text-nord4">{r}</span>
                                )) : <span className="text-nord4/50 text-xs">Global</span>}
                            </div>
                        </div>
                    </div>

                    {/* Eligibility & Summary */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-nord9/5 border border-nord9/20 rounded-2xl p-5">
                            <h3 className="flex items-center gap-2 text-nord9 font-semibold mb-3">
                                <Info size={18} /> Summary
                            </h3>
                            <p className="text-sm text-nord4/80 leading-relaxed">
                                {perk.summary}
                            </p>
                        </div>
                        <div className="bg-nord14/5 border border-nord14/20 rounded-2xl p-5">
                            <h3 className="flex items-center gap-2 text-nord14 font-semibold mb-3">
                                <CheckCircle2 size={18} /> Eligibility
                            </h3>
                            <p className="text-sm text-nord4/80 leading-relaxed">
                                {perk.eligibility}
                            </p>
                        </div>
                    </div>

                    {/* Markdown Body */}
                    {perk.body && (
                        <div className="border-t border-nord3/40 pt-6">
                            <h3 className="text-lg font-bold text-nord6 mb-4">Details & Instructions</h3>
                            <div className="prose prose-invert prose-nord max-w-none text-sm leading-relaxed">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {perk.body}
                                </ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-nord1/95 backdrop-blur z-10 border-t border-nord3/40 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
                    <div className="text-xs text-nord4/40 flex items-center gap-2">
                        <span>Last Verified: {perk.lastVerified || 'N/A'}</span>
                        {perk.categories?.length > 0 && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-nord4/30" />
                                <div className="flex gap-1">
                                    {perk.categories.map(c => (
                                        <span key={c} className="text-nord8">{c}</span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        {perk.sourceUrl && (
                            <a
                                href={perk.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-nord3 hover:bg-nord2 hover:text-nord6 text-nord4 text-sm font-medium transition-colors"
                            >
                                Source <ExternalLink size={16} />
                            </a>
                        )}
                        <a
                            href={perk.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-nord8 to-nord9 hover:from-nord9 hover:to-nord10 text-nord0 text-sm font-bold shadow-lg shadow-nord8/20 transition-all hover:scale-[1.02]"
                        >
                            Apply Now <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
