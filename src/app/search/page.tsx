'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Search,
    CheckCircle2,
    Circle,
    ExternalLink,
    Filter,
    X,
    Hash,
    Plus,
    LinkIcon,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getAllQuestions, DSA_TOPICS_ORDERED } from '@/lib/scheduler';
import { TOPIC_COLORS } from '@/lib/types';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DIFF_COLORS: Record<string, string> = {
    Easy: 'text-nord14 bg-nord14/10 border-nord14/20',
    Medium: 'text-nord13 bg-nord13/10 border-nord13/20',
    Hard: 'text-nord11 bg-nord11/10 border-nord11/20',
};

export default function SearchPage() {
    const { completedQuestions, toggleQuestionComplete, customQuestions, addCustomQuestion } = useAppStore();
    const [query, setQuery] = useState('');
    const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
    const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
    const [showCompleted, setShowCompleted] = useState<'all' | 'done' | 'pending'>('all');
    const [mounted, setMounted] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newQ, setNewQ] = useState({ problem: '', url: '', topic: 'Array', difficulty: 'Medium' });

    useEffect(() => { setMounted(true); }, []);

    const allQuestions = useMemo(() => {
        return [...getAllQuestions(), ...(customQuestions || [])];
    }, [customQuestions]);

    const filtered = useMemo(() => {
        return allQuestions.filter(q => {
            // Text search
            if (query) {
                const lq = query.toLowerCase();
                const matchesText = q.problem.toLowerCase().includes(lq)
                    || q.topic.toLowerCase().includes(lq)
                    || (q.source || '').toLowerCase().includes(lq);
                if (!matchesText) return false;
            }

            // Topic filter
            if (selectedTopics.size > 0 && !selectedTopics.has(q.topic)) return false;

            // Difficulty filter
            if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false;

            // Completion filter
            const isDone = completedQuestions.includes(q.id);
            if (showCompleted === 'done' && !isDone) return false;
            if (showCompleted === 'pending' && isDone) return false;

            return true;
        });
    }, [allQuestions, query, selectedTopics, selectedDifficulty, showCompleted, completedQuestions]);

    const toggleTopic = (topic: string) => {
        setSelectedTopics(prev => {
            const next = new Set(prev);
            if (next.has(topic)) next.delete(topic); else next.add(topic);
            return next;
        });
    };

    const clearFilters = () => {
        setQuery('');
        setSelectedTopics(new Set());
        setSelectedDifficulty(null);
        setShowCompleted('all');
    };

    const hasFilters = query || selectedTopics.size > 0 || selectedDifficulty || showCompleted !== 'all';

    if (!mounted) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-nord8 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const completedInResults = filtered.filter(q => completedQuestions.includes(q.id)).length;

    return (
        <div className="h-[calc(100vh-3rem)] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 mb-3">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-2xl font-bold text-nord6 tracking-tight">Search</h1>
                        <p className="text-nord4/50 text-xs">{allQuestions.length} questions • {completedQuestions.length} solved</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {hasFilters && (
                            <button onClick={clearFilters}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-nord11/60 border border-nord11/15 hover:bg-nord11/5 transition-all">
                                <X size={10} /> Clear
                            </button>
                        )}
                        <button onClick={() => setIsAdding(true)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium bg-nord8/10 text-nord8 border border-nord8/20 hover:bg-nord8/20 transition-all">
                            <Plus size={10} /> Add Question
                        </button>
                    </div>
                </div>

                {/* Add Question Form (Conditional) */}
                {isAdding && (
                    <div className="mb-4 p-4 bg-nord1/60 border border-nord8/20 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="text-xs font-bold text-nord8 uppercase tracking-wider flex items-center gap-1.5">
                                <Plus size={12} /> Add Custom Question
                            </h3>
                            <button onClick={() => setIsAdding(false)} className="text-nord4/30 hover:text-nord11 transition-colors">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] text-nord4/40 font-medium ml-1">Problem Name</label>
                                <input
                                    value={newQ.problem}
                                    onChange={e => setNewQ({ ...newQ, problem: e.target.value })}
                                    placeholder="e.g. Reverse a String"
                                    className="w-full px-3 py-2 bg-nord0/50 border border-nord3/20 rounded-lg text-sm text-nord5 focus:ring-1 focus:ring-nord8/30 outline-none"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-nord4/40 font-medium ml-1 flex items-center gap-1">
                                    <LinkIcon size={10} /> URL / Link
                                </label>
                                <input
                                    value={newQ.url}
                                    onChange={e => setNewQ({ ...newQ, url: e.target.value })}
                                    placeholder="https://leetcode.com/problems/..."
                                    className="w-full px-3 py-2 bg-nord0/50 border border-nord3/20 rounded-lg text-sm text-nord5 focus:ring-1 focus:ring-nord8/30 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] text-nord4/40 font-medium ml-1">Topic</label>
                                <select
                                    value={newQ.topic}
                                    onChange={e => setNewQ({ ...newQ, topic: e.target.value })}
                                    className="w-full px-3 py-2 bg-nord0/50 border border-nord3/20 rounded-lg text-sm text-nord5 focus:ring-1 focus:ring-nord8/30 outline-none appearance-none"
                                >
                                    {DSA_TOPICS_ORDERED.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-nord4/40 font-medium ml-1">Difficulty</label>
                                <select
                                    value={newQ.difficulty}
                                    onChange={e => setNewQ({ ...newQ, difficulty: e.target.value })}
                                    className="w-full px-3 py-2 bg-nord0/50 border border-nord3/20 rounded-lg text-sm text-nord5 focus:ring-1 focus:ring-nord8/30 outline-none appearance-none"
                                >
                                    {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={() => {
                                        if (!newQ.problem || !newQ.url) return;
                                        addCustomQuestion(newQ);
                                        setNewQ({ problem: '', url: '', topic: 'Array', difficulty: 'Medium' });
                                        setIsAdding(false);
                                    }}
                                    disabled={!newQ.problem || !newQ.url}
                                    className="w-full py-2 bg-nord8 text-nord0 text-xs font-bold rounded-lg hover:bg-nord9 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Save Question
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Input */}
                <div className="relative mb-3">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nord4/20" />
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search questions, topics, sources..."
                        className="w-full pl-9 pr-4 py-2.5 bg-nord1/40 border border-nord3/15 rounded-xl text-sm text-nord5 placeholder:text-nord3/30 focus:outline-none focus:ring-2 focus:ring-nord8/20 focus:border-nord8/20 transition-all"
                        autoFocus
                    />
                    {query && (
                        <button onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-nord4/20 hover:text-nord4/40">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filters Row */}
                <div className="space-y-2">
                    {/* Difficulty + Status */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] text-nord4/20 font-semibold uppercase tracking-wider">Difficulty:</span>
                        {DIFFICULTIES.map(d => (
                            <button key={d} onClick={() => setSelectedDifficulty(selectedDifficulty === d ? null : d)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all ${selectedDifficulty === d ? DIFF_COLORS[d] : 'bg-nord2/10 text-nord4/20 border-nord3/5 hover:text-nord4/35'
                                    }`}>
                                {d}
                            </button>
                        ))}

                        <span className="text-nord3/15 mx-1">|</span>

                        <span className="text-[9px] text-nord4/20 font-semibold uppercase tracking-wider">Status:</span>
                        {(['all', 'pending', 'done'] as const).map(s => (
                            <button key={s} onClick={() => setShowCompleted(s)}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-all ${showCompleted === s
                                    ? 'bg-nord8/10 text-nord8 border-nord8/20'
                                    : 'bg-nord2/10 text-nord4/20 border-nord3/5 hover:text-nord4/35'
                                    }`}>
                                {s === 'all' ? 'All' : s === 'done' ? '✓ Done' : '○ Pending'}
                            </button>
                        ))}
                    </div>

                    {/* Topic pills - scrollable */}
                    <div className="flex gap-1 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        {DSA_TOPICS_ORDERED.map(topic => {
                            const colors = TOPIC_COLORS[topic] || TOPIC_COLORS['Miscellaneous'];
                            const active = selectedTopics.has(topic);
                            return (
                                <button key={topic} onClick={() => toggleTopic(topic)}
                                    className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[9px] font-medium border transition-all ${active ? `${colors.bg} ${colors.text} ${colors.border}` : 'bg-nord2/8 text-nord4/15 border-nord3/5 hover:text-nord4/25'
                                        }`}>
                                    {topic}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between py-2 border-b border-nord3/8 flex-shrink-0">
                <p className="text-[10px] text-nord4/25">
                    <span className="font-bold text-nord4/40">{filtered.length}</span> results
                    {completedInResults > 0 && <span className="ml-1 text-nord14/40">• {completedInResults} solved</span>}
                </p>
                {selectedTopics.size > 0 && (
                    <p className="text-[9px] text-nord4/15">{selectedTopics.size} topic{selectedTopics.size > 1 ? 's' : ''} selected</p>
                )}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4C566A #2E3440' }}>
                {filtered.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <Search size={28} className="text-nord3/15 mx-auto mb-2" />
                            <p className="text-sm text-nord4/20">No questions match your search</p>
                            <p className="text-[10px] text-nord4/10 mt-1">Try different keywords or clear filters</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-nord3/5">
                        {filtered.map(q => {
                            const isDone = completedQuestions.includes(q.id);
                            const colors = TOPIC_COLORS[q.topic] || TOPIC_COLORS['Miscellaneous'];
                            const diffColor = DIFF_COLORS[q.difficulty || ''] || '';

                            return (
                                <div key={q.id} className={`flex items-center gap-3 py-2.5 px-1 group transition-colors ${isDone ? 'opacity-50' : 'hover:bg-nord2/8'}`}>
                                    <button onClick={() => toggleQuestionComplete(q.id)} className="flex-shrink-0">
                                        {isDone ? (
                                            <CheckCircle2 size={16} className="text-nord14" />
                                        ) : (
                                            <Circle size={16} className="text-nord3/30 group-hover:text-nord8/40 transition-colors" />
                                        )}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-medium leading-tight truncate ${isDone ? 'line-through text-nord4/30' : 'text-nord5'}`}>
                                            {q.problem}
                                        </p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className={`text-[8px] font-medium px-1.5 py-px rounded ${colors.bg} ${colors.text}`}>{q.topic}</span>
                                            {q.difficulty && <span className={`text-[8px] font-medium px-1.5 py-px rounded border ${diffColor}`}>{q.difficulty}</span>}
                                            <span className="text-[8px] text-nord4/15">{q.source}</span>
                                        </div>
                                    </div>

                                    {q.url && (
                                        <a href={q.url} target="_blank" rel="noopener noreferrer"
                                            className="flex-shrink-0 text-nord4/10 hover:text-nord8 transition-colors p-1">
                                            <ExternalLink size={13} />
                                        </a>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
