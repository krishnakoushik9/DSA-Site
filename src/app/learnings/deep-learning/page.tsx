'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { BookOpen, CheckCircle2, Circle, Github, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const ReactMarkdown = dynamic(() => import('react-markdown'), { ssr: false });

interface NotebookFile {
    name: string;
    path: string;
    sha: string;
    url: string;
    html_url: string;
    download_url: string;
}

interface NotebookCell {
    cell_type: 'markdown' | 'code';
    source: string[];
}

export default function DeepLearningPage() {
    const { deepLearningProgress, toggleDeepLearningProgress } = useAppStore();

    const [files, setFiles] = useState<NotebookFile[]>([]);
    const [loadingFiles, setLoadingFiles] = useState(true);
    const [error, setError] = useState('');

    const [activeFile, setActiveFile] = useState<NotebookFile | null>(null);
    const [notebookContent, setNotebookContent] = useState<NotebookCell[] | null>(null);
    const [loadingContent, setLoadingContent] = useState(false);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                setLoadingFiles(true);
                const res = await fetch('https://api.github.com/repos/fchollet/deep-learning-with-python-notebooks/contents');
                if (!res.ok) throw new Error('Failed to fetch from GitHub');

                const data: any[] = await res.json();

                const notebooks = data.filter(item =>
                    item.type === 'file' && item.name.endsWith('.ipynb') && !item.name.includes('DLwP')
                ).sort((a, b) => a.name.localeCompare(b.name));

                setFiles(notebooks);
            } catch (err: any) {
                setError(err.message || 'Failed to load notebooks');
            } finally {
                setLoadingFiles(false);
            }
        };

        fetchFiles();
    }, []);

    useEffect(() => {
        const fetchNotebook = async () => {
            if (!activeFile) return;
            try {
                setLoadingContent(true);
                setNotebookContent(null);

                const res = await fetch(activeFile.download_url);
                if (!res.ok) throw new Error('Failed to fetch notebook content');

                const text = await res.text();
                const json = JSON.parse(text);

                if (json && json.cells) {
                    setNotebookContent(json.cells as NotebookCell[]);
                } else {
                    setNotebookContent([]);
                }
            } catch (err: any) {
                console.error('Error fetching notebook:', err);
                setNotebookContent([]);
            } finally {
                setLoadingContent(false);
            }
        };

        if (activeFile) {
            fetchNotebook();
        }
    }, [activeFile]);

    const completedCount = files.filter(f => deepLearningProgress?.[f.sha]).length;
    const progressPercent = files.length > 0 ? Math.round((completedCount / files.length) * 100) : 0;

    return (
        <div className="max-w-[1400px] mx-auto animate-fade-in flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] pb-10">

            <div className="w-full lg:w-[320px] shrink-0 bg-[#0F172A]/80 backdrop-blur-xl border border-nord3/30 rounded-3xl overflow-hidden flex flex-col shadow-xl">
                <div className="p-6 border-b border-nord3/30 bg-nord0/40 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-nord8/10 rounded-full blur-2xl pointer-events-none" />

                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2 relative z-10">
                        <BookOpen size={20} className="text-nord8" />
                        Deep Learning
                    </h2>

                    <p className="text-xs text-nord4/60 mb-4 flex items-center gap-1.5 relative z-10">
                        <Github size={12} /> fchollet/deep-learning-with-python-notebooks
                    </p>

                    <div className="space-y-1.5 relative z-10">
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-nord4">Course Progress</span>
                            <span className="text-nord8">{progressPercent}%</span>
                        </div>
                        <div className="w-full h-2 bg-nord3/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-nord8 to-nord9 transition-all duration-700 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin scrollbar-thumb-nord3 scrollbar-track-transparent">
                    {loadingFiles ? (
                        <div className="flex items-center justify-center p-8 text-nord4/50">
                            <Loader2 size={18} className="animate-spin mr-2" /> Loading notebooks...
                        </div>
                    ) : error ? (
                        <div className="p-4 text-xs text-nord11 bg-nord11/10 rounded-xl border border-nord11/20 text-center">
                            {error}
                        </div>
                    ) : (
                        files.map(file => {
                            const isCompleted = deepLearningProgress?.[file.sha] || false;
                            const isActive = activeFile?.sha === file.sha;

                            return (
                                <button
                                    key={file.sha}
                                    onClick={() => setActiveFile(file)}
                                    className={`w-full text-left flex items-start justify-between gap-3 p-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-nord8/10 border-nord8/30 shadow-[0_4px_12px_rgba(136,192,208,0.1)]'
                                            : 'border-transparent hover:bg-nord3/30'
                                        } border`}
                                >
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className={`text-sm font-medium truncate mb-1 ${isActive ? 'text-nord8' : 'text-nord4/90'}`}>
                                            {file.name.replace('.ipynb', '').replace(/[_.-]/g, ' ')}
                                        </div>
                                        <div className="text-[10px] text-nord4/40 truncate">
                                            {file.name}
                                        </div>
                                    </div>

                                    <div
                                        className="mt-0.5 shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleDeepLearningProgress(file.sha);
                                        }}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 size={18} className="text-nord14 animate-fade-in" />
                                        ) : (
                                            <Circle size={18} className="text-nord4/20 hover:text-nord8 transition-colors" />
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="flex-1 bg-[#0F172A] border border-nord3/30 rounded-3xl overflow-hidden shadow-xl flex flex-col relative">

                <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-nord8/5 to-transparent pointer-events-none" />

                {!activeFile ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-nord4/40 p-10 text-center relative z-10">
                        <BookOpen size={48} className="mb-4 opacity-50 text-nord8" />
                        <h3 className="text-xl font-bold text-nord4/80 mb-2">Select a Notebook</h3>
                        <p className="max-w-md text-sm">Choose a Jupyter Notebook from the sidebar to start reading and executing through the Deep Learning Masterclass.</p>
                    </div>
                ) : (
                    <>
                        <div className="px-8 py-5 border-b border-nord3/30 bg-nord0/60 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
                            <div>
                                <h2 className="text-lg font-bold text-nord6 truncate">
                                    {activeFile.name.replace('.ipynb', '')}
                                </h2>
                                <a
                                    href={activeFile.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-nord8 hover:underline flex items-center gap-1 mt-1"
                                >
                                    View Source on GitHub
                                </a>
                            </div>

                            <button
                                onClick={() => toggleDeepLearningProgress(activeFile.sha)}
                                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 shadow-sm ${deepLearningProgress?.[activeFile.sha]
                                        ? 'bg-nord14/20 text-nord14 border border-nord14/30 hover:bg-nord14/30'
                                        : 'bg-gradient-to-r from-nord8 to-nord9 text-white hover:shadow-lg hover:shadow-nord8/20 border border-transparent'
                                    }`}
                            >
                                {deepLearningProgress?.[activeFile.sha] ? (
                                    <><CheckCircle2 size={16} /> Completed</>
                                ) : (
                                    <>Mark Complete</>
                                )}
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-nord3">
                            {loadingContent ? (
                                <div className="h-full flex flex-col items-center justify-center text-nord4/50 gap-3">
                                    <div className="w-10 h-10 border-4 border-nord8/20 border-t-nord8 rounded-full animate-spin" />
                                    Parsing Jupyter Notebook...
                                </div>
                            ) : !notebookContent || notebookContent.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-nord4/50">
                                    No readable content found or error parsing notebook.
                                </div>
                            ) : (
                                <div className="max-w-4xl mx-auto space-y-6 pb-20">
                                    {notebookContent.map((cell, idx) => {
                                        const source = cell.source.join('');

                                        if (cell.cell_type === 'markdown') {
                                            return (
                                                <div key={idx} className="prose prose-invert prose-nord max-w-none 
                                                    prose-headings:text-nord6 prose-a:text-nord8 prose-code:text-nord4 
                                                    prose-code:bg-nord1/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
                                                    prose-pre:bg-nord0/80 prose-pre:border prose-pre:border-nord3/30 leading-relaxed
                                                ">
                                                    <ReactMarkdown>{source}</ReactMarkdown>
                                                </div>
                                            );
                                        }

                                        if (cell.cell_type === 'code') {
                                            if (!source.trim()) return null;
                                            return (
                                                <div key={idx} className="my-6 rounded-xl overflow-hidden border border-nord3/40 bg-[#1e1e1e] shadow-lg">
                                                    <div className="px-4 py-2 bg-[#2d2d2d] text-[#858585] text-xs font-mono border-b border-[#3c3c3c] flex items-center justify-between">
                                                        <span>Python</span>
                                                        <span className="opacity-50">[{idx}]</span>
                                                    </div>
                                                    <pre className="p-4 overflow-x-auto text-sm font-mono text-nord4">
                                                        <code>{source}</code>
                                                    </pre>
                                                </div>
                                            );
                                        }

                                        return null;
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

        </div>
    );
}
