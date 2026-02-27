'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Clock,
  Zap,
  BarChart3,
  Calendar,
} from 'lucide-react';
import ProgressRing from '@/components/ProgressRing';
import { useAppStore } from '@/store/useAppStore';
import { getAllQuestions, getTopicProgress, getTopicForDate, isExamDay, formatDateDisplay, DSA_TOPICS_ORDERED, getDailyQuestions } from '@/lib/scheduler';
import { TOPIC_COLORS } from '@/lib/types';

// Color mapping for progress rings
const RING_COLORS = [
  '#88C0D0', '#8FBCBB', '#81A1C1', '#5E81AC',
  '#A3BE8C', '#EBCB8B', '#D08770', '#BF616A',
  '#B48EAD', '#88C0D0', '#8FBCBB', '#81A1C1',
  '#5E81AC', '#A3BE8C', '#EBCB8B', '#D08770',
  '#BF616A', '#B48EAD', '#88C0D0',
];

export default function DashboardPage() {
  const { completedQuestions, rating, streak, examSessions, updateStreak, customQuestions } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    updateStreak();
  }, [updateStreak]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-nord8 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const allQuestions = [...getAllQuestions(), ...(customQuestions || [])];
  const totalQuestions = allQuestions.length;
  const completedCount = completedQuestions.length;
  const overallProgress = totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;
  const overallProgressFormatted = overallProgress < 1 && overallProgress > 0
    ? overallProgress.toFixed(1)
    : Math.round(overallProgress);
  const todayTopic = getTopicForDate(new Date());
  const todayIsExam = isExamDay(new Date());
  const examsTaken = examSessions.filter(e => e.completed).length;
  const totalExamScore = examSessions.filter(e => e.completed).reduce((sum, e) => sum + e.score, 0);

  const dailyQuestions = getDailyQuestions(new Date(), []);
  const isDailyComplete = dailyQuestions.length > 0 && dailyQuestions.every(q => completedQuestions.includes(q.id));

  return (
    <div className="space-y-4 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-nord6 tracking-tight">Dashboard</h1>
          <p className="text-nord4/60 text-xs">{formatDateDisplay(new Date())}</p>
        </div>
        {todayIsExam && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nord15/15 border border-nord15/30 animate-pulse-glow">
            <Zap size={14} className="text-nord15" />
            <span className="text-nord15 font-semibold text-xs">Exam Day!</span>
          </div>
        )}
      </div>

      {/* Stats Grid — Bento Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Rating Card */}
        <div className="card-nord p-4 lg:col-span-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-nord8/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-nord4/60 text-xs font-medium mb-0.5">DSA Rating</p>
              <p className="text-4xl font-extrabold text-nord8 tracking-tight">
                {rating}
              </p>
              <p className="text-nord4/40 text-[10px] mt-1">Keep solving to level up!</p>
            </div>
            <div className="bg-gradient-to-br from-nord8/20 to-nord10/20 rounded-xl p-3">
              <Trophy size={28} className="text-nord8" />
            </div>
          </div>
        </div>

        {/* Streak Card */}
        <div className="card-nord p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-nord12/15 flex items-center justify-center">
              <Flame size={16} className="text-nord12" />
            </div>
            <p className="text-nord4/60 text-xs font-medium">Streak</p>
          </div>
          <p className="text-2xl font-bold text-nord6">{streak} <span className="text-sm text-nord4/50">days</span></p>
        </div>

        {/* Solved Card */}
        <div className="card-nord p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-nord14/15 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-nord14" />
            </div>
            <p className="text-nord4/60 text-xs font-medium">Solved</p>
          </div>
          <p className="text-2xl font-bold text-nord6">{completedCount} <span className="text-sm text-nord4/50">/ {totalQuestions}</span></p>
        </div>
      </div>

      {/* Row 2: Today's Topic + Overall Progress + Exam Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Today's Topic */}
        <div className="card-nord p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-nord9/15 flex items-center justify-center">
              <BookOpen size={16} className="text-nord9" />
            </div>
            <div>
              <p className="text-nord4/60 text-[10px] font-medium">Today&apos;s Focus</p>
              <p className="text-nord6 font-bold text-sm">{todayTopic}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-nord2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-nord8 to-nord9 transition-all duration-700"
                style={{ width: `${allQuestions.filter(q => q.topic === todayTopic).length > 0 ? (allQuestions.filter(q => q.topic === todayTopic && completedQuestions.includes(q.id)).length / allQuestions.filter(q => q.topic === todayTopic).length * 100) : 0}%` }}
              />
            </div>
            <span className="text-nord4/60 text-[10px] font-medium">
              {allQuestions.filter(q => q.topic === todayTopic).length > 0 ? Math.round(allQuestions.filter(q => q.topic === todayTopic && completedQuestions.includes(q.id)).length / allQuestions.filter(q => q.topic === todayTopic).length * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="card-nord p-4 flex items-center justify-center">
          <ProgressRing
            percentage={overallProgress}
            size={100}
            strokeWidth={7}
            color="#88C0D0"
            label={`${overallProgressFormatted}%`}
            sublabel={`${completedCount} of ${totalQuestions}`}
          />
        </div>

        {/* Exam Stats */}
        <div className="card-nord p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-nord15/15 flex items-center justify-center">
              <Target size={16} className="text-nord15" />
            </div>
            <div>
              <p className="text-nord4/60 text-[10px] font-medium">Exams</p>
              <p className="text-nord6 font-bold text-sm">{examsTaken} taken</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-nord4/60">Total Score</span>
              <span className="text-nord14 font-semibold">{totalExamScore} pts</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-nord4/60">Avg / Exam</span>
              <span className="text-nord8 font-semibold">
                {examsTaken > 0 ? (totalExamScore / examsTaken).toFixed(1) : '0'} pts
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Progress Grid */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <BarChart3 size={16} className="text-nord8" />
          <h2 className="text-sm font-bold text-nord5">Topic Progress</h2>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2">
          {DSA_TOPICS_ORDERED.map((topic, idx) => {
            const topicQuestions = allQuestions.filter(q => q.topic === topic);
            const solved = topicQuestions.filter(q => completedQuestions.includes(q.id)).length;
            const progress = topicQuestions.length > 0 ? (solved / topicQuestions.length) * 100 : 0;
            const topicColor = RING_COLORS[idx % RING_COLORS.length];

            return (
              <div key={topic} className="card-nord p-3 flex flex-col items-center">
                <ProgressRing
                  percentage={progress}
                  size={56}
                  strokeWidth={4}
                  color={topicColor}
                />
                <p className="text-[10px] font-semibold text-nord5 mt-1.5 text-center leading-tight">
                  {topic}
                </p>
                <p className="text-[9px] text-nord4/30 mt-0.5">{solved}/{topicQuestions.length}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logic Building Floating Pill */}
      {isDailyComplete && (
        <Link
          href="/logic-building"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-gradient-to-r from-nord8 to-nord9 text-nord0 px-5 py-3 rounded-full shadow-[0_0_20px_rgba(136,192,208,0.4)] hover:shadow-[0_0_25px_rgba(136,192,208,0.6)] hover:scale-105 transition-all duration-300 animate-bounce font-bold text-sm"
        >
          <Zap size={18} className="text-nord0" />
          Logic Building 101
        </Link>
      )}
    </div>
  );
}
