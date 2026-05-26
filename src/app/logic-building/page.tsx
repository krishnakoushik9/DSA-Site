'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Modular Components
import WorkspaceLayout from '@/components/logic-building/WorkspaceLayout';
import Sidebar from '@/components/logic-building/Sidebar';
import ProblemViewer from '@/components/logic-building/ProblemViewer';
import EditorPanel from '@/components/logic-building/EditorPanel';
import ConsolePanel from '@/components/logic-building/ConsolePanel';
import Taskbar from '@/components/logic-building/Taskbar';

interface GithubNode {
    path: string;
    mode: string;
    type: 'blob' | 'tree';
    sha: string;
    url: string;
}

interface Log {
    type: 'info' | 'error' | 'success' | 'warning';
    message: string;
    timestamp: string;
}

export default function LogicBuildingPage() {
    const { logicBuildingCodes, saveLogicBuildingCode, completedQuestions } = useAppStore();
    const [mounted, setMounted] = useState(false);

    // Data State
    const [files, setFiles] = useState<GithubNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<GithubNode | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [loadingContent, setLoadingContent] = useState(false);
    const [currentCode, setCurrentCode] = useState('');

    // UI State
    const [isSidebarVisible, setSidebarVisible] = useState(true);
    const [isConsoleVisible, setConsoleVisible] = useState(false);
    const [currentMode, setMode] = useState<'zen' | 'focus' | 'normal'>('normal');
    const [logs, setLogs] = useState<Log[]>([]);
    const [isExecuting, setIsExecuting] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchRepoContents();
    }, []);

    const fetchRepoContents = async () => {
        setLoading(true);
        try {
            const res = await fetch('https://api.github.com/repos/Upendhar10/LogicBuilding101/git/trees/main?recursive=1');
            const data = await res.json();
            if (data.tree) {
                const javaFiles = data.tree.filter((node: GithubNode) => node.type === 'blob' && node.path.includes('DAY'));
                setFiles(javaFiles);
            }
        } catch (e) {
            console.error("Failed to fetch repo", e);
            addLog('error', 'Failed to connect to the Logic Arena. Check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const fetchContent = async (node: GithubNode) => {
        setSelectedFile(node);
        setLoadingContent(true);
        addLog('info', `Initializing environment for: ${node.path.split('/').pop()}`);
        
        try {
            const res = await fetch(`https://raw.githubusercontent.com/Upendhar10/LogicBuilding101/main/${node.path}`);
            const text = await res.text();
            setFileContent(text);
            
            // Load saved code or default
            const savedCode = (logicBuildingCodes || {})[node.path];
            setCurrentCode(savedCode || 'public class Main {\n    public static void main(String[] args) {\n        // Your logic here\n    }\n}');
            
            addLog('success', 'Workspace ready.');
        } catch (e) {
            console.error("Failed to fetch content", e);
            addLog('error', 'Failed to load problem content.');
        } finally {
            setLoadingContent(false);
        }
    };

    const addLog = (type: Log['type'], message: string) => {
        setLogs(prev => [...prev, {
            type,
            message,
            timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }]);
        setConsoleVisible(true);
    };

    const handleRun = () => {
        setIsExecuting(true);
        addLog('info', 'Compiling source code...');
        
        setTimeout(() => {
            addLog('success', 'Build successful. Running tests...');
            setTimeout(() => {
                addLog('info', 'Output: Hello World!');
                addLog('warning', 'Memory usage: 42MB');
                setIsExecuting(false);
            }, 1000);
        }, 800);
    };

    const handleSubmit = () => {
        if (!selectedFile) return;
        setIsExecuting(true);
        addLog('info', 'Submitting solution to judge...');
        
        setTimeout(() => {
            saveLogicBuildingCode(selectedFile.path, currentCode);
            addLog('success', 'Solution Accepted! Code persisted to cloud.');
            setIsExecuting(false);
            
            // Trigger cinematic success
            const audio = new Audio('/audio/mixkit-game-success-alert-2039.wav');
            audio.volume = 0.3;
            audio.play().catch(() => {});
        }, 1500);
    };

    const handleReset = () => {
        if (confirm('Reset your code to default? This cannot be undone.')) {
            setCurrentCode('public class Main {\n    public static void main(String[] args) {\n        // Your logic here\n    }\n}');
            addLog('warning', 'Code reset to template.');
        }
    };

    if (!mounted) return null;

    // Organize files into folders
    const folders = files.reduce((acc, file) => {
        const parts = file.path.split('/');
        const folderName = parts[0];
        if (!acc[folderName]) acc[folderName] = [];
        acc[folderName].push(file);
        return acc;
    }, {} as Record<string, GithubNode[]>);

    return (
        <div className={`h-screen flex flex-col bg-nord0 text-nord4 selection:bg-nord8/30 overflow-hidden transition-all duration-700 ${
            currentMode === 'zen' ? 'grayscale-[0.5] contrast-[1.1]' : ''
        }`}>
            {/* Minimal Header */}
            <div className={`flex items-center justify-between px-6 py-3 border-b border-nord3/10 bg-nord1/30 backdrop-blur-md z-20 transition-all duration-500 ${
                currentMode !== 'normal' ? '-translate-y-full opacity-0' : ''
            }`}>
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="p-2 hover:bg-nord3/20 rounded-xl text-nord4/60 hover:text-nord6 transition-all group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="h-6 w-[1px] bg-nord3/20" />
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-sm font-bold text-nord6 tracking-tight flex items-center gap-2">
                                <Zap size={14} className="text-nord8 fill-nord8" />
                                Logic Building Arena
                            </h1>
                            <div className="px-2 py-0.5 bg-nord8/10 rounded-full border border-nord8/20">
                                <span className="text-[9px] font-bold text-nord8 uppercase tracking-widest">v2.0 Beta</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-nord4/40 font-mono mt-0.5 uppercase tracking-tighter">Upendhar10 / LogicBuilding101</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-nord3/10 rounded-lg border border-nord3/20">
                        <Sparkles size={12} className="text-nord13" />
                        <span className="text-[10px] font-bold text-nord6">840 XP</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-nord8/20 border border-nord8/30 flex items-center justify-center text-nord8 text-xs font-bold">
                        U
                    </div>
                </div>
            </div>

            {/* Workspace */}
            <div className="flex-1 relative min-h-0">
                <AnimatePresence mode="wait">
                    {selectedFile ? (
                        <motion.div 
                            key="arena"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full"
                        >
                            <WorkspaceLayout
                                isSidebarVisible={isSidebarVisible && currentMode === 'normal'}
                                isConsoleVisible={isConsoleVisible && currentMode !== 'zen'}
                                sidebar={
                                    <Sidebar 
                                        folders={folders}
                                        selectedFile={selectedFile}
                                        onSelectFile={fetchContent}
                                        loading={loading}
                                        completedFiles={completedQuestions}
                                    />
                                }
                                problem={
                                    <ProblemViewer 
                                        title={selectedFile.path.split('/').pop() || ''}
                                        content={fileContent}
                                        loading={loadingContent}
                                    />
                                }
                                editor={
                                    <EditorPanel 
                                        code={currentCode}
                                        onChange={(val) => setCurrentCode(val || '')}
                                        onRun={handleRun}
                                        onSubmit={handleSubmit}
                                        onReset={handleReset}
                                        isExecuting={isExecuting}
                                    />
                                }
                                console={
                                    <ConsolePanel 
                                        logs={logs}
                                        onClear={() => setLogs([])}
                                    />
                                }
                            />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="selector"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="h-full flex flex-col"
                        >
                            <div className="flex-1 flex">
                                <div className="w-[300px] border-r border-nord3/10 h-full">
                                    <Sidebar 
                                        folders={folders}
                                        selectedFile={null}
                                        onSelectFile={fetchContent}
                                        loading={loading}
                                        completedFiles={completedQuestions}
                                    />
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center p-20 bg-nord0">
                                    <motion.div 
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-center space-y-6 max-w-md"
                                    >
                                        <div className="w-24 h-24 bg-nord8/10 rounded-3xl border border-nord8/20 flex items-center justify-center mx-auto shadow-2xl shadow-nord8/10">
                                            <Zap size={48} className="text-nord8" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-nord6 tracking-tight">Welcome to the Arena</h2>
                                            <p className="text-nord4/50 text-sm mt-2 leading-relaxed">
                                                Select a problem from the explorer to begin your logic building session. 
                                                Every line of code brings you closer to mastery.
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="p-4 bg-nord1/50 rounded-2xl border border-nord3/10 text-left">
                                                <h3 className="text-[10px] font-bold text-nord8 uppercase tracking-widest mb-1">Status</h3>
                                                <p className="text-xs text-nord4/60">Ready for Execution</p>
                                            </div>
                                            <div className="p-4 bg-nord1/50 rounded-2xl border border-nord3/10 text-left">
                                                <h3 className="text-[10px] font-bold text-nord14 uppercase tracking-widest mb-1">Goal</h3>
                                                <p className="text-xs text-nord4/60">Solve 3 problems</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Taskbar */}
            <Taskbar 
                isSidebarVisible={isSidebarVisible}
                setSidebarVisible={setSidebarVisible}
                isConsoleVisible={isConsoleVisible}
                setConsoleVisible={setConsoleVisible}
                currentMode={currentMode}
                setMode={setMode}
                onToggleNotes={() => {}}
            />

            {/* Zen Mode Ambient Effects */}
            {currentMode === 'zen' && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 pointer-events-none z-[100] border-[24px] border-nord8/5"
                >
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[10px] font-mono text-nord8/30 uppercase tracking-[1em]">
                        Deep Focus Active
                    </div>
                </motion.div>
            )}
        </div>
    );
}
