// ============================================================
// Zustand Store — localStorage cache + Firestore source of truth
// ============================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProgress, UserProfile, ExamSession } from '@/lib/types';
import { formatDate, getDailyQuestions, STUDY_START_DATE } from '@/lib/scheduler';
import { saveToFirestore, loadFromFirestore, getUserPasscodeHash, hashPasscode } from '@/lib/firebase';
import { signInWithGitHub, type GitHubUserInfo } from '@/lib/firebaseAuth';
import { addDays, differenceInDays } from 'date-fns';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

const defaultProfile: UserProfile = {
    displayName: '',
    bio: '',
    leetcode: '',
    gfg: '',
    linkedin: '',
    github: '',
    college: '',
    targetExam: 'SRCS',
    rollNumber: '',
    collegeEmail: '',
    yearOfStudy: '',
    profileVerified: false,
};

interface AppState extends UserProgress {
    // Auth
    username: string;
    passcodeHash: string;
    isLoggedIn: boolean;

    // UI
    isSidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    isPremiumPopupOpen: boolean;
    setPremiumPopupOpen: (open: boolean) => void;

    // Sync
    syncStatus: SyncStatus;
    lastSyncedAt: string;
    _cloudReady: boolean; // prevents sync until cloud data is loaded

    // Auth actions
    login: (username: string, passcode: string) => Promise<{ success: boolean; error?: string; isNew?: boolean }>;
    loginWithGithub: () => Promise<{ success: boolean; error?: string; isNew?: boolean }>;
    logout: () => void;
    deleteAccount: () => Promise<void>;

    // Data actions
    toggleQuestionComplete: (questionId: string) => void;
    markDailyTaskComplete: (dateKey: string) => void;
    saveQuestionNote: (questionId: string, content: string) => void;
    saveTopicNote: (topic: string, content: string) => void;
    addExamSession: (session: ExamSession) => void;
    completeExamSession: (examId: string, score: number) => void;
    updateStreak: () => void;
    saveExcalidrawData: (boardId: string, data: string) => void;
    addCustomQuestion: (question: { problem: string; url: string; topic: string; difficulty: string }) => void;
    updateProfile: (profile: Partial<UserProfile>) => void;
    resetProgress: () => void;
    saveLogicBuildingCode: (problemId: string, code: string) => void;
    toggleDeepLearningProgress: (notebookId: string) => void;
    // Credit economy
    spendCredits: (amount: number, plan: 'placement' | 'monthly') => boolean;
    // Redistribution
    redistributeMissedProblems: () => { redistributedCount: number; daysUsed: number };

    // Sync
    syncToFirestore: () => Promise<void>;
    loadFromCloud: () => Promise<void>;
}

const initialProgress: UserProgress = {
    completedQuestions: [],
    dailyTasks: {},
    examSessions: [],
    questionNotes: {},
    topicNotes: {},
    customQuestions: [],
    rating: 0,
    streak: 0,
    lastActiveDate: '',
    excalidrawData: {},
    profile: { ...defaultProfile },
    logicBuildingCodes: {},
    deepLearningProgress: {},
    credits: 0,
    isPremium: false,
    premiumPlan: null,
    premiumExpiresAt: null,
    redistribution: {},
    lastRedistributedAt: null,
};

let syncTimeout: NodeJS.Timeout | undefined;

