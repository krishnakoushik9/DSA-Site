'use client';

import { useState, useEffect } from 'react';
import {
    User,
    Save,
    ExternalLink,
    Trophy,
    Flame,
    CheckCircle2,
    GraduationCap,
    Code2,
    Linkedin,
    Github,
    Globe,
    BookOpen,
    Target,
    Edit3,
    Check,
    AlertTriangle,
    LogOut,
    Trash2,
    X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { getAllQuestions, getTopicProgress, DSA_TOPICS_ORDERED } from '@/lib/scheduler';
import ProgressRing from '@/components/ProgressRing';
import LeetCodeStats from '@/components/LeetCodeStats';

export default function AboutPage() {
    const {
        username,
        profile,
        updateProfile,
        completedQuestions,
        rating,
        streak,
        examSessions,
        syncToFirestore,
        syncStatus,
        logout,
        deleteAccount,
    } = useAppStore();

    const router = useRouter();
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState(profile);
    const [mounted, setMounted] = useState(false);
    const [saved, setSaved] = useState(false);

    // Auth settings states
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [logoutInput, setLogoutInput] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState('');

    useEffect(() => {
        setMounted(true);
        setForm(profile);
    }, [profile]);

    if (!mounted) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-6 h-6 border-2 border-nord8 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const allQuestions = getAllQuestions();
    const totalQuestions = allQuestions.length;
    const completedCount = completedQuestions.length;
    const overallProgress = totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;
    const overallProgressFormatted = overallProgress < 1 && overallProgress > 0
        ? overallProgress.toFixed(1)
        : Math.round(overallProgress);
    const examsTaken = examSessions.filter(e => e.completed).length;
    const totalScore = examSessions.filter(e => e.completed).reduce((s, e) => s + e.score, 0);

    const handleSave = async () => {
        updateProfile(form);
        setEditing(false);
        setSaved(true);
        // Force immediate sync
        setTimeout(() => syncToFirestore(), 100);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleLogout = () => {
        if (logoutInput === 'logout') {
            logout();
            router.push('/login');
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteInput === `delete ${username}`) {
            await deleteAccount();
            router.push('/login');
        }
    };

    const socialLinks = [
        { key: 'leetcode' as const, label: 'LeetCode', icon: Code2, url: (v: string) => v.startsWith('http') ? v : `https://leetcode.com/u/${v}`, color: 'text-nord13' },
        { key: 'gfg' as const, label: 'GeeksforGeeks', icon: Globe, url: (v: string) => v.startsWith('http') ? v : `https://www.geeksforgeeks.org/user/${v}`, color: 'text-nord14' },
        { key: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin, url: (v: string) => v.startsWith('http') ? v : `https://linkedin.com/in/${v}`, color: 'text-nord9' },
        { key: 'github' as const, label: 'GitHub', icon: Github, url: (v: string) => v.startsWith('http') ? v : `https://github.com/${v}`, color: 'text-nord5' },
    ];

    // Find strongest topic
    const topicScores = DSA_TOPICS_ORDERED.map(t => ({
        topic: t,
        progress: getTopicProgress(t, completedQuestions),
    })).sort((a, b) => b.progress - a.progress);

    const strongestTopic = topicScores[0]?.progress > 0 ? topicScores[0].topic : 'None yet';

    return (
        <div className="space-y-4 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-nord6 tracking-tight">Profile</h1>
                    <p className="text-nord4/50 text-xs">Your DSA journey at a glance</p>
                </div>
                {!editing ? (
                    <button
                        onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-nord4/50 border border-nord3/20 hover:border-nord8/30 hover:text-nord8 transition-all"
                    >
                        <Edit3 size={12} />
                        Edit Profile
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-nord14/15 text-nord14 border border-nord14/30 hover:bg-nord14/25 transition-all"
                    >
                        <Save size={12} />
                        Save
                    </button>
                )}
            </div>

            {saved && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-nord14/10 border border-nord14/20 animate-fade-in-up">
                    <Check size={14} className="text-nord14" />
                    <span className="text-xs text-nord14 font-medium">Profile saved & synced to cloud!</span>
                </div>
            )}

            {/* Profile Card */}
            <div className="card-nord p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-nord8/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-nord8 to-nord10 flex items-center justify-center">
                        <span className="text-2xl font-extrabold text-nord0">
                            {(profile.displayName || username || '?')[0].toUpperCase()}
                        </span>
                    </div>

                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <input
                                value={form.displayName}
                                onChange={e => setForm({ ...form, displayName: e.target.value })}
                                placeholder="Display Name"
                                className="w-full bg-nord0/50 border border-nord3/30 rounded-lg px-3 py-1.5 text-sm font-bold text-nord6 placeholder:text-nord3/40 focus:outline-none focus:ring-1 focus:ring-nord8/30 mb-1"
                            />
                        ) : (
                            <h2 className="text-lg font-bold text-nord6 truncate">
                                {profile.displayName || username}
                            </h2>
                        )}
                        <p className="text-xs text-nord4/40 font-mono">@{username}</p>

                        {editing ? (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <input
                                    value={form.college}
                                    onChange={e => setForm({ ...form, college: e.target.value })}
                                    placeholder="College/University"
                                    className="bg-nord0/50 border border-nord3/30 rounded-lg px-2.5 py-1.5 text-xs text-nord5 placeholder:text-nord3/40 focus:outline-none focus:ring-1 focus:ring-nord8/30"
                                />
                                <input
                                    value={form.targetExam}
                                    onChange={e => setForm({ ...form, targetExam: e.target.value })}
                                    placeholder="Target Exam"
                                    className="bg-nord0/50 border border-nord3/30 rounded-lg px-2.5 py-1.5 text-xs text-nord5 placeholder:text-nord3/40 focus:outline-none focus:ring-1 focus:ring-nord8/30"
                                />
                            </div>
                        ) : (
                            <div className="flex gap-2 mt-1.5 flex-wrap">
                                {profile.college && (
                                    <span className="pill !text-[9px] !px-2 !py-0.5 bg-nord9/10 text-nord9 border border-nord9/20">
                                        <GraduationCap size={9} className="mr-0.5" /> {profile.college}
                                    </span>
                                )}
                                {profile.targetExam && (
                                    <span className="pill !text-[9px] !px-2 !py-0.5 bg-nord15/10 text-nord15 border border-nord15/20">
                                        <Target size={9} className="mr-0.5" /> {profile.targetExam}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Bio */}
                <div className="mt-4">
                    {editing ? (
                        <textarea
                            value={form.bio}
                            onChange={e => setForm({ ...form, bio: e.target.value })}
                            placeholder="Write a short bio about yourself..."
                            rows={2}
                            className="w-full bg-nord0/50 border border-nord3/30 rounded-lg px-3 py-2 text-xs text-nord5 placeholder:text-nord3/40 focus:outline-none focus:ring-1 focus:ring-nord8/30 resize-none"
                        />
                    ) : profile.bio ? (
                        <p className="text-xs text-nord4/60 leading-relaxed">{profile.bio}</p>
                    ) : (
                        <p className="text-xs text-nord4/20 italic">No bio set yet</p>
                    )}
                </div>
            </div>

            {/* Social Links */}
            <div className="card-nord p-4">
                <h3 className="text-xs font-bold text-nord5 mb-3 flex items-center gap-1.5">
                    <Globe size={14} className="text-nord8/60" />
                    Coding Profiles
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {socialLinks.map(sl => {
                        const Icon = sl.icon;
                        const value = form[sl.key] || '';
                        const profileValue = profile[sl.key] || '';

                        return (
                            <div key={sl.key} className="flex items-center gap-2">
                                <Icon size={14} className={`flex-shrink-0 ${sl.color}`} />
                                {editing ? (
                                    <input
                                        value={value}
                                        onChange={e => setForm({ ...form, [sl.key]: e.target.value })}
                                        placeholder={`${sl.label} username or URL`}
                                        className="flex-1 bg-nord0/50 border border-nord3/30 rounded-lg px-2.5 py-1.5 text-xs text-nord5 placeholder:text-nord3/40 focus:outline-none focus:ring-1 focus:ring-nord8/30"
                                    />
                                ) : profileValue ? (
                                    <a
                                        href={sl.url(profileValue)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 flex items-center gap-1 text-xs text-nord8 hover:underline truncate"
                                    >
                                        {profileValue}
                                        <ExternalLink size={10} className="flex-shrink-0 opacity-40" />
                                    </a>
                                ) : (
                                    <span className="text-[10px] text-nord4/20 italic">Not set</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="card-nord p-3 text-center">
                    <Trophy size={16} className="text-nord8 mx-auto mb-1" />
                    <p className="text-lg font-bold text-nord8">{rating}</p>
                    <p className="text-[9px] text-nord4/30">Rating</p>
                </div>
                <div className="card-nord p-3 text-center">
                    <Flame size={16} className="text-nord12 mx-auto mb-1" />
                    <p className="text-lg font-bold text-nord6">{streak}</p>
                    <p className="text-[9px] text-nord4/30">Day Streak</p>
                </div>
                <div className="card-nord p-3 text-center">
                    <CheckCircle2 size={16} className="text-nord14 mx-auto mb-1" />
                    <p className="text-lg font-bold text-nord6">{completedCount}<span className="text-xs text-nord4/30">/{totalQuestions}</span></p>
                    <p className="text-[9px] text-nord4/30">Solved</p>
                </div>
                <div className="card-nord p-3 text-center">
                    <BookOpen size={16} className="text-nord15 mx-auto mb-1" />
                    <p className="text-lg font-bold text-nord6">{examsTaken}</p>
                    <p className="text-[9px] text-nord4/30">Exams ({totalScore} pts)</p>
                </div>
            </div>

            {/* Overall Progress */}
            <div className="card-nord p-4 flex items-center gap-6">
                <ProgressRing
                    percentage={overallProgress}
                    size={80}
                    strokeWidth={6}
                    color="#88C0D0"
                    label={`${overallProgressFormatted}%`}
                />
                <div className="flex-1">
                    <p className="text-sm font-bold text-nord5 mb-1">Overall Progress</p>
                    <p className="text-xs text-nord4/40 mb-2">
                        {completedCount} of {totalQuestions} questions solved
                    </p>
                    <div className="h-1.5 rounded-full bg-nord2 mb-1">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-nord8 to-nord9 transition-all duration-700"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                    <p className="text-[9px] text-nord4/25">Strongest topic: {strongestTopic}</p>
                </div>
            </div>

            {/* LeetCode Profile Tracking */}
            {!editing && profile.leetcode && (
                <LeetCodeStats username={profile.leetcode} />
            )}

            {/* Account Settings */}
            <div className="card-nord p-4 space-y-4">
                <h3 className="text-sm font-bold text-nord11 flex items-center gap-1.5">
                    <AlertTriangle size={16} /> Danger Zone
                </h3>

                {/* Logout Section */}
                {!showLogoutConfirm ? (
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-nord11/10 text-nord11 border border-nord11/20 hover:bg-nord11/20 transition-all font-semibold text-sm"
                    >
                        <LogOut size={16} /> Logout
                    </button>
                ) : (
                    <div className="p-4 rounded-xl bg-nord11/10 border border-nord11/30 space-y-3 animate-fade-in-up">
                        <p className="text-xs text-nord4/80 font-medium">Please type <span className="text-nord11 font-bold">logout</span> to confirm.</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={logoutInput}
                                onChange={(e) => setLogoutInput(e.target.value)}
                                onPaste={(e) => e.preventDefault()}
                                placeholder="logout"
                                className="flex-1 bg-nord0/50 border border-nord11/30 rounded-lg px-3 py-2 text-sm text-nord5 placeholder:text-nord3/40 focus:outline-none focus:ring-1 focus:ring-nord11/50"
                            />
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="p-2 rounded-lg text-nord4/50 hover:text-nord4 hover:bg-nord0/50 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={logoutInput !== 'logout'}
                            className="w-full py-2 rounded-lg bg-nord11 text-nord0 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Confirm Logout
                        </button>
                    </div>
                )}

                {/* Delete Account Section */}
                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-nord11/70 border border-nord11/10 hover:bg-nord11/10 hover:border-nord11/20 transition-all font-semibold text-xs mt-2"
                    >
                        <Trash2 size={14} /> Delete Account
                    </button>
                ) : (
                    <div className="p-4 rounded-xl bg-nord11/5 border border-nord11/20 space-y-3 animate-fade-in-up mt-2">
                        <div className="bg-nord11/10 p-2.5 rounded-lg border border-nord11/20">
                            <p className="text-xs text-nord11 font-semibold flex items-start gap-1.5 mb-0">
                                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                                Warning: This action is irreversible. You will not be able to log back in as @{username} ever again.
                            </p>
                        </div>
                        <p className="text-xs text-nord4/80">Type <span className="text-nord11 font-bold">delete {username}</span> to permanently disable your account.</p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={deleteInput}
                                onChange={(e) => setDeleteInput(e.target.value)}
                                onPaste={(e) => e.preventDefault()}
                                placeholder={`delete ${username}`}
                                className="flex-1 bg-nord0/50 border border-nord11/30 rounded-lg px-3 py-2 text-sm text-nord5 placeholder:text-nord3/40 focus:outline-none focus:ring-1 focus:ring-nord11/50"
                            />
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="p-2 rounded-lg text-nord4/50 hover:text-nord4 hover:bg-nord0/50 transition-all"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <button
                            onClick={handleDeleteAccount}
                            disabled={deleteInput !== `delete ${username}`}
                            className="w-full py-2 rounded-lg bg-nord11/20 text-nord11 border border-nord11/30 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-nord11 hover:text-nord0 transition-all"
                        >
                            Permanently Delete Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
