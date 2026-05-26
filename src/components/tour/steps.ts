// ============================================================
// Onboarding Tour — content
// Voice: terse, terminal-style, slightly mysterious. Lower-case bodies,
// bracketed all-caps titles. No emojis.
// Bump `version` whenever the steps change to re-trigger for prior users.
// ============================================================
import type { Tour } from './types';

export const onboardingTour: Tour = {
    id: 'onboarding',
    version: 1,
    allowSkip: true,
    steps: [
        {
            id: 'welcome',
            target: null,
            placement: 'center',
            title: '[ INITIALIZING ]',
            body: 'a guided sweep of the operating surface. five seconds per node. press esc to abort. ready when you are.',
        },
        {
            id: 'theme',
            target: '[data-tour="theme-toggle"]',
            placement: 'bottom',
            spotlightPadding: 6,
            spotlightRadius: 999,
            title: '[ VISUAL PROTOCOL ]',
            body: 'four palettes. nord, slate-lime, amoled, light. switch any time. preferences persist per device.',
        },
        {
            id: 'nav',
            target: '[data-tour="floating-dock"]',
            placement: 'top',
            spotlightPadding: 10,
            spotlightRadius: 22,
            title: '[ NAVIGATION DOCK ]',
            body: 'twelve modules. dashboard, calendar, search, exams, workspace, runner, learnings, and the rest. hover to reveal labels.',
        },
        {
            id: 'tracker',
            target: '[data-tour="dashboard-progress"]',
            placement: 'right',
            spotlightPadding: 12,
            spotlightRadius: 16,
            requiresAuth: true,
            title: '[ PROGRESS CORE ]',
            body: 'daily question list, streak counter, completion ring. data syncs across devices when signed in.',
        },
        {
            id: 'learnings',
            target: '[data-tour="dock-learnings-learn-ai"]',
            placement: 'top',
            spotlightPadding: 8,
            spotlightRadius: 14,
            title: '[ LEARNING VAULT ]',
            body: 'curated paths for ai, systems, and core cs. open the module for deep-dive notebooks and resources.',
        },
        {
            id: 'search',
            target: '[data-tour="dock-search"]',
            placement: 'top',
            spotlightPadding: 8,
            spotlightRadius: 14,
            title: '[ INDEX SCAN ]',
            body: 'full-text search across problems, topics, and notes. fuzzy matching enabled.',
        },
        {
            id: 'hidden',
            target: '[data-tour="notification-bell"]',
            placement: 'bottom',
            spotlightPadding: 6,
            spotlightRadius: 999,
            title: '[ SIGNALS ]',
            body: 'system notices, redistribution alerts, the occasional easter egg. check it daily.',
        },
        {
            id: 'complete',
            target: null,
            placement: 'center',
            title: '[ SWEEP COMPLETE ]',
            body: 'systems online. you are cleared for operation. press the help icon bottom-right to replay this sweep any time.',
        },
    ],
};
