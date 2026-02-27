'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    CheckCircle2,
    Circle,
    Zap,
    X,
    BookOpen,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
    getMonthDays,
    getTopicForDate,
    getDailyQuestions,
    getDifficultyForDate,
    getScheduleForDate,
    isExamDay,
    isToday,
    isPast,
    isSameDay,
    format,
} from '@/lib/scheduler';
import { TOPIC_COLORS } from '@/lib/types';

const DIFF_COLORS: Record<string, { dot: string; text: string }> = {
    Easy: { dot: 'bg-nord14', text: 'text-nord14' },
    Medium: { dot: 'bg-nord13', text: 'text-nord13' },
    Hard: { dot: 'bg-nord11', text: 'text-nord11' },
};

export default function CalendarPage() {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [mounted, setMounted] = useState(false);

    const { completedQuestions, toggleQuestionComplete } = useAppStore();

    useEffect(() => { setMounted(true); }, []);

    const days = getMonthDays(currentYear, currentMonth);
    const monthName = format(new Date(currentYear, currentMonth), 'MMMM yyyy');

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
        else setCurrentMonth(currentMonth - 1);
    };
    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
        else setCurrentMonth(currentMonth + 1);
    };

    const getDayStatus = useCallback((date: Date) => {
        const dailyQs = getDailyQuestions(date, completedQuestions);
        if (dailyQs.length === 0) return 'inactive';
        const allDone = dailyQs.every(q => completedQuestions.includes(q.id));
        const someDone = dailyQs.some(q => completedQuestions.includes(q.id));
        const exam = isExamDay(date);
        const past = isPast(date) && !isToday(date);
        if (allDone) return 'complete';
        if (past && !someDone) return 'missed';
        if (exam) return 'exam';
        if (someDone) return 'partial';
        return 'pending';
    }, [completedQuestions]);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-nord8 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Calculate how many rows the grid needs
    const totalRows = Math.ceil(days.length / 7);

    return (
        <div className="h-[calc(100vh-3rem)] flex flex-col gap-3">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-nord6 tracking-tight">Calendar</h1>
                    <p className="text-nord4/50 text-xs">Track your daily study schedule</p>
                </div>
                {/* Legend */}
                <div className="hidden sm:flex items-center gap-3">
                    {[
                        { color: 'bg-nord14', label: 'Done' },
                        { color: 'bg-nord13', label: 'Partial' },
                        { color: 'bg-nord11', label: 'Missed' },
                        { color: 'bg-nord15', label: 'Exam' },
                        { color: 'bg-nord8/30', label: 'Upcoming' },
                    ].map(l => (
                        <div key={l.label} className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${l.color}`} />
                            <span className="text-[10px] text-nord4/40">{l.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Calendar + Detail Split */}
            <div className="flex-1 flex gap-3 min-h-0">
                {/* Calendar Grid — fills available height */}
                <div className="flex-1 card-nord flex flex-col overflow-hidden">
                    {/* Month Nav */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-nord3/15 flex-shrink-0">
                        <button onClick={prevMonth} className="btn-ghost !p-2 !rounded-lg hover:bg-nord2/50">
                            <ChevronLeft size={18} />
                        </button>
                        <h2 className="text-base font-bold text-nord5">{monthName}</h2>
                        <button onClick={nextMonth} className="btn-ghost !p-2 !rounded-lg hover:bg-nord2/50">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-nord3/10 flex-shrink-0">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                            <div key={d} className="text-center text-[11px] font-semibold text-nord4/30 py-2 border-r border-nord3/8 last:border-r-0">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day Grid — stretches to fill */}
                    <div className="flex-1 grid grid-cols-7 grid-rows-auto" style={{ gridTemplateRows: `repeat(${totalRows}, 1fr)` }}>
                        {days.map((date, i) => {
                            const isCurrentMonth = date.getMonth() === currentMonth;
                            const today = isToday(date);
                            const selected = selectedDate && isSameDay(date, selectedDate);
                            const status = getDayStatus(date);
                            const exam = isExamDay(date);
                            const topic = getTopicForDate(date);
                            const diff = getDifficultyForDate(date);
                            const sched = getScheduleForDate(date);
                            const diffStyle = DIFF_COLORS[diff] || { dot: '', text: '' };

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(date)}
                                    className={`relative flex flex-col p-1.5 sm:p-2 border-r border-b border-nord3/8 last:border-r-0 transition-all duration-150 text-left group
                                        ${!isCurrentMonth ? 'opacity-25 bg-nord0/20' : 'hover:bg-nord2/30'}
                                        ${selected ? 'bg-nord8/10 ring-1 ring-inset ring-nord8/30' : ''}
                                        ${today ? 'bg-nord8/5' : ''}
                                    `}
                                >
                                    {/* Date number */}
                                    <div className="flex items-center justify-between w-full">
                                        <span className={`text-sm font-semibold leading-none ${today ? 'text-nord8' :
                                                !isCurrentMonth ? 'text-nord3' : 'text-nord4'
                                            }`}>
                                            {date.getDate()}
                                        </span>
                                        {today && (
                                            <span className="text-[8px] font-bold text-nord8 bg-nord8/10 px-1 rounded">
                                                TODAY
                                            </span>
                                        )}
                                    </div>

                                    {/* Topic & Difficulty - visible on larger screens */}
                                    {isCurrentMonth && status !== 'inactive' && sched && (
                                        <div className="mt-auto hidden sm:block">
                                            <p className="text-[9px] text-nord4/35 truncate leading-tight mt-0.5">
                                                {topic}
                                            </p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                {diff && <div className={`w-1.5 h-1.5 rounded-full ${diffStyle.dot}`} />}
                                                <span className={`text-[8px] font-medium ${diffStyle.text || 'text-nord4/20'}`}>
                                                    {diff || ''}
                                                </span>
                                                {exam && (
                                                    <Zap size={8} className="text-nord15 ml-auto" />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Status dots - always visible */}
                                    {status !== 'inactive' && (
                                        <div className="flex gap-0.5 mt-auto sm:mt-1">
                                            {status === 'complete' && <div className="w-1.5 h-1.5 rounded-full bg-nord14" />}
                                            {status === 'missed' && <div className="w-1.5 h-1.5 rounded-full bg-nord11" />}
                                            {status === 'partial' && <div className="w-1.5 h-1.5 rounded-full bg-nord13" />}
                                            {status === 'pending' && <div className="w-1.5 h-1.5 rounded-full bg-nord8/30" />}
                                            {exam && <div className="w-1.5 h-1.5 rounded-full bg-nord15 sm:hidden" />}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Day Detail Panel — Side panel when a date is selected */}
                {selectedDate && (
                    <DayDetailPanel
                        date={selectedDate}
                        completedQuestions={completedQuestions}
                        toggleQuestionComplete={toggleQuestionComplete}
                        onClose={() => setSelectedDate(null)}
                    />
                )}
            </div>
        </div>
    );
}

function DayDetailPanel({
    date,
    completedQuestions,
    toggleQuestionComplete,
    onClose,
}: {
    date: Date;
    completedQuestions: string[];
    toggleQuestionComplete: (id: string) => void;
    onClose: () => void;
}) {
    const topic = getTopicForDate(date);
    const questions = getDailyQuestions(date, completedQuestions);
    const sched = getScheduleForDate(date);
    const exam = isExamDay(date);
    const colors = TOPIC_COLORS[topic] || TOPIC_COLORS['Miscellaneous'];
    const diff = sched?.difficulty || '';
    const diffStyle = DIFF_COLORS[diff] || { dot: '', text: '' };
    const completedToday = questions.filter(q => completedQuestions.includes(q.id)).length;

    return (
        <div className="w-[320px] flex-shrink-0 card-nord flex flex-col overflow-hidden animate-slide-in-left hidden xl:flex">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-nord3/15">
                <div>
                    <p className="text-nord4/35 text-[10px] font-medium">{format(date, 'EEEE')}</p>
                    <h3 className="text-nord6 font-bold text-sm">{format(date, 'MMM d, yyyy')}</h3>
                </div>
                <button onClick={onClose} className="text-nord4/25 hover:text-nord4 transition-colors p-1 rounded-lg hover:bg-nord2/30">
                    <X size={16} />
                </button>
            </div>

            {/* Topic Info */}
            <div className="px-4 py-3 border-b border-nord3/10">
                {sched ? (
                    <>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <span className={`pill !text-[9px] !px-2 !py-0.5 ${colors.bg} ${colors.text} border ${colors.border}`}>
                                {topic}
                            </span>
                            {diff && (
                                <span className={`pill !text-[9px] !px-2 !py-0.5 bg-nord2/50 ${diffStyle.text} border border-nord3/15`}>
                                    {diff}
                                </span>
                            )}
                            {exam && (
                                <span className="pill !text-[9px] !px-2 !py-0.5 bg-nord15/10 text-nord15 border border-nord15/20">
                                    <Zap size={8} className="mr-0.5 inline" /> Exam
                                </span>
                            )}
                        </div>
                        <p className="text-[9px] text-nord4/25">
                            Day {sched.topicDayIndex + 1} of {sched.topicTotalDays} • {questions.length} questions
                        </p>
                        {/* Mini progress */}
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1 rounded-full bg-nord2">
                                <div
                                    className="h-full rounded-full bg-nord14 transition-all duration-500"
                                    style={{ width: questions.length > 0 ? `${(completedToday / questions.length) * 100}%` : '0%' }}
                                />
                            </div>
                            <span className="text-[9px] text-nord4/30 font-medium">{completedToday}/{questions.length}</span>
                        </div>
                    </>
                ) : (
                    <p className="text-nord4/30 text-xs italic">Study not started for this day.</p>
                )}
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
                <p className="text-nord4/30 text-[10px] font-semibold uppercase tracking-wider mb-1">
                    Questions
                </p>
                {questions.length === 0 ? (
                    <p className="text-nord4/20 text-xs italic">No questions assigned.</p>
                ) : (
                    questions.map((q) => {
                        const isDone = completedQuestions.includes(q.id);
                        return (
                            <div
                                key={q.id}
                                className={`flex items-start gap-2 p-2 rounded-lg transition-all duration-150 ${isDone
                                        ? 'bg-nord14/5 border border-nord14/10'
                                        : 'bg-nord2/15 border border-nord3/10 hover:border-nord3/25'
                                    }`}
                            >
                                <button
                                    onClick={() => toggleQuestionComplete(q.id)}
                                    className="mt-px flex-shrink-0"
                                >
                                    {isDone ? (
                                        <CheckCircle2 size={14} className="text-nord14" />
                                    ) : (
                                        <Circle size={14} className="text-nord3 hover:text-nord8 transition-colors" />
                                    )}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-medium leading-tight ${isDone ? 'text-nord14/50 line-through' : 'text-nord5'
                                        }`}>
                                        {q.problem}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[9px] text-nord4/25">{q.source}</span>
                                        {q.url && (
                                            <a href={q.url} target="_blank" rel="noopener noreferrer"
                                                className="text-nord8/40 hover:text-nord8 transition-colors">
                                                <ExternalLink size={9} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
