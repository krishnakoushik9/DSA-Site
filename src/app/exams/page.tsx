'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Zap,
    ExternalLink,
    CheckCircle2,
    Circle,
    Trophy,
    Clock,
    AlertTriangle,
    PlayCircle,
    RefreshCw,
    Award,
    History,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getExamQuestions, isExamDay, formatDate, formatDateDisplay } from '@/lib/scheduler';
import { Question } from '@/lib/types';

export default function ExamsPage() {
    const [mounted, setMounted] = useState(false);
    const [examQuestions, setExamQuestions] = useState<Question[]>([]);
    const [examStarted, setExamStarted] = useState(false);
    const [solvedInExam, setSolvedInExam] = useState<string[]>([]);

    const {
        completedQuestions,
        examSessions,
        customQuestions,
        addExamSession,
        completeExamSession,
        toggleQuestionComplete,
        setPremiumPopupOpen,
    } = useAppStore();

    useEffect(() => {
        setMounted(true);
        setPremiumPopupOpen(true);
    }, [setPremiumPopupOpen]);

    const todayIsExam = isExamDay(new Date());
    const todayKey = formatDate(new Date());
    const todayExam = examSessions.find(e => e.date === todayKey);

    const startExam = useCallback(() => {
        const questions = getExamQuestions(completedQuestions, customQuestions || []);
        setExamQuestions(questions);
        setSolvedInExam([]);
        setExamStarted(true);

        // Register the exam session
        if (!todayExam) {
            addExamSession({
                id: `exam_${todayKey}`,
                date: todayKey,
                questions: questions.map(q => q.id),
                completed: false,
                score: 0,
            });
        }
    }, [completedQuestions, todayKey, todayExam, addExamSession]);

    const toggleExamQuestion = (qId: string) => {
        setSolvedInExam(prev =>
            prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
        );
    };

    const submitExam = () => {
        const score = solvedInExam.length;
        completeExamSession(`exam_${todayKey}`, score);

        // Also mark these as completed globally
        solvedInExam.forEach(qId => {
            if (!completedQuestions.includes(qId)) {
                toggleQuestionComplete(qId);
            }
        });

        setExamStarted(false);
    };

    if (!mounted) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="w-8 h-8 border-2 border-nord15 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const completedExams = examSessions.filter(e => e.completed);
    const totalScore = completedExams.reduce((sum, e) => sum + e.score, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-nord6 tracking-tight">Thrice-a-Week Exams</h1>
                <p className="text-nord4/60 mt-1 text-sm">
                    Random challenges every Monday, Wednesday & Friday
                </p>
            </div>

            {/* Exam Status Card */}
            <div className="card-nord p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-bl from-nord15/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10">
                    {todayIsExam ? (
                        <>
                            {todayExam?.completed ? (
                                /* Exam completed for today */
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-nord14/15 mb-4">
                                        <Trophy size={36} className="text-nord14" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-nord6 mb-2">Exam Complete!</h2>
                                    <p className="text-nord4/60 mb-4">
                                        You scored <span className="text-nord14 font-bold">{todayExam.score}/2</span> today
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-nord14/10 border border-nord14/20">
                                        <Award size={16} className="text-nord14" />
                                        <span className="text-nord14 font-semibold text-sm">
                                            +{todayExam.score * 10} rating points
                                        </span>
                                    </div>
                                </div>
                            ) : examStarted ? (
                                /* Exam in progress */
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-nord15/15 flex items-center justify-center animate-pulse-glow">
                                            <Zap size={24} className="text-nord15" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-nord6">Exam in Progress</h2>
                                            <p className="text-nord4/50 text-sm">Solve the questions below and mark them</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-6">
                                        {examQuestions.map((q, idx) => {
                                            const isSolved = solvedInExam.includes(q.id);
                                            return (
                                                <div
                                                    key={q.id}
                                                    className={`p-5 rounded-2xl border transition-all duration-300 ${isSolved
                                                        ? 'bg-nord14/10 border-nord14/30'
                                                        : 'bg-nord2/30 border-nord3/20 hover:border-nord15/30'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-nord15/15 flex items-center justify-center text-nord15 font-bold text-sm">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className={`font-semibold mb-1 ${isSolved ? 'text-nord14' : 'text-nord5'}`}>
                                                                {q.problem}
                                                            </p>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="pill bg-nord3/30 text-nord4/60 border border-nord3/20 text-[10px]">
                                                                    {q.source}
                                                                </span>
                                                                <span className="pill bg-nord3/30 text-nord4/60 border border-nord3/20 text-[10px]">
                                                                    {q.topic}
                                                                </span>
                                                                {q.url && (
                                                                    <a
                                                                        href={q.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center gap-1 text-xs text-nord8 hover:text-nord7 transition-colors"
                                                                    >
                                                                        Solve <ExternalLink size={12} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => toggleExamQuestion(q.id)}
                                                            className="flex-shrink-0 transition-all duration-300"
                                                        >
                                                            {isSolved ? (
                                                                <CheckCircle2 size={24} className="text-nord14" />
                                                            ) : (
                                                                <Circle size={24} className="text-nord3 hover:text-nord15" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button onClick={submitExam} className="btn-frost flex items-center gap-2">
                                            <CheckCircle2 size={16} />
                                            Submit Exam ({solvedInExam.length}/2)
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Exam not started */
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-nord15/15 mb-4 animate-pulse-glow">
                                        <Zap size={36} className="text-nord15" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-nord6 mb-2">Today is Exam Day!</h2>
                                    <p className="text-nord4/60 mb-6 max-w-md mx-auto">
                                        2 random unsolved questions will be selected. Solve them to boost your rating.
                                    </p>
                                    <button onClick={startExam} className="btn-frost inline-flex items-center gap-2 text-lg px-8 py-3">
                                        <PlayCircle size={20} />
                                        Start Exam
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        /* Not an exam day */
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-nord3/20 mb-4">
                                <Clock size={36} className="text-nord4/40" />
                            </div>
                            <h2 className="text-2xl font-bold text-nord5 mb-2">No Exam Today</h2>
                            <p className="text-nord4/50 max-w-md mx-auto">
                                Exams are on <span className="text-nord15 font-semibold">Monday</span>,{' '}
                                <span className="text-nord15 font-semibold">Wednesday</span>, and{' '}
                                <span className="text-nord15 font-semibold">Friday</span>. Keep solving daily tasks!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Exam History */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <History size={20} className="text-nord15" />
                    <h2 className="text-xl font-bold text-nord5">Exam History</h2>
                </div>

                {completedExams.length === 0 ? (
                    <div className="card-nord p-8 text-center">
                        <p className="text-nord4/40 italic">No exams taken yet. Start your first exam!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {completedExams.slice().reverse().map((exam) => (
                            <div key={exam.id} className="card-nord p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-nord4/60 text-sm">{exam.date}</p>
                                    <div className={`pill ${exam.score === 2 ? 'bg-nord14/15 text-nord14 border border-nord14/20' :
                                        exam.score === 1 ? 'bg-nord13/15 text-nord13 border border-nord13/20' :
                                            'bg-nord11/15 text-nord11 border border-nord11/20'
                                        }`}>
                                        {exam.score}/2
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {exam.score === 2 && <Trophy size={14} className="text-nord14" />}
                                    <span className="text-xs text-nord4/40">
                                        +{exam.score * 10} points
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Overall exam stats */}
                {completedExams.length > 0 && (
                    <div className="card-nord p-4 mt-4 flex items-center justify-around">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-nord6">{completedExams.length}</p>
                            <p className="text-xs text-nord4/40">Total Exams</p>
                        </div>
                        <div className="w-px h-10 bg-nord3/20" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-nord14">{totalScore}</p>
                            <p className="text-xs text-nord4/40">Total Score</p>
                        </div>
                        <div className="w-px h-10 bg-nord3/20" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-nord8">
                                {(totalScore / completedExams.length).toFixed(1)}
                            </p>
                            <p className="text-xs text-nord4/40">Avg Score</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