function scheduleFirestoreSync(getState: () => AppState) {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
        const state = getState();
        // GUARD: never sync if cloud data hasn't been loaded yet
        if (!state._cloudReady || !state.isLoggedIn) return;
        state.syncToFirestore();
    }, 3000);
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            ...initialProgress,
            username: '',
            passcodeHash: '',
            isLoggedIn: false,
            isSidebarCollapsed: false,
            isPremiumPopupOpen: false,
            syncStatus: 'idle' as SyncStatus,
            lastSyncedAt: '',
            _cloudReady: false,
            deepLearningProgress: {}, // Initialize here as well

            // =============== AUTH ===============
            login: async (rawUsername: string, passcode: string) => {
                const username = rawUsername.toLowerCase().trim();
                const hash = hashPasscode(passcode);

                // Check if user exists in Firestore
                const existingHash = await getUserPasscodeHash(username);

                if (existingHash) {
                    // ── Existing user: verify passcode ──
                    if (existingHash !== hash) {
                        return { success: false, error: 'Wrong passcode. Try again.' };
                    }

                    // Passcode correct → load ALL data from cloud (cloud = truth)
                    set({ username, passcodeHash: hash, isLoggedIn: true, syncStatus: 'syncing', _cloudReady: false });

                    try {
                        const result = await loadFromFirestore(username);
                        if (result?.data) {
                            const cloudData = result.data as Record<string, unknown>;

                            set({
                                completedQuestions: (cloudData.completedQuestions as string[]) || [],
                                dailyTasks: (cloudData.dailyTasks as UserProgress['dailyTasks']) || {},
                                examSessions: (cloudData.examSessions as ExamSession[]) || [],
                                questionNotes: (cloudData.questionNotes as UserProgress['questionNotes']) || {},
                                topicNotes: (cloudData.topicNotes as UserProgress['topicNotes']) || {},
                                customQuestions: (cloudData.customQuestions as UserProgress['customQuestions']) || [],
                                rating: (cloudData.rating as number) || 0,
                                streak: (cloudData.streak as number) || 0,
                                lastActiveDate: (cloudData.lastActiveDate as string) || '',
                                profile: {
                                    ...defaultProfile,
                                    ...(cloudData.profile as Partial<UserProfile>),
                                },
                                excalidrawData: get().excalidrawData || {},
                                syncStatus: 'synced',
                                lastSyncedAt: new Date().toISOString(),
                                _cloudReady: true,
                                logicBuildingCodes: (cloudData.logicBuildingCodes as Record<string, string>) || {},
                                deepLearningProgress: (cloudData.deepLearningProgress as Record<string, boolean>) || {},
                                credits: (cloudData.credits as number) ?? 300,
                                isPremium: (cloudData.isPremium as boolean) || false,
                                premiumPlan: (cloudData.premiumPlan as UserProgress['premiumPlan']) || null,
                                premiumExpiresAt: (cloudData.premiumExpiresAt as string) || null,
                                redistribution: (cloudData.redistribution as Record<string, string[]>) || {},
                                lastRedistributedAt: (cloudData.lastRedistributedAt as string) || null,
                            });
                        } else {
                            set({ ...initialProgress, username, passcodeHash: hash, isLoggedIn: true, _cloudReady: true, syncStatus: 'idle' });
                        }
                    } catch {
                        set({ syncStatus: 'error', _cloudReady: true });
                    }

                    return { success: true, isNew: false };
                } else {
                    // ── NEW USER SAFETY CHECK ──
                    // Ensure the document doesn't actually exist despite getUserPasscodeHash saying null
                    const safetyCheck = await loadFromFirestore(username);
                    let isRepair = false;

                    if (safetyCheck?.data) {
                        // RECOVERY LOGIC: If account exists but has no passcode, let them "claim" it.
                        // This happens if a sync previously wiped the passcodeHash field due to a bug.
                        console.warn("Auth desync detected for user:", username, ". Repairing...");
                        const cloudData = safetyCheck.data as Record<string, any>;

                        set({
                            ...initialProgress,
                            completedQuestions: cloudData.completedQuestions || [],
                            dailyTasks: cloudData.dailyTasks || {},
                            examSessions: cloudData.examSessions || [],
                            questionNotes: cloudData.questionNotes || {},
                            topicNotes: cloudData.topicNotes || {},
                            customQuestions: cloudData.customQuestions || [],
                            rating: cloudData.rating || 0,
                            streak: cloudData.streak || 0,
                            lastActiveDate: cloudData.lastActiveDate || '',
                            profile: { ...defaultProfile, ...cloudData.profile },
                            username,
                            passcodeHash: hash,
                            isLoggedIn: true,
                            _cloudReady: true,
                            syncStatus: 'synced',
                            logicBuildingCodes: cloudData.logicBuildingCodes || {},
                            deepLearningProgress: cloudData.deepLearningProgress || {},
                        });
                        isRepair = true;
                    } else {
                        set({
                            ...initialProgress,
                            username,
                            passcodeHash: hash,
                            isLoggedIn: true,
                            _cloudReady: true,
                            credits: 300, // 🎁 Welcome bonus for new users
                        });
                    }

                    // Push initial data + passcode to Firestore (this repairs the missing hash)
                    const dataToSync = buildSyncData(get());
                    await saveToFirestore(username, dataToSync, hash);
                    set({ syncStatus: 'synced', lastSyncedAt: new Date().toISOString() });

                    return { success: true, isNew: !isRepair };
                }
            },

            // =============== GITHUB AUTH ===============
            loginWithGithub: async () => {
                try {
                    const ghUser: GitHubUserInfo | null = await signInWithGitHub();
                    if (!ghUser) return { success: false, error: 'GitHub sign-in was cancelled.' };

                    // Use GitHub username (lowercase) as the Firestore document key
                    const username = (ghUser.githubUsername || ghUser.displayName || ghUser.uid)
                        .toLowerCase()
                        .replace(/[^a-z0-9_-]/g, '')
                        .slice(0, 20);

                    if (!username || username.length < 2) {
                        return { success: false, error: 'Could not determine a valid username from GitHub.' };
                    }

                    // A deterministic passcode hash derived from the GitHub UID
                    const ghHash = hashPasscode(`gh_${ghUser.uid}_auth`);

                    // Check if a document already exists for this username
                    const existingData = await loadFromFirestore(username);

                    if (existingData?.data) {
                        // ── EXISTING USER: load their data ──
                        const cloudData = existingData.data as Record<string, unknown>;

                        // If the existing doc has a passcodeHash that doesn't match our GH hash,
                        // it means this username belongs to a passcode-based account.
                        // We check if the doc has a githubUid field matching us → allow login.
                        // Otherwise, if no githubUid, check passcode match.
                        const existingGhUid = cloudData.githubUid as string | undefined;
                        const existingHash = existingData.passcodeHash;

                        if (existingGhUid && existingGhUid === ghUser.uid) {
                            // ✅ This account is linked to this GitHub
                        } else if (existingHash && existingHash !== ghHash && !existingGhUid) {
                            // ❌ Username taken by a passcode user — cannot hijack
                            return {
                                success: false,
                                error: `Username "${username}" is already taken by another account. The owner can link GitHub from their settings.`,
                            };
                        }

                        // Load data
                        set({
                            username,
                            passcodeHash: existingHash || ghHash,
                            isLoggedIn: true,
                            syncStatus: 'syncing',
                            _cloudReady: false,
                        });

                        set({
                            completedQuestions: (cloudData.completedQuestions as string[]) || [],
                            dailyTasks: (cloudData.dailyTasks as UserProgress['dailyTasks']) || {},
                            examSessions: (cloudData.examSessions as ExamSession[]) || [],
                            questionNotes: (cloudData.questionNotes as UserProgress['questionNotes']) || {},
                            topicNotes: (cloudData.topicNotes as UserProgress['topicNotes']) || {},
                            customQuestions: (cloudData.customQuestions as UserProgress['customQuestions']) || [],
                            rating: (cloudData.rating as number) || 0,
                            streak: (cloudData.streak as number) || 0,
                            lastActiveDate: (cloudData.lastActiveDate as string) || '',
                            profile: {
                                ...defaultProfile,
                                ...(cloudData.profile as Partial<UserProfile>),
                                // Update profile with GitHub info if not already set
                                displayName: (cloudData.profile as Partial<UserProfile>)?.displayName || ghUser.displayName,
                                github: (cloudData.profile as Partial<UserProfile>)?.github || `https://github.com/${ghUser.githubUsername}`,
                            },
                            excalidrawData: get().excalidrawData || {},
                            syncStatus: 'synced',
                            lastSyncedAt: new Date().toISOString(),
                            _cloudReady: true,
                            logicBuildingCodes: (cloudData.logicBuildingCodes as Record<string, string>) || {},
                            deepLearningProgress: (cloudData.deepLearningProgress as Record<string, boolean>) || {},
                            credits: (cloudData.credits as number) ?? 300,
                            isPremium: (cloudData.isPremium as boolean) || false,
                            premiumPlan: (cloudData.premiumPlan as UserProgress['premiumPlan']) || null,
                            premiumExpiresAt: (cloudData.premiumExpiresAt as string) || null,
                            redistribution: (cloudData.redistribution as Record<string, string[]>) || {},
                            lastRedistributedAt: (cloudData.lastRedistributedAt as string) || null,
                        });

                        // Ensure githubUid is saved to the document
                        const dataToSync = {
                            ...buildSyncData(get()),
                            githubUid: ghUser.uid,
                            githubUsername: ghUser.githubUsername,
                            githubPhotoURL: ghUser.photoURL,
                            githubEmail: ghUser.email,
                        };
                        await saveToFirestore(username, dataToSync, existingHash || ghHash);

                        return { success: true, isNew: false };
                    } else {
                        // ── NEW USER from GitHub ──
                        const newProfile: UserProfile = {
                            ...defaultProfile,
                            displayName: ghUser.displayName,
                            github: `https://github.com/${ghUser.githubUsername}`,
                        };

                        set({
                            ...initialProgress,
                            username,
                            passcodeHash: ghHash,
                            isLoggedIn: true,
                            _cloudReady: true,
                            profile: newProfile,
                            credits: 300, // 🎁 Welcome bonus
                        });

                        const dataToSync = {
                            ...buildSyncData(get()),
                            githubUid: ghUser.uid,
                            githubUsername: ghUser.githubUsername,
                            githubPhotoURL: ghUser.photoURL,
                            githubEmail: ghUser.email,
                        };
                        await saveToFirestore(username, dataToSync, ghHash);
                        set({ syncStatus: 'synced', lastSyncedAt: new Date().toISOString() });

                        return { success: true, isNew: true };
                    }
                } catch (error) {
                    console.error('GitHub login error:', error);
                    return { success: false, error: 'GitHub sign-in failed. Please try again.' };
                }
            },

            logout: () => {
                set({
                    ...initialProgress,
                    username: '',
                    passcodeHash: '',
                    isLoggedIn: false,
                    isSidebarCollapsed: false,
                    syncStatus: 'idle',
                    _cloudReady: false,
                });
            },

            deleteAccount: async () => {
                const state = get();
                if (!state.isLoggedIn || !state.username) return;

                // Sync current data but with an invalid passcode hash, permanently locking the account
                const dataToSync = buildSyncData(state);
                const invalidHash = 'LOCKED_DELETED_ACCOUNT_' + Date.now();

                await saveToFirestore(state.username, dataToSync, invalidHash);

                // Perform local logout
                state.logout();
            },

            // =============== UI ACTIONS ===============
            setSidebarCollapsed: (collapsed: boolean) => {
                set({ isSidebarCollapsed: collapsed });
            },
            setPremiumPopupOpen: (open: boolean) => {
                set({ isPremiumPopupOpen: open });
            },

            // =============== SYNC ===============
            syncToFirestore: async () => {
                const state = get();
                // GUARD 1: Only sync if logged in and cloud is ready
                if (!state.isLoggedIn || !state.username || !state._cloudReady) return;

                // GUARD 2: Progress Lockdown
                // If local state has less progress than cloud, it means a corruption or fresh origin reset.
                // WE MUST NOT SYNC AND OVERWRITE.
                try {
                    const cloudMeta = await loadFromFirestore(state.username);
                    if (cloudMeta?.data) {
                        const cloudCount = (cloudMeta.data.completedQuestions as string[])?.length || 0;
                        const localCount = state.completedQuestions.length;

                        // If cloud is richer than local, abort sync and fix local
                        if (cloudCount > localCount) {
                            console.error("Critical: Cloud has more data than local. Aborting sync to prevent loss.");
                            state.loadFromCloud(); // Force recovery
                            return;
                        }

                        // If local is total zero but cloud has rating, also abort
                        if (localCount === 0 && (cloudMeta.data.rating as number) > 0) {
                            console.error("Critical: Local state is empty but cloud has rating. Aborting sync.");
                            state.loadFromCloud();
                            return;
                        }
                    }
                } catch (e) {
                    console.error("Pre-sync check failed, skipping sync for safety.", e);
                    return;
                }

                set({ syncStatus: 'syncing' });

                const dataToSync = buildSyncData(state);
                const success = await saveToFirestore(state.username, dataToSync, state.passcodeHash);

                if (success) {
                    set({ syncStatus: 'synced', lastSyncedAt: new Date().toISOString() });
                    setTimeout(() => {
                        if (get().syncStatus === 'synced') set({ syncStatus: 'idle' });
                    }, 2000);
                } else {
                    set({ syncStatus: 'error' });
                    setTimeout(() => {
                        if (get().syncStatus === 'error') set({ syncStatus: 'idle' });
                    }, 3000);
                }
            },

            loadFromCloud: async () => {
                const state = get();
                if (!state.username) return;

                set({ syncStatus: 'syncing', _cloudReady: false });
                const result = await loadFromFirestore(state.username);
                if (result?.data) {
                    const cloudData = result.data as Record<string, unknown>;
                    const localExcalidraw = get().excalidrawData || {};
                    set({
                        completedQuestions: (cloudData.completedQuestions as string[]) || [],
                        dailyTasks: (cloudData.dailyTasks as UserProgress['dailyTasks']) || {},
                        examSessions: (cloudData.examSessions as ExamSession[]) || [],
                        questionNotes: (cloudData.questionNotes as UserProgress['questionNotes']) || {},
                        topicNotes: (cloudData.topicNotes as UserProgress['topicNotes']) || {},
                        customQuestions: (cloudData.customQuestions as UserProgress['customQuestions']) || [],
                        rating: (cloudData.rating as number) || 0,
                        streak: (cloudData.streak as number) || 0,
                        lastActiveDate: (cloudData.lastActiveDate as string) || '',
                        profile: { ...defaultProfile, ...(cloudData.profile as Partial<UserProfile>) },
                        excalidrawData: localExcalidraw,
                        syncStatus: 'synced',
                        lastSyncedAt: new Date().toISOString(),
                        _cloudReady: true,
                        logicBuildingCodes: (cloudData.logicBuildingCodes as Record<string, string>) || {},
                        deepLearningProgress: (cloudData.deepLearningProgress as Record<string, boolean>) || {},
                        credits: (cloudData.credits as number) ?? 300,
                        isPremium: (cloudData.isPremium as boolean) || false,
                        premiumPlan: (cloudData.premiumPlan as UserProgress['premiumPlan']) || null,
                        premiumExpiresAt: (cloudData.premiumExpiresAt as string) || null,
                        redistribution: (cloudData.redistribution as Record<string, string[]>) || {},
                        lastRedistributedAt: (cloudData.lastRedistributedAt as string) || null,
                    });
                } else {
                    set({ syncStatus: 'idle', _cloudReady: true });
                }
            },

            // =============== DATA ACTIONS ===============
            toggleQuestionComplete: (questionId: string) => {
                set((state) => {
                    const isCompleted = state.completedQuestions.includes(questionId);
                    const newCompleted = isCompleted
                        ? state.completedQuestions.filter(id => id !== questionId)
                        : [...state.completedQuestions, questionId];

                    const baseRating = newCompleted.length * 2;
                    const examBonus = state.examSessions
                        .filter(e => e.completed)
                        .reduce((sum, e) => sum + e.score * 10, 0);
                    const streakBonus = Math.min(state.streak * 5, 200);

                    // Credit economy: +5 per solve, -5 per un-solve (never below 0)
                    const creditDelta = isCompleted ? -5 : 5;
                    const newCredits = Math.max(0, (state.credits ?? 0) + creditDelta);

                    return {
                        completedQuestions: newCompleted,
                        rating: baseRating + examBonus + streakBonus,
                        credits: newCredits,
                    };
                });
                scheduleFirestoreSync(get);
            },

            markDailyTaskComplete: (dateKey: string) => {
                set((state) => ({
                    dailyTasks: {
                        ...state.dailyTasks,
                        [dateKey]: { ...state.dailyTasks[dateKey], completed: true },
                    },
                }));
                scheduleFirestoreSync(get);
            },

            saveQuestionNote: (questionId: string, content: string) => {
                set((state) => ({
                    questionNotes: {
                        ...state.questionNotes,
                        [questionId]: { questionId, content, updatedAt: new Date().toISOString() },
                    },
                }));
                scheduleFirestoreSync(get);
            },

            saveTopicNote: (topic: string, content: string) => {
                set((state) => ({
                    topicNotes: {
                        ...state.topicNotes,
                        [topic]: { topic, content, updatedAt: new Date().toISOString() },
                    },
                }));
                scheduleFirestoreSync(get);
            },

            addExamSession: (session: ExamSession) => {
                set((state) => ({ examSessions: [...state.examSessions, session] }));
                scheduleFirestoreSync(get);
            },

            completeExamSession: (examId: string, score: number) => {
                set((state) => {
                    const sessions = state.examSessions.map(s =>
                        s.id === examId ? { ...s, completed: true, score } : s
                    );
                    const examBonus = sessions.filter(e => e.completed).reduce((sum, e) => sum + e.score * 10, 0);
                    const baseRating = state.completedQuestions.length * 2;
                    const streakBonus = Math.min(state.streak * 5, 200);
                    return { examSessions: sessions, rating: baseRating + examBonus + streakBonus };
                });
                scheduleFirestoreSync(get);
            },

            updateStreak: () => {
                const state = get();
                // GUARD: don't update streak if cloud hasn't loaded yet
                if (!state._cloudReady) return;

                const today = formatDate(new Date());
                const yesterday = formatDate(new Date(Date.now() - 86400000));
                if (state.lastActiveDate === today) return;

                const newStreak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
                set({ streak: newStreak, lastActiveDate: today });
                scheduleFirestoreSync(get);
            },

            saveExcalidrawData: (boardId: string, data: string) => {
                set((state) => ({
                    excalidrawData: { ...state.excalidrawData, [boardId]: data },
                }));
                // Excalidraw stays local-only
            },

            addCustomQuestion: (q) => {
                set((state) => {
                    const newQuestion = {
                        ...q,
                        id: `custom-${Date.now()}`,
                        source: 'Custom',
                    };
                    return {
                        customQuestions: [...(state.customQuestions || []), newQuestion],
                    };
                });
                scheduleFirestoreSync(get);
            },

            updateProfile: (profileUpdate: Partial<UserProfile>) => {
                set((state) => ({
                    profile: { ...state.profile, ...profileUpdate },
                }));
                scheduleFirestoreSync(get);
            },

            resetProgress: () => {
                set({ ...initialProgress, _cloudReady: true });
                scheduleFirestoreSync(get);
            },

            saveLogicBuildingCode: (problemId: string, code: string) => {
                set((state) => ({
                    logicBuildingCodes: {
                        ...(state.logicBuildingCodes || {}),
                        [problemId]: code,
                    },
                }));
                scheduleFirestoreSync(get);
            },

            toggleDeepLearningProgress: (notebookId: string) => {
                set((state) => {
                    const newProgress = { ...state.deepLearningProgress };
                    if (newProgress[notebookId]) {
                        delete newProgress[notebookId];
                    } else {
                        newProgress[notebookId] = true;
                    }
                    return { deepLearningProgress: newProgress };
                });
                scheduleFirestoreSync(get);
            },

            // Spend credits to unlock premium
            spendCredits: (amount: number, plan: 'placement' | 'monthly'): boolean => {
                const state = get();
                if ((state.credits ?? 0) < amount) return false;
                const expiresAt = plan === 'monthly'
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    : null; // placement = 6 months but treated as non-expiring for simplicity
                set((s) => ({
                    credits: (s.credits ?? 0) - amount,
                    isPremium: true,
                    premiumPlan: plan,
                    premiumExpiresAt: expiresAt,
                }));
                scheduleFirestoreSync(get);
                return true;
            },

            // =============== REDISTRIBUTE MISSED PROBLEMS ===============
            redistributeMissedProblems: () => {
                const state = get();
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // ── Step 1: Collect every unsolved question from all past days ──
                // Walk from study start to yesterday, gather question IDs not in completedQuestions.
                // Use a Set to avoid duplicates (same Q can appear on multiple days via modulo rotation).
                const missedIds = new Set<string>();
                const start = new Date(STUDY_START_DATE);
                start.setHours(0, 0, 0, 0);
                const totalPastDays = differenceInDays(today, start); // excludes today

                for (let d = 0; d < totalPastDays; d++) {
                    const cursor = addDays(start, d);
                    const qs = getDailyQuestions(cursor, []);
                    for (const q of qs) {
                        if (!state.completedQuestions.includes(q.id)) {
                            missedIds.add(q.id);
                        }
                    }
                }

                // Also carry over any previously redistributed questions that are still unsolved
                const prevRedist = state.redistribution || {};
                for (const ids of Object.values(prevRedist)) {
                    for (const id of ids) {
                        if (!state.completedQuestions.includes(id)) {
                            missedIds.add(id);
                        }
                    }
                }

                const missedArr = Array.from(missedIds);
                if (missedArr.length === 0) {
                    return { redistributedCount: 0, daysUsed: 0 };
                }

                // ── Step 2: Spread them across future days starting tomorrow ──
                // Each catch-up day gets CHUNK_SIZE questions (matches daily Medium count).
                const CHUNK_SIZE = 4;
                const newRedistribution: Record<string, string[]> = {};
                let dayOffset = 1; // start from tomorrow

                for (let i = 0; i < missedArr.length; i += CHUNK_SIZE) {
                    const chunk = missedArr.slice(i, i + CHUNK_SIZE);
                    const targetDate = addDays(today, dayOffset);
                    const dateKey = formatDate(targetDate);
                    newRedistribution[dateKey] = chunk;
                    dayOffset++;
                }

                const daysUsed = Object.keys(newRedistribution).length;
                const now = new Date().toISOString();

                set({
                    redistribution: newRedistribution,
                    lastRedistributedAt: now,
                });
                scheduleFirestoreSync(get);

                return { redistributedCount: missedArr.length, daysUsed };
            },
        }),

        {
            name: 'dsa-tracker-storage',
            storage: createJSONStorage(() => localStorage),
            // Don't persist internal flags
            partialize: (state) => {
                const { _cloudReady, syncStatus, isPremiumPopupOpen, ...rest } = state;
                return rest;
            },
        }
    )
);

// Helper: build the data object to sync to Firestore
function buildSyncData(state: AppState): Record<string, unknown> {
    return {
        completedQuestions: state.completedQuestions,
        dailyTasks: state.dailyTasks,
        examSessions: state.examSessions,
        questionNotes: state.questionNotes,
        topicNotes: state.topicNotes,
        customQuestions: state.customQuestions || [],
        rating: state.rating,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
        profile: state.profile,
        logicBuildingCodes: state.logicBuildingCodes || {},
        deepLearningProgress: state.deepLearningProgress || {},
        credits: state.credits ?? 0,
        isPremium: state.isPremium ?? false,
        premiumPlan: state.premiumPlan ?? null,
        premiumExpiresAt: state.premiumExpiresAt ?? null,
        redistribution: state.redistribution || {},
        lastRedistributedAt: state.lastRedistributedAt ?? null,
        // excalidrawData stays local
    };
}
