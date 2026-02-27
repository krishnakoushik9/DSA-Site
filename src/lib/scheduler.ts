// ============================================================
// Scheduler Logic — Daily topics & Exam day calculation
// ============================================================
import {
    format,
    addDays,
    differenceInDays,
    isSameDay,
    getDay,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isToday,
    isPast,
    isFuture,
} from 'date-fns';
import { Question } from './types';
import questionsData from '@/data/questions.json';

// ============================================================
// START DATE — Study plan begins Feb 25, 2026
// ============================================================
export const STUDY_START_DATE = new Date('2026-02-25');

// ============================================================
// TOPIC ORDER — Basics → Intermediate → Advanced
// Each entry: [topic, daysToSpend]
// Easier/foundational topics come first, harder ones later
// with more days allocated to complex topics.
// ============================================================
const TOPIC_SCHEDULE: [string, number][] = [
    // === Phase 1: Foundations (Weeks 1–3) ===
    ['Array', 4],
    ['String', 4],
    ['Searching & Sorting', 4],
    ['Hashing', 3],
    ['Matrix', 3],

    // === Phase 2: Techniques (Weeks 4–5) ===
    ['Two Pointer', 2],
    ['Sliding Window', 2],
    ['Recursion', 4],

    // === Phase 3: Core Data Structures (Weeks 6–9) ===
    ['Linked List', 4],
    ['Stack & Queue', 4],
    ['Heap', 3],
    ['Tree', 5],
    ['Trie', 2],

    // === Phase 4: Advanced (Weeks 10–14) ===
    ['Graph', 5],
    ['Greedy', 4],
    ['Dynamic Programming', 6],
    ['Backtracking', 3],
    ['Bit Manipulation', 2],
    ['Design', 2],
];

// ============================================================
// DAILY DIFFICULTY ROTATION
// Cycles: Easy day → Medium day → Hard/Mixed day
// Each difficulty level gets a different question count.
// ============================================================
const DAILY_PATTERN: { label: string; count: number }[] = [
    { label: 'Easy', count: 3 },
    { label: 'Medium', count: 4 },
    { label: 'Hard', count: 2 },
];

// Build a flat lookup: dayOffset → { topic, difficultyLabel, questionCount }
interface ScheduleDay {
    topic: string;
    difficulty: string;
    count: number;
    topicDayIndex: number; // which day within this topic (0-based)
    topicTotalDays: number;
}

function buildScheduleLookup(): ScheduleDay[] {
    const schedule: ScheduleDay[] = [];
    for (const [topic, days] of TOPIC_SCHEDULE) {
        for (let d = 0; d < days; d++) {
            const pattern = DAILY_PATTERN[d % DAILY_PATTERN.length];
            schedule.push({
                topic,
                difficulty: pattern.label,
                count: pattern.count,
                topicDayIndex: d,
                topicTotalDays: days,
            });
        }
    }
    return schedule;
}

const SCHEDULE_LOOKUP = buildScheduleLookup();
const TOTAL_CYCLE_DAYS = SCHEDULE_LOOKUP.length; // full cycle length

// ============================================================
// PUBLIC API
// ============================================================

// Check if a date is within the study plan
export function isStudyActive(date: Date): boolean {
    return differenceInDays(date, STUDY_START_DATE) >= 0;
}

// Get all questions typed
export function getAllQuestions(): Question[] {
    return questionsData as Question[];
}

// Get questions by topic
export function getQuestionsByTopic(topic: string): Question[] {
    return getAllQuestions().filter(q => q.topic === topic);
}

// Get the schedule entry for a specific date
export function getScheduleForDate(date: Date): ScheduleDay | null {
    if (!isStudyActive(date)) return null;
    const dayOffset = differenceInDays(date, STUDY_START_DATE);
    const idx = dayOffset % TOTAL_CYCLE_DAYS;
    return SCHEDULE_LOOKUP[idx];
}

