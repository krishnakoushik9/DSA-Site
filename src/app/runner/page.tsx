'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Zap } from 'lucide-react';

// Dynamic import to avoid SSR issues with Monaco Editor
const RunnerIDE = dynamic(
    () => import('@/components/RunnerIDE/RunnerIDE'),
    {
        ssr: false,
        loading: () => (
            <div
                className="flex items-center justify-center h-full rounded-xl"
                style={{ backgroundColor: '#0d1117', border: '1px solid #21262d' }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="w-10 h-10 border-2 rounded-full animate-spin"
                        style={{
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderTopColor: '#e6edf3',
                        }}
                    />
                    <span
                        className="text-sm"
                        style={{ color: '#484f58', fontFamily: "'Inter', sans-serif" }}
                    >
                        Initializing Runner...
                    </span>
                </div>
            </div>
        ),
    }
);

export default function RunnerPage() {
    return (
        <div
            className="flex flex-col h-[calc(100vh-140px)]"
            style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
        >
            {/* Page Header */}
            <div className="flex items-center gap-4 mb-4 px-1">
                <Link
                    href="/dashboard"
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{ color: '#8b949e' }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.color = '#e6edf3';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#8b949e';
                    }}
                >
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                            background:
                                'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <Zap size={18} style={{ color: '#e6edf3' }} />
                    </div>
                    <div>
                        <h1
                            className="text-xl flex items-center gap-2.5"
                            style={{
                                color: '#e6edf3',
                                fontWeight: 700,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Runner
                            <span
                                className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold"
                                style={{
                                    background:
                                        'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03))',
                                    color: '#e6edf3',
                                    border: '1px solid rgba(255, 255, 255, 0.2)',
                                    letterSpacing: '0.1em',
                                    fontFamily: "'JetBrains Mono', monospace",
                                }}
                            >
                                Premium
                            </span>
                        </h1>
                        <p
                            className="text-xs"
                            style={{
                                color: '#484f58',
                                fontWeight: 400,
                                letterSpacing: '0.01em',
                            }}
                        >
                            Execute code online &bull; Powered by Judge0
                        </p>
                    </div>
                </div>
            </div>

            {/* IDE takes remaining space */}
            <div className="flex-1 min-h-0">
                <RunnerIDE />
            </div>
        </div>
    );
}
