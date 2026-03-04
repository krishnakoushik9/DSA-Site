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
    Dumbbell,
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
import { getWorkoutForDate } from '@/lib/workout';

interface Contest {
    id: string;
    title: string;
    platform: 'LeetCode' | 'Codeforces';
    startTime: number;
    duration: number;
    url: string;
}

const PLATFORM_COLORS: Record<string, string> = {
    LeetCode: 'bg-nord13/20 text-nord13 border-nord13/30',
    Codeforces: 'bg-nord9/20 text-nord9 border-nord9/30',
};

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
    const [contests, setContests] = useState<Contest[]>([]);

    const { completedQuestions, toggleQuestionComplete } = useAppStore();

    useEffect(() => {
        setMounted(true);
        fetch('/api/contests')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setContests(data);
            })
            .catch(err => console.error('Failed to fetch contests:', err));
    }, []);

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
        if (past && someDone && !allDone) return 'missed-partial'; // some done but not all, past
        if (past && !someDone) return 'missed';
        if (exam) return 'exam';
        if (someDone) return 'partial';
        return 'pending';
    }, [completedQuestions]);

    // Calculate lag: total uncompleted questions from all past non-complete days up to (not including) today
    const lagCount = (() => {
        const today = new Date();
        let lag = 0;
        // Go back from yesterday up to study start
        const start = new Date(2026, 1, 25); // STUDY_START_DATE Feb 25 2026
        const cursor = new Date(today);
        cursor.setDate(cursor.getDate() - 1); // start from yesterday
        while (cursor >= start) {
            const qs = getDailyQuestions(cursor, completedQuestions);
            if (qs.length > 0) {
                const incomplete = qs.filter(q => !completedQuestions.includes(q.id)).length;
                lag += incomplete;
            }
            cursor.setDate(cursor.getDate() - 1);
        }
        return lag;
    })();

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
                            const dayContests = contests.filter(c => isSameDay(new Date(c.startTime), date));
                            const isMissed = isCurrentMonth && (status === 'missed' || status === 'missed-partial');

                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(date)}
                                    className={`relative flex flex-col p-1.5 sm:p-2 border-r border-b border-nord3/8 last:border-r-0 transition-all duration-150 text-left group
                                        ${!isCurrentMonth ? 'opacity-25 bg-nord0/20' : 'hover:bg-nord2/30'}
                                        ${selected ? 'bg-nord8/10 ring-1 ring-inset ring-nord8/30' : ''}
                                        ${today ? 'bg-nord8/5' : ''}
                                        ${isMissed ? 'missed-day-glow' : ''}
                                    `}
                                    style={isMissed ? {
                                        animation: 'missed-pulse 2.5s ease-in-out infinite',
                                        background: status === 'missed-partial'
                                            ? 'linear-gradient(135deg, rgba(235,142,9,0.07) 0%, rgba(191,97,106,0.09) 100%)'
                                            : 'rgba(191,97,106,0.07)',
                                    } : undefined}
                                >
                                    {/* Date number */}
                                    <div className="flex items-center justify-between w-full">
                                        <span className={`text-sm font-semibold leading-none ${today ? 'text-nord8' :
                                            isMissed ? 'text-nord11/80' :
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

                                    {/* Lag badge — only on today */}
                                    {today && lagCount > 0 && (
                                        <div
                                            className="absolute bottom-1 right-1 flex items-center gap-0.5 px-1 py-0.5 rounded"
                                            style={{
                                                background: 'rgba(191,97,106,0.18)',
                                                border: '1px solid rgba(191,97,106,0.4)',
                                                boxShadow: '0 0 6px rgba(191,97,106,0.3)',
                                            }}
                                            title={`${lagCount} questions behind schedule`}
                                        >
                                            <span className="text-[7px] font-bold" style={{ color: '#bf616a' }}>
                                                -{lagCount}
                                            </span>
                                        </div>
                                    )}

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

                                    {/* Contests - small pills */}
                                    {isCurrentMonth && dayContests.length > 0 && (
                                        <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                                            {dayContests.map(c => (
                                                <div key={c.id} className={`text-[7px] px-1 rounded border leading-none py-0.5 truncate font-bold ${PLATFORM_COLORS[c.platform]}`}>
                                                    {c.platform === 'LeetCode' ? 'LC' : 'CF'}: {c.title}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Status dots - always visible */}
                                    {status !== 'inactive' && (
                                        <div className="flex gap-0.5 mt-auto sm:mt-1">
                                            {status === 'complete' && <div className="w-1.5 h-1.5 rounded-full bg-nord14" />}
                                            {status === 'missed' && <div className="w-1.5 h-1.5 rounded-full bg-nord11" title="Missed" />}
                                            {status === 'missed-partial' && <div className="w-1.5 h-1.5 rounded-full bg-nord11" title="Partially missed" />}
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
                        contests={contests.filter(c => isSameDay(new Date(c.startTime), selectedDate!))}
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
    contests,
    onClose,
}: {
    date: Date;
    completedQuestions: string[];
    toggleQuestionComplete: (id: string) => void;
    contests: Contest[];
    onClose: () => void;
}) {
    const topic = getTopicForDate(date);
    const questions = getDailyQuestions(date, completedQuestions);
    const sched = getScheduleForDate(date);
    const exam = isExamDay(date);
    const workout = getWorkoutForDate(date);
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto w-full">
                {/* Contests List */}
                {contests.length > 0 && (
                    <div className="px-4 py-3 border-b border-nord3/10 space-y-2">
                        <p className="text-nord4/30 text-[10px] font-semibold uppercase tracking-wider">
                            Upcoming Contests
                        </p>
                        {contests.map(c => (
                            <a
                                key={c.id}
                                href={c.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center justify-between p-2 rounded-lg border transition-all hover:scale-[1.02] ${PLATFORM_COLORS[c.platform]}`}
                            >
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold truncate leading-tight">{c.title}</p>
                                    <p className="text-[8px] opacity-70">
                                        {format(new Date(c.startTime), 'h:mm a')} • {Math.round(c.duration / 3600000)}h
                                    </p>
                                </div>
                                <ExternalLink size={10} className="flex-shrink-0 ml-2" />
                            </a>
                        ))}
                    </div>
                )}

                {/* Workout List */}
                {workout && (
                    <div className="px-4 py-3 border-b border-nord3/10 space-y-2">
                        <p className="flex items-center text-nord4/30 text-[10px] font-semibold uppercase tracking-wider mb-1">
                            <Dumbbell size={10} className="mr-1 inline" /> Gym Split ({workout.isRest ? 'Rest' : 'Workout'})
                        </p>
                        <div className="bg-nord2/20 border border-nord3/10 rounded-lg p-2.5 space-y-1.5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-nord8">{workout.title}</span>
                            </div>
                            {workout.exercises.map((ex, i) => (
                                <div key={i} className="flex justify-between text-[10px] border-t border-nord3/10 pt-1.5 mt-1.5 first:border-0 first:pt-0 first:mt-0">
                                    <div className="flex flex-col">
                                        <span className="text-nord4/90 font-medium">{ex.name}</span>
                                        {ex.notes && <span className="text-[8px] text-nord4/40 mt-0.5">{ex.notes}</span>}
                                    </div>
                                    <span className="text-nord13 font-semibold text-right flex-shrink-0 ml-2 mt-px">
                                        {ex.sets} × {ex.reps}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Questions List */}
                <div className="px-4 py-3 space-y-1.5">
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
        </div>
    );
}
