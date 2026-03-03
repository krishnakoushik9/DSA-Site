// ============================================================
// Core Types for the DSA Tracker App
// ============================================================

export interface Question {
    id: string;
    source: string;
    topic: string;
    problem: string;
    url: string;
    difficulty: string;
}

export interface DailyTask {
    date: string; // ISO date string YYYY-MM-DD
    topic: string;
    questions: string[]; // Question IDs
    completed: boolean;
}

export interface ExamSession {
    id: string;
    date: string; // ISO date string
    questions: string[]; // Question IDs
    completed: boolean;
    score: number; // 0, 1, or 2
}

export interface QuestionNote {
    questionId: string;
    content: string; // Markdown content
    updatedAt: string;
}

export interface TopicNote {
    topic: string;
    content: string;
    updatedAt: string;
}

export interface UserProfile {
    displayName: string;
    bio: string;
    leetcode: string;
    gfg: string;
    linkedin: string;
    github: string;
    college: string;
    targetExam: string;
    rollNumber: string;
    collegeEmail: string;
    yearOfStudy: '1st' | '2nd' | '3rd' | '';
    profileVerified: boolean;
}

export interface UserProgress {
    completedQuestions: string[]; // Question IDs
    customQuestions?: Question[]; // User added questions
    dailyTasks: Record<string, DailyTask>; // dateKey -> DailyTask
    examSessions: ExamSession[];
    questionNotes: Record<string, QuestionNote>; // questionId -> QuestionNote
    topicNotes: Record<string, TopicNote>; // topic -> TopicNote
    logicBuildingCodes?: Record<string, string>; // problemId -> code
    deepLearningProgress?: Record<string, boolean>;
    rating: number;
    streak: number;
    lastActiveDate: string;
    excalidrawData: Record<string, string>; // boardId -> serialized data
    profile: UserProfile;
}

export const DSA_TOPICS = [
    'Array',
    'Matrix',
    'String',
    'Recursion',
    'Stack & Queue',
    'Linked List',
    'Heap',
    'Hashing',
    'Tree',
    'Graph',
    'Sliding Window',
    'Two Pointer',
    'Searching & Sorting',
    'Dynamic Programming',
    'Greedy',
    'Backtracking',
    'Bit Manipulation',
    'Trie',
    'Design',
] as const;

export type DSATopic = (typeof DSA_TOPICS)[number];

// Topic colors using Nord Aurora + Frost palette
export const TOPIC_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'Array': { bg: 'bg-nord8/15', text: 'text-nord8', border: 'border-nord8/30' },
    'Matrix': { bg: 'bg-nord9/15', text: 'text-nord9', border: 'border-nord9/30' },
    'String': { bg: 'bg-nord7/15', text: 'text-nord7', border: 'border-nord7/30' },
    'Recursion': { bg: 'bg-nord15/15', text: 'text-nord15', border: 'border-nord15/30' },
    'Stack & Queue': { bg: 'bg-nord12/15', text: 'text-nord12', border: 'border-nord12/30' },
    'Linked List': { bg: 'bg-nord14/15', text: 'text-nord14', border: 'border-nord14/30' },
    'Heap': { bg: 'bg-nord13/15', text: 'text-nord13', border: 'border-nord13/30' },
    'Hashing': { bg: 'bg-nord10/15', text: 'text-nord10', border: 'border-nord10/30' },
    'Tree': { bg: 'bg-nord14/15', text: 'text-nord14', border: 'border-nord14/30' },
    'Graph': { bg: 'bg-nord11/15', text: 'text-nord11', border: 'border-nord11/30' },
    'Sliding Window': { bg: 'bg-nord8/15', text: 'text-nord8', border: 'border-nord8/30' },
    'Two Pointer': { bg: 'bg-nord9/15', text: 'text-nord9', border: 'border-nord9/30' },
    'Searching & Sorting': { bg: 'bg-nord7/15', text: 'text-nord7', border: 'border-nord7/30' },
    'Dynamic Programming': { bg: 'bg-nord15/15', text: 'text-nord15', border: 'border-nord15/30' },
    'Greedy': { bg: 'bg-nord13/15', text: 'text-nord13', border: 'border-nord13/30' },
    'Backtracking': { bg: 'bg-nord12/15', text: 'text-nord12', border: 'border-nord12/30' },
    'Bit Manipulation': { bg: 'bg-nord11/15', text: 'text-nord11', border: 'border-nord11/30' },
    'Trie': { bg: 'bg-nord10/15', text: 'text-nord10', border: 'border-nord10/30' },
    'Design': { bg: 'bg-nord8/15', text: 'text-nord8', border: 'border-nord8/30' },
    'Segment Tree': { bg: 'bg-nord9/15', text: 'text-nord9', border: 'border-nord9/30' },
    'Miscellaneous': { bg: 'bg-nord3/30', text: 'text-nord4', border: 'border-nord3/30' },
};
