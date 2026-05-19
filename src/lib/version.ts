// ============================================================
// App Version & Changelog — single source of truth
// Bump APP_VERSION here + add a CHANGELOG entry on every release.
// ============================================================

export const APP_VERSION = '1.3.0';
export const BUILD_DATE = '2026-05-20';

export interface ChangelogEntry {
    version: string;
    date: string;
    label: 'major' | 'minor' | 'patch' | 'hotfix';
    title: string;
    changes: { type: 'feat' | 'fix' | 'perf' | 'refactor'; text: string }[];
}

export const CHANGELOG: ChangelogEntry[] = [
    {
        version: '1.3.0',
        date: '2026-05-20',
        label: 'minor',
        title: 'Missed Problem Redistribution',
        changes: [
            { type: 'feat', text: 'One-click redistribution of all missed problems across future calendar days (4 per day).' },
            { type: 'feat', text: 'Blue +N catch-up badge on calendar grid cells with redistributed questions.' },
            { type: 'feat', text: '"⚡ Catch-up Problems" section in the day detail panel, fully toggle-able.' },
            { type: 'feat', text: 'Version tagging system with changelog viewer in Profile settings.' },
            { type: 'feat', text: 'Redistribution state synced to Firestore — persists across sessions and devices.' },
        ],
    },
    {
        version: '1.2.0',
        date: '2026-05-13',
        label: 'minor',
        title: 'Runner IDE & Three.js Avatar',
        changes: [
            { type: 'feat', text: 'Full-page code runner IDE with Judge0 API integration.' },
            { type: 'feat', text: 'Three.js dancing 3D avatar on Dashboard.' },
            { type: 'feat', text: 'Cloud saved codes history on Profile page.' },
            { type: 'perf', text: 'Replaced Spline with native Three.js for faster load times.' },
        ],
    },
    {
        version: '1.1.0',
        date: '2026-04-20',
        label: 'minor',
        title: 'Company Mode & Community',
        changes: [
            { type: 'feat', text: 'Company Mode: browse interview questions by company with Firestore global cache.' },
            { type: 'feat', text: 'Community feed: posts, comments, upvotes/downvotes.' },
            { type: 'feat', text: 'Notification bell with real-time push notifications.' },
            { type: 'feat', text: 'Perks & Krack Updates (memes) sections.' },
        ],
    },
    {
        version: '1.0.0',
        date: '2026-03-01',
        label: 'major',
        title: 'Initial Public Launch',
        changes: [
            { type: 'feat', text: 'Date-deterministic scheduler: 755 questions across 19 DSA topics.' },
            { type: 'feat', text: 'Calendar view with missed-day glow, exam days, and lag counter.' },
            { type: 'feat', text: 'Zustand store with Firestore REST sync (no SDK).' },
            { type: 'feat', text: 'Exam sessions (Mon/Wed/Fri) with scoring.' },
            { type: 'feat', text: 'Workspace with Excalidraw, topic notes, and question notes.' },
            { type: 'feat', text: 'Credit economy: earn credits per solve, unlock Premium.' },
            { type: 'feat', text: 'GitHub OAuth login + passcode-based auth.' },
            { type: 'feat', text: 'Retro / Nord theme toggle.' },
        ],
    },
];

// Badge colour map for the label pill
export const LABEL_STYLES: Record<ChangelogEntry['label'], { bg: string; text: string; border: string }> = {
    major:   { bg: 'bg-nord11/15',  text: 'text-nord11',  border: 'border-nord11/30' },
    minor:   { bg: 'bg-nord8/15',   text: 'text-nord8',   border: 'border-nord8/30'  },
    patch:   { bg: 'bg-nord14/15',  text: 'text-nord14',  border: 'border-nord14/30' },
    hotfix:  { bg: 'bg-nord13/15',  text: 'text-nord13',  border: 'border-nord13/30' },
};

export const CHANGE_TYPE_STYLES: Record<string, { dot: string; label: string }> = {
    feat:     { dot: 'bg-nord14', label: 'feat'     },
    fix:      { dot: 'bg-nord11', label: 'fix'      },
    perf:     { dot: 'bg-nord13', label: 'perf'     },
    refactor: { dot: 'bg-nord9',  label: 'refactor' },
};
