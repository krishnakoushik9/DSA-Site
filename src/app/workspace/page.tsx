'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
    Search,
    ExternalLink,
    CheckCircle2,
    Circle,
    FileText,
    Pencil,
    Filter,
    ChevronDown,
    X,
    BookOpen,
    StickyNote,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getAllQuestions, DSA_TOPICS_ORDERED } from '@/lib/scheduler';
import { TOPIC_COLORS, Question } from '@/lib/types';

// Dynamic imports for heavy components
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const ExcalidrawWrapper = dynamic(() => import('@/components/ExcalidrawWrapper'), { ssr: false });

type Tab = 'notes' | 'whiteboard';

export default function WorkspacePage() {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<string>('All');
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('notes');
    const [showFilters, setShowFilters] = useState(false);

    const {
        completedQuestions,
        toggleQuestionComplete,
        questionNotes,
        saveQuestionNote,
        excalidrawData,
        saveExcalidrawData,
        customQuestions,
    } = useAppStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    const allQuestions = useMemo(() => {
        return [...getAllQuestions(), ...(customQuestions || [])];
    }, [customQuestions]);

    const filteredQuestions = useMemo(() => {
        return allQuestions.filter(q => {
            const matchesTopic = selectedTopic === 'All' || q.topic === selectedTopic;
            const matchesSearch = !searchQuery ||
                q.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.topic.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesTopic && matchesSearch;
        });
    }, [allQuestions, selectedTopic, searchQuery]);

    const noteContent = selectedQuestion
        ? questionNotes[selectedQuestion.id]?.content || ''
        : '';

    const handleNoteChange = (value?: string) => {
        if (selectedQuestion && value !== undefined) {
            saveQuestionNote(selectedQuestion.id, value);
        }
    };

    if (!mounted) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-nord8 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 mb-4">
                <h1 className="text-3xl font-bold text-nord6 tracking-tight">Workspace</h1>
                <p className="text-nord4/60 mt-1 text-sm">Browse questions, take notes, and sketch on the whiteboard</p>
            </div>

            {/* Main Content — Split Pane */}
            <div className="flex-1 flex gap-4 min-h-0">
                {/* Left Panel — Question Browser */}
                <div className="w-[380px] flex-shrink-0 flex flex-col card-nord overflow-hidden">
                    {/* Search */}
                    <div className="p-4 border-b border-nord3/20">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nord4/40" />
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-nord2/50 border border-nord3/20 rounded-xl text-sm text-nord5 placeholder:text-nord4/30 focus:outline-none focus:ring-2 focus:ring-nord8/30 focus:border-nord8/30 transition-all"
                            />
                        </div>

                        {/* Topic Filter */}
                        <div className="mt-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 text-xs text-nord4/50 hover:text-nord8 transition-colors"
                            >
                                <Filter size={14} />
                                <span>{selectedTopic === 'All' ? 'All Topics' : selectedTopic}</span>
                                <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>

                            {showFilters && (
                                <div className="mt-2 flex flex-wrap gap-1.5 animate-fade-in-up">
                                    <button
                                        onClick={() => setSelectedTopic('All')}
                                        className={`pill text-[10px] ${selectedTopic === 'All'
                                            ? 'bg-nord8/20 text-nord8 border border-nord8/30'
                                            : 'bg-nord3/20 text-nord4/50 border border-nord3/20 hover:border-nord3/40'
                                            }`}
                                    >
                                        All
                                    </button>
                                    {DSA_TOPICS_ORDERED.map(topic => {
                                        const colors = TOPIC_COLORS[topic];
                                        return (
                                            <button
                                                key={topic}
                                                onClick={() => setSelectedTopic(topic)}
                                                className={`pill text-[10px] transition-all ${selectedTopic === topic
                                                    ? `${colors.bg} ${colors.text} border ${colors.border}`
                                                    : 'bg-nord3/20 text-nord4/50 border border-nord3/20 hover:border-nord3/40'
                                                    }`}
                                            >
                                                {topic}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <p className="text-[10px] text-nord4/30 mt-2">
                            {filteredQuestions.length} questions
                        </p>
                    </div>

                    {/* Question List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredQuestions.map((q) => {
                            const isDone = completedQuestions.includes(q.id);
                            const isSelected = selectedQuestion?.id === q.id;
                            const hasNote = !!questionNotes[q.id]?.content;

                            return (
                                <button
                                    key={q.id}
                                    onClick={() => setSelectedQuestion(q)}
                                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${isSelected
                                        ? 'bg-nord8/15 border border-nord8/30'
                                        : 'hover:bg-nord2/40 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {isDone ? (
                                                <CheckCircle2 size={14} className="text-nord14" />
                                            ) : (
                                                <Circle size={14} className="text-nord3" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-medium leading-tight truncate ${isDone ? 'text-nord14/70' : 'text-nord5'
                                                }`}>
                                                {q.problem}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <span className="text-[10px] text-nord4/30">{q.topic}</span>
                                                {hasNote && <StickyNote size={10} className="text-nord13/50" />}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Panel — Notes / Whiteboard */}
                <div className="flex-1 flex flex-col card-nord overflow-hidden">
                    {selectedQuestion ? (
                        <>
                            {/* Question Header */}
                            <div className="flex-shrink-0 p-5 border-b border-nord3/20">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-bold text-nord6 leading-tight">
                                            {selectedQuestion.problem}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            {(() => {
                                                const colors = TOPIC_COLORS[selectedQuestion.topic] || TOPIC_COLORS['Miscellaneous'];
                                                return (
                                                    <span className={`pill ${colors.bg} ${colors.text} border ${colors.border} text-[10px]`}>
                                                        {selectedQuestion.topic}
                                                    </span>
                                                );
                                            })()}
                                            <span className="pill bg-nord3/20 text-nord4/50 border border-nord3/20 text-[10px]">
                                                {selectedQuestion.source}
                                            </span>
                                            <span className="pill bg-nord3/20 text-nord4/50 border border-nord3/20 text-[10px]">
                                                {selectedQuestion.difficulty}
                                            </span>
                                            {selectedQuestion.url && (
                                                <a
                                                    href={selectedQuestion.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 pill bg-nord8/10 text-nord8 border border-nord8/20 text-[10px] hover:bg-nord8/20 transition-colors"
                                                >
                                                    Solve <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Complete toggle */}
                                    <button
                                        onClick={() => toggleQuestionComplete(selectedQuestion.id)}
                                        className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${completedQuestions.includes(selectedQuestion.id)
                                            ? 'bg-nord14/15 text-nord14 border border-nord14/30'
                                            : 'bg-nord2/50 text-nord4/60 border border-nord3/20 hover:border-nord8/30 hover:text-nord8'
                                            }`}
                                    >
                                        {completedQuestions.includes(selectedQuestion.id) ? (
                                            <>
                                                <CheckCircle2 size={16} />
                                                Solved
                                            </>
                                        ) : (
                                            <>
                                                <Circle size={16} />
                                                Mark Solved
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex-shrink-0 flex border-b border-nord3/20">
                                <button
                                    onClick={() => setActiveTab('notes')}
                                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'notes'
                                        ? 'text-nord8 border-nord8'
                                        : 'text-nord4/50 border-transparent hover:text-nord5'
                                        }`}
                                >
                                    <FileText size={16} />
                                    Notes
                                </button>
                                <button
                                    onClick={() => setActiveTab('whiteboard')}
                                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 ${activeTab === 'whiteboard'
                                        ? 'text-nord8 border-nord8'
                                        : 'text-nord4/50 border-transparent hover:text-nord5'
                                        }`}
                                >
                                    <Pencil size={16} />
                                    Whiteboard
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-hidden">
                                {activeTab === 'notes' ? (
                                    <div className="h-full p-4" data-color-mode="dark">
                                        <MDEditor
                                            value={noteContent}
                                            onChange={handleNoteChange}
                                            height="100%"
                                            preview="live"
                                            style={{
                                                height: '100%',
                                                background: 'transparent',
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="h-full">
                                        <ExcalidrawWrapper
                                            boardId={selectedQuestion.id}
                                            data={excalidrawData[selectedQuestion.id]}
                                            onSave={(data) => saveExcalidrawData(selectedQuestion.id, data)}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        /* No question selected */
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-nord3/20 mb-4">
                                    <BookOpen size={32} className="text-nord4/30" />
                                </div>
                                <h3 className="text-lg font-semibold text-nord5 mb-1">Select a Question</h3>
                                <p className="text-nord4/40 text-sm max-w-xs">
                                    Choose a question from the left panel to view details, write notes, or sketch on the whiteboard.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
