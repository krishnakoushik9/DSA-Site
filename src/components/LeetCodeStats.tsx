'use client';

import { useState, useEffect } from 'react';
import { Code2, Target, CheckCircle2 } from 'lucide-react';

export default function LeetCodeStats({ username }: { username: string }) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!username) return;

        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/leetcode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username }),
                });

                if (!res.ok) throw new Error('Failed to fetch LeetCode data');

                const data = await res.json();
                if (data.matchedUser) {
                    setStats(data);
                } else {
                    throw new Error('User not found');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [username]);

    if (!username) return null;

    if (loading) {
        return (
            <div className="card-nord p-4 flex items-center justify-center h-32 mt-4">
                <div className="w-6 h-6 border-2 border-nord13 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="card-nord p-4 flex flex-col items-center justify-center text-nord4/50 mt-4">
                <p className="text-xs">Failed to load LeetCode stats.</p>
                <p className="text-[10px] text-nord11/70 mt-1">{error}</p>
            </div>
        );
    }

    if (!stats) return null;

    const acStats = stats.matchedUser.submitStats.acSubmissionNum;
    const total = acStats.find((s: any) => s.difficulty === 'All')?.count || 0;
    const easy = acStats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
    const medium = acStats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
    const hard = acStats.find((s: any) => s.difficulty === 'Hard')?.count || 0;
    const ranking = stats.matchedUser.profile.ranking;

    return (
        <div className="card-nord p-5 mt-4">
            <h3 className="text-sm font-bold text-nord6 mb-4 flex items-center gap-2">
                <Code2 size={16} className="text-nord13" />
                LeetCode Profile: {username}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-nord0/40 rounded-xl p-3 border border-nord3/20 flex flex-col items-center justify-center">
                    <span className="text-xs text-nord4/50 mb-1">Total Solved</span>
                    <span className="text-lg font-bold text-nord6">{total}</span>
                </div>
                <div className="bg-nord14/5 rounded-xl p-3 border border-nord14/20 flex flex-col items-center justify-center">
                    <span className="text-xs text-nord14/70 mb-1">Easy</span>
                    <span className="text-lg font-bold text-nord14">{easy}</span>
                </div>
                <div className="bg-nord13/5 rounded-xl p-3 border border-nord13/20 flex flex-col items-center justify-center">
                    <span className="text-xs text-nord13/70 mb-1">Medium</span>
                    <span className="text-lg font-bold text-nord13">{medium}</span>
                </div>
                <div className="bg-nord11/5 rounded-xl p-3 border border-nord11/20 flex flex-col items-center justify-center">
                    <span className="text-xs text-nord11/70 mb-1">Hard</span>
                    <span className="text-lg font-bold text-nord11">{hard}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
                {ranking && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nord8/10 text-nord8 border border-nord8/20">
                        <Target size={14} />
                        <span className="font-medium">Global Rank:</span>
                        <span className="font-bold">{ranking.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-nord12/10 text-nord12 border border-nord12/20">
                    <CheckCircle2 size={14} />
                    <span className="font-medium">Always Tracking</span>
                </div>
            </div>
        </div>
    );
}
