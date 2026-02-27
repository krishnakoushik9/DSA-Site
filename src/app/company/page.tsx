'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import {
    Briefcase, Search, CheckCircle2, Circle,
    ExternalLink, ChevronRight, Loader2, Sparkles, Building2, Laugh
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CompanyQuestion {
    id: string; // The LeetCode ID
    url: string;
    title: string;
    difficulty: string;
    acceptance: string;
    frequency: string;
}

export default function CompanyModePage() {
    const { completedQuestions, toggleQuestionComplete, setSidebarCollapsed, setPremiumPopupOpen } = useAppStore();
    const [pageLoading, setPageLoading] = useState(true);
    const [companies, setCompanies] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingCompanies, setLoadingCompanies] = useState(true);

    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [questions, setQuestions] = useState<CompanyQuestion[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questionSearch, setQuestionSearch] = useState('');

    useEffect(() => {
        // Auto collapse sidebar
        setSidebarCollapsed(true);

        // Show premium popup
        setPremiumPopupOpen(true);

        // Pulsating loading effect for 2 seconds
        const timer = setTimeout(() => setPageLoading(false), 2000);
        return () => clearTimeout(timer);
    }, [setSidebarCollapsed, setPremiumPopupOpen]);

    useEffect(() => {
        if (pageLoading) return; // Don't fetch while intro loading

        const fetchCompanies = async () => {
            try {
                // Fetch directory contents from the repository
                const res = await fetch('https://api.github.com/repos/snehasishroy/leetcode-companywise-interview-questions/contents');
                if (!res.ok) throw new Error('Failed to fetch companies');
                const data: any[] = await res.json();

                // Filter only directories (which represent companies)
                const companyNames = data
                    .filter(item => item.type === 'dir' && !item.name.startsWith('.'))
                    .map(item => item.name);

                setCompanies(companyNames);
            } catch (err) {
                console.error(err);
                setError('Could not load company list. GitHub API limit may be reached.');
            } finally {
                setLoadingCompanies(false);
            }
        };

        fetchCompanies();
    }, [pageLoading]);

    const fetchQuestions = async (company: string) => {
        setLoadingQuestions(true);
        setError(null);
        setQuestions([]);
        setSelectedCompany(company);

        try {
            const res = await fetch(`https://raw.githubusercontent.com/snehasishroy/leetcode-companywise-interview-questions/master/${encodeURIComponent(company)}/all.csv`);
            if (!res.ok) {
                // Fallback: try finding other csvs if all.csv doesn't exist
                const dirRes = await fetch(`https://api.github.com/repos/snehasishroy/leetcode-companywise-interview-questions/contents/${encodeURIComponent(company)}`);
                if (!dirRes.ok) throw new Error('Questions not found for this company.');

                const dirData: any[] = await dirRes.json();
                const csvFile = dirData.find(item => item.name.endsWith('.csv'));
                if (!csvFile) throw new Error('No question data found for this company.');

                const fallbackRes = await fetch(csvFile.download_url);
                if (!fallbackRes.ok) throw new Error('Failed to download question data.');
                const csvText = await fallbackRes.text();
                parseAndSetCSV(csvText);
            } else {
                const csvText = await res.text();
                parseAndSetCSV(csvText);
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to load questions.');
        } finally {
            setLoadingQuestions(false);
        }
    };

    const parseAndSetCSV = (csvText: string) => {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length <= 1) return; // Only header or empty

        // ID,URL,Title,Difficulty,Acceptance %,Frequency %
        const parsed: CompanyQuestion[] = lines.slice(1).map(line => {
            const matches = line.match(/(?:\"([^\"]*)\"|([^,]*))(?:,|$)/g);
            if (!matches) return null;
            const fields = matches.map(m => m.replace(/,$/, '').replace(/^"|"$/g, '').trim());

            return {
                id: fields[0],
                url: fields[1],
                title: fields[2],
                difficulty: fields[3],
                acceptance: fields[4],
                frequency: fields[5]
            };
        }).filter(Boolean) as CompanyQuestion[];

        setQuestions(parsed);
    };

    const getDifficultyColor = (diff: string) => {
        const d = diff?.toLowerCase() || '';
        if (d === 'easy') return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
        if (d === 'medium') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        if (d === 'hard') return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    };

    const filteredCompanies = companies.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredQuestions = questions.filter(q => q.title.toLowerCase().includes(questionSearch.toLowerCase()));

    if (pageLoading) {
        return (
            <div className="h-screen w-full bg-[#030303] flex flex-col items-center justify-center font-sans tracking-wide relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03)_0%,transparent_50%)]" />
                <motion.div
                    animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="flex flex-col items-center gap-6 z-10"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/90 to-amber-600/90 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.2)] backdrop-blur-sm border border-amber-300/20">
                        <Briefcase size={28} className="text-[#030303]" />
                    </div>
                </motion.div>

                <div className="mt-8 flex flex-col items-center gap-2 z-10">
                    <h2 className="text-amber-500/90 text-sm font-medium tracking-[0.2em] uppercase">Initializing Workspace</h2>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-light">
                        <Loader2 size={12} className="animate-spin text-amber-500/70" />
                        <span>Synchronizing logic gates...</span>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-10 flex items-center gap-2 text-[10px] text-zinc-600/80 font-light tracking-wide"
                >
                    made with love for CMR Students by CMR Student + Claude Code <Laugh size={12} className="text-zinc-500/60" />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-[#030303] text-zinc-300 font-sans p-4 md:p-8 flex flex-col items-center overflow-hidden">
            {/* Header */}
            <div className="w-full max-w-[1400px] flex flex-col sm:flex-row items-center justify-between mb-6 shrink-0 relative z-10">
                <div className="flex flex-col items-start gap-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/5 text-amber-500/90 border border-amber-500/10 backdrop-blur-md">
                        <Sparkles size={12} className="text-amber-400" />
                        <span className="text-[10px] font-medium tracking-widest uppercase">Premium</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-zinc-100 flex items-center gap-3">
                        Company Mode
                    </h1>
                    <p className="text-zinc-500 text-xs md:text-sm font-light tracking-wide max-w-lg">
                        Target tech giants. Dynamically load & conquer real interview questions.
                    </p>
                </div>
            </div>

            <div className="w-full max-w-[1400px] flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 relative z-10 pb-4">
                {/* Left Sidebar: Companies */}
                <div className="lg:col-span-1 flex flex-col min-h-0 bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-black/40">
                        <div className="relative group">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500/70 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search companies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs font-light focus:outline-none focus:border-amber-500/30 focus:bg-white/10 transition-all text-zinc-200 placeholder:text-zinc-600"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {loadingCompanies ? (
                            <div className="flex flex-col items-center justify-center h-full text-amber-500/40 gap-3">
                                <Loader2 className="animate-spin" size={20} />
                                <span className="text-[10px] uppercase tracking-widest font-medium">Fetching...</span>
                            </div>
                        ) : filteredCompanies.length === 0 ? (
                            <div className="text-center text-zinc-600 text-xs mt-8 font-light">No companies found.</div>
                        ) : (
                            <ul className="space-y-0.5">
                                {filteredCompanies.map(company => (
                                    <li key={company}>
                                        <button
                                            onClick={() => fetchQuestions(company)}
                                            className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-light transition-all duration-300 flex items-center justify-between group ${selectedCompany === company
                                                ? 'bg-amber-500/10 text-amber-400/90'
                                                : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                                                }`}
                                        >
                                            <span className="truncate capitalize tracking-wide">{company}</span>
                                            {selectedCompany === company && <ChevronRight size={14} className="text-amber-500/70" />}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right Panel: Questions */}
                <div className="lg:col-span-3 flex flex-col min-h-0 bg-[#0a0a0a]/80 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden">
                    {!selectedCompany && !loadingQuestions ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_50%)]" />
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 backdrop-blur-sm shadow-xl">
                                <Building2 size={24} className="text-zinc-600" />
                            </div>
                            <h3 className="text-lg font-medium text-zinc-300 mb-2 tracking-wide">Select a Workspace</h3>
                            <p className="text-zinc-500 text-xs font-light max-w-sm leading-relaxed tracking-wide">
                                Choose a company from the list to synchronize with their interview patterns and frequently asked questions.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="p-5 border-b border-white/5 bg-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                                <div>
                                    <h2 className="text-xl font-medium text-zinc-100 capitalize tracking-wide flex items-center gap-2">
                                        {selectedCompany}
                                    </h2>
                                    <p className="text-amber-500/70 text-[10px] font-medium tracking-widest uppercase mt-1">
                                        {questions.length} Problems
                                    </p>
                                </div>
                                <div className="relative w-full sm:max-w-[240px] group">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500/70 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Filter topics..."
                                        value={questionSearch}
                                        onChange={(e) => setQuestionSearch(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-xs font-light focus:outline-none focus:border-amber-500/30 focus:bg-white/10 transition-all text-zinc-200 placeholder:text-zinc-600"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative">
                                {loadingQuestions ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm z-10 gap-4">
                                        <Loader2 className="animate-spin text-amber-500/70" size={24} />
                                        <p className="text-[10px] text-amber-500/70 uppercase tracking-widest font-medium">Synchronizing Data...</p>
                                    </div>
                                ) : error ? (
                                    <div className="flex flex-col items-center justify-center h-full text-red-400 gap-4">
                                        <p className="text-xs font-light bg-red-950/20 px-4 py-3 rounded-xl border border-red-900/30 tracking-wide text-red-300/80">{error}</p>
                                    </div>
                                ) : filteredQuestions.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-zinc-500 text-xs font-light tracking-wide">
                                        No questions match your filter.
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        <AnimatePresence>
                                            {filteredQuestions.map((q, idx) => {
                                                const globalId = q.url ? q.url.split('problems/')[1]?.replace('/', '') : q.title.toLowerCase().replace(/\s+/g, '-');
                                                const finalId = globalId || `company-${q.id}`;
                                                const isCompleted = completedQuestions.includes(finalId);

                                                return (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 5 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.015, duration: 0.2 }}
                                                        key={finalId + idx}
                                                    >
                                                        <div className={`p-4 rounded-xl border transition-all duration-300 flex items-center gap-4 group ${isCompleted
                                                            ? 'bg-amber-500/[0.03] border-amber-500/10'
                                                            : 'bg-white/[0.02] border-white/5 hover:border-amber-500/20 hover:bg-white/[0.04]'
                                                            }`}>
                                                            <button
                                                                onClick={() => toggleQuestionComplete(finalId)}
                                                                className={`flex-shrink-0 transition-transform duration-300 ${isCompleted ? 'text-amber-500 scale-105 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'text-zinc-600 hover:text-amber-500/60 hover:scale-105'
                                                                    }`}
                                                            >
                                                                {isCompleted ? <CheckCircle2 size={18} className="fill-amber-500/10" /> : <Circle size={18} strokeWidth={1.5} />}
                                                            </button>

                                                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <h4 className={`text-sm tracking-wide truncate transition-colors font-light ${isCompleted ? 'text-amber-100/80' : 'text-zinc-300 group-hover:text-zinc-100'}`}>
                                                                        {q.title}
                                                                    </h4>
                                                                    {q.url && (
                                                                        <a
                                                                            href={q.url}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-zinc-600 hover:text-amber-400 transition-colors shrink-0"
                                                                        >
                                                                            <ExternalLink size={12} />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${getDifficultyColor(q.difficulty)}`}>
                                                                        {q.difficulty}
                                                                    </span>
                                                                    {q.acceptance && (
                                                                        <span className="text-zinc-500 px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-light tracking-wide">
                                                                            Acc: {q.acceptance}
                                                                        </span>
                                                                    )}
                                                                    {q.frequency && (
                                                                        <span className="text-zinc-500 px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-light tracking-wide flex items-center gap-1.5">
                                                                            <div className="w-1 h-1 rounded-full bg-amber-500/50" />
                                                                            Freq: {q.frequency}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            {/* Background effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full mix-blend-screen opacity-50" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-zinc-500/5 blur-[120px] rounded-full mix-blend-screen opacity-50" />
            </div>
        </div>
    );
}