// Determine which topic is active on a given date
export function getTopicForDate(date: Date): string {
    const sched = getScheduleForDate(date);
    return sched ? sched.topic : 'Array';
}

// Get the daily questions for a specific date
export function getDailyQuestions(date: Date, _completedIds: string[]): Question[] {
    const sched = getScheduleForDate(date);
    if (!sched) return []; // before start date

    const topicQuestions = getQuestionsByTopic(sched.topic);
    if (topicQuestions.length === 0) return [];

    // Calculate cumulative offset within this topic across all its days
    // so each day within the same topic picks a *different* slice.
    let questionsConsumed = 0;
    for (let d = 0; d < sched.topicDayIndex; d++) {
        const pat = DAILY_PATTERN[d % DAILY_PATTERN.length];
        questionsConsumed += pat.count;
    }

    const startIdx = questionsConsumed % topicQuestions.length;
    const needed = sched.count;
    const result: Question[] = [];

    for (let i = 0; i < needed; i++) {
        const idx = (startIdx + i) % topicQuestions.length;
        result.push(topicQuestions[idx]);
    }

    return result;
}

// Get the difficulty label for a date
export function getDifficultyForDate(date: Date): string {
    const sched = getScheduleForDate(date);
    return sched ? sched.difficulty : '';
}

// Check if a date is an exam day (Mon, Wed, Fri = 3x per week)
export function isExamDay(date: Date): boolean {
    if (!isStudyActive(date)) return false;
    const day = getDay(date); // 0=Sun, 1=Mon, ..., 6=Sat
    return day === 1 || day === 3 || day === 5; // Mon, Wed, Fri
}

// Get 2 random unsolved questions for exam
export function getExamQuestions(completedIds: string[], extraQuestions: Question[] = []): Question[] {
    const allQuestions = [...getAllQuestions(), ...extraQuestions];
    const unsolved = allQuestions.filter(q => !completedIds.includes(q.id));

    if (unsolved.length <= 2) return unsolved;

    // Fisher-Yates shuffle and pick 2
    const shuffled = [...unsolved];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, 2);
}

// Get calendar data for a month
export function getMonthDays(year: number, month: number) {
    const start = startOfMonth(new Date(year, month));
    const end = endOfMonth(new Date(year, month));

    // Pad to start on Monday
    const startDay = getDay(start);
    const paddingDays = startDay === 0 ? 6 : startDay - 1;
    const paddedStart = addDays(start, -paddingDays);

    const allDays = eachDayOfInterval({
        start: paddedStart,
        end: addDays(end, (7 - getDay(end)) % 7 || 0),
    });

    // Ensure we have full weeks (42 days = 6 rows)
    while (allDays.length < 42) {
        allDays.push(addDays(allDays[allDays.length - 1], 1));
    }

    return allDays.slice(0, 42);
}

// Calculate rating based on progress
export function calculateRating(
    completedCount: number,
    totalQuestions: number,
    examScore: number,
    streak: number
): number {
    const completionScore = (completedCount / Math.max(totalQuestions, 1)) * 500;
    const examBonus = examScore * 10;
    const streakBonus = Math.min(streak * 5, 200);
    return Math.round(completionScore + examBonus + streakBonus);
}

// Get topic progress as percentage
export function getTopicProgress(topic: string, completedIds: string[]): number {
    const topicQuestions = getQuestionsByTopic(topic);
    if (topicQuestions.length === 0) return 0;
    const completed = topicQuestions.filter(q => completedIds.includes(q.id)).length;
    return (completed / topicQuestions.length) * 100;
}

// Format date consistently
export function formatDate(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}

export function formatDateDisplay(date: Date): string {
    return format(date, 'MMMM d, yyyy');
}

// Ordered list of topics for the UI (same order as schedule)
export const DSA_TOPICS_ORDERED = TOPIC_SCHEDULE.map(([t]) => t);

export { isToday, isPast, isFuture, isSameDay, format, addDays, getDay };
