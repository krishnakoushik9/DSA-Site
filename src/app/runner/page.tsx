'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Zap, X, Maximize2, Minimize2, ExternalLink, ChevronDown, ChevronUp, GripHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

function RunnerContent() {
    const searchParams = useSearchParams();
    const [solveData, setSolveData] = useState<{ title: string; difficulty: string; url: string } | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Window State
    const [pos, setPos] = useState({ x: 0, y: 80 });
    const [size, setSize] = useState({ width: 800, height: 500 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Load state from local storage
    useEffect(() => {
        const saved = localStorage.getItem('runner-problem-window');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setPos(parsed.pos || { x: window.innerWidth / 2 - 400, y: 80 });
                setSize(parsed.size || { width: 800, height: 500 });
                setIsCollapsed(parsed.isCollapsed || false);
            } catch (e) {
                console.error('Failed to parse window state', e);
            }
        } else {
            // Default center
            setPos({ x: window.innerWidth / 2 - 400, y: 80 });
        }

        const title = searchParams.get('title');
        const difficulty = searchParams.get('difficulty');
        const url = searchParams.get('url');

        if (title && url) {
            setSolveData({ title, difficulty: difficulty || 'Unknown', url });
            setShowPopup(true);
        }
    }, [searchParams]);

    // Persist state
    useEffect(() => {
        if (showPopup) {
            localStorage.setItem('runner-problem-window', JSON.stringify({ pos, size, isCollapsed }));
        }
    }, [pos, size, isCollapsed, showPopup]);

    // Global listeners for Drag/Resize
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPos({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            } else if (isResizing) {
                const newSize = { ...size };
                const newPos = { ...pos };

                if (isResizing.includes('right')) {
                    newSize.width = Math.max(400, e.clientX - pos.x);
                }
                if (isResizing.includes('bottom')) {
                    newSize.height = Math.max(200, e.clientY - pos.y);
                }
                if (isResizing.includes('left')) {
                    const deltaX = e.clientX - pos.x;
                    const newW = size.width - deltaX;
                    if (newW > 400) {
                        newSize.width = newW;
                        newPos.x = e.clientX;
                    }
                }

                setSize(newSize);
                setPos(newPos);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(null);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, pos, size]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                setShowPopup(prev => !prev);
            }
            if (e.key === 'Escape' && showPopup) {
                setIsCollapsed(true);
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [showPopup]);

    const startDrag = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button')) return;
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - pos.x,
            y: e.clientY - pos.y
        });
    };

    return (
        <div
            className="flex flex-col h-[calc(100vh-140px)] relative overflow-hidden"
            style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
        >
            <AnimatePresence>
                {showPopup && solveData && (
                    <motion.div
                        drag={false}
                        initial={false}
                        animate={isCollapsed ? {
                            width: 280,
                            height: 48,
                            x: pos.x,
                            y: pos.y,
                            opacity: 1,
                            borderRadius: '24px'
                        } : (isExpanded ? {
                            width: '90vw',
                            height: '75vh',
                            x: (window.innerWidth * 0.05),
                            y: 80,
                            opacity: 1,
                            borderRadius: '14px'
                        } : {
                            width: size.width,
                            height: size.height,
                            x: pos.x,
                            y: pos.y,
                            opacity: 1,
                            borderRadius: '14px'
                        })}
                        transition={{ type: 'spring', damping: 25, stiffness: 200, mass: 0.5 }}
                        className="fixed z-[9999] bg-[#0f1117]/95 backdrop-blur-xl border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.8)] flex flex-col group select-none overflow-hidden"
                        style={{
                            boxShadow: '0 0 0 1px rgba(245,158,11,0.1), 0 20px 80px rgba(0,0,0,0.7)',
                            pointerEvents: 'auto'
                        }}
                    >
                        {/* Title Bar / Drag Handle */}
                        <div
                            onMouseDown={startDrag}
                            onDoubleClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/5 cursor-move active:cursor-grabbing shrink-0"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <GripHorizontal size={14} className="text-zinc-600 shrink-0" />
                                <h3 className="text-xs font-semibold text-zinc-100 truncate flex items-center gap-2">
                                    {isCollapsed && <span className="text-amber-500 text-[10px] font-bold uppercase tracking-wider">Solve:</span>}
                                    {solveData.title}
                                </h3>
                                {!isCollapsed && (
                                    <span className={`flex-shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${solveData.difficulty.toLowerCase() === 'easy' ? 'bg-emerald-500/10 text-emerald-500' :
                                            solveData.difficulty.toLowerCase() === 'medium' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-rose-500/10 text-rose-500'
                                        }`}>
                                        {solveData.difficulty}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5 ml-4 shrink-0">
                                {!isCollapsed && (
                                    <div className="flex items-center gap-1 mr-2 border-r border-white/10 pr-2">
                                        <a
                                            href={solveData.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 rounded-md hover:bg-white/5 text-zinc-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 px-2"
                                            title="Open Original LeetCode"
                                        >
                                            <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:block">LeetCode</span>
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                )}

                                <button
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className="p-1.5 rounded-md hover:bg-white/5 text-zinc-500 hover:text-zinc-100 transition-colors"
                                    title={isCollapsed ? "Restore Window" : "Collapse to Bar"}
                                >
                                    {isCollapsed ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                                </button>

                                {!isCollapsed && (
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="p-1.5 rounded-md hover:bg-white/5 text-zinc-500 hover:text-amber-500 transition-colors"
                                        title={isExpanded ? "Exit Fullscreen" : "Maximize"}
                                    >
                                        <div className="border border-current rounded-[2px] w-3 h-3 opacity-80" />
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowPopup(false)}
                                    className="p-1.5 rounded-md hover:bg-rose-500/10 text-zinc-500 hover:text-rose-500 transition-colors"
                                    title="Close Window"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Resize Handles (Only if not expanded/collapsed) */}
                        {!isExpanded && !isCollapsed && (
                            <>
                                <div onMouseDown={(e) => { e.stopPropagation(); setIsResizing('right'); }} className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize hover:bg-amber-500/20 transition-colors z-10" />
                                <div onMouseDown={(e) => { e.stopPropagation(); setIsResizing('bottom'); }} className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize hover:bg-amber-500/20 transition-colors z-10" />
                                <div onMouseDown={(e) => { e.stopPropagation(); setIsResizing('left'); }} className="absolute top-0 left-0 w-1.5 h-full cursor-ew-resize hover:bg-amber-500/20 transition-colors z-10" />
                                <div onMouseDown={(e) => { e.stopPropagation(); setIsResizing('bottom-right'); }} className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize hover:bg-amber-500/40 transition-colors z-20" />
                            </>
                        )}

                        {/* Content Area */}
                        {!isCollapsed && (
                            <div className="flex-1 bg-white relative overflow-hidden">
                                <iframe
                                    src={solveData.url}
                                    className="w-full h-full border-none"
                                    title="LeetCode Preview"
                                />
                                {/* Bottom Legend Overlay */}
                                <div className="absolute inset-x-0 bottom-0 py-1.5 px-4 bg-black/60 backdrop-blur-md border-t border-white/5 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-[0.2em]">Live Problem Environment</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] text-zinc-500 flex items-center gap-1"><Maximize2 size={8} /> Resize edges</span>
                                        <span className="text-[9px] text-zinc-500 flex items-center gap-1"><X size={8} /> Esc to collapse</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Page Header */}
            <div className="flex items-center gap-4 mb-4 px-1">
                <Link
                    href="/company"
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

export default function RunnerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <RunnerContent />
        </Suspense>
    );
}
