'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Folder, FileCode, Search, ArrowLeft } from 'lucide-react';
import LogicBuildingIDE from '@/components/LogicBuildingIDE';
import Link from 'next/link';

interface GithubNode {
    path: string;
    mode: string;
    type: 'blob' | 'tree';
    sha: string;
    url: string;
}

export default function LogicBuildingPage() {
    const { logicBuildingCodes, saveLogicBuildingCode } = useAppStore();
    const [mounted, setMounted] = useState(false);

    const [files, setFiles] = useState<GithubNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFile, setSelectedFile] = useState<GithubNode | null>(null);
    const [fileContent, setFileContent] = useState<string>('');
    const [loadingContent, setLoadingContent] = useState(false);

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
                // Filter only files (blobs), ideally java or md files inside DAY folders
                const javaFiles = data.tree.filter((node: GithubNode) => node.type === 'blob' && node.path.includes('DAY'));
                setFiles(javaFiles);
            }
        } catch (e) {
            console.error("Failed to fetch repo", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchContent = async (node: GithubNode) => {
        setSelectedFile(node);
        setLoadingContent(true);
        try {
            const res = await fetch(`https://raw.githubusercontent.com/Upendhar10/LogicBuilding101/main/${node.path}`);
            const text = await res.text();
            setFileContent(text);
        } catch (e) {
            console.error("Failed to fetch content", e);
        } finally {
            setLoadingContent(false);
        }
    };

    if (!mounted) return null;

    const filteredFiles = files.filter(f => f.path.toLowerCase().includes(searchQuery.toLowerCase()));

    // Organize into folders by grouping paths
    const folders = filteredFiles.reduce((acc, file) => {
        const parts = file.path.split('/');
        const folderName = parts[0];
        if (!acc[folderName]) acc[folderName] = [];
        acc[folderName].push(file);
        return acc;
    }, {} as Record<string, GithubNode[]>);

    return (
        <div className="h-[calc(100vh-80px)] flex flex-col pt-4">
            <div className="flex items-center gap-4 mb-6 px-2">
                <Link href="/dashboard" className="p-2 bg-nord3/20 hover:bg-nord3/40 rounded-lg text-nord4 transition-colors">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-nord6 flex items-center gap-2">
                        Logic Building 101
                        <span className="px-2 py-0.5 bg-nord8/20 text-nord8 text-xs rounded-full border border-nord8/30">
                            Arena Unlocked
                        </span>
                    </h1>
                    <p className="text-nord4/60 text-sm">Practicing Upendhar10/LogicBuilding101</p>
                </div>
            </div>

            <div className="flex-1 flex gap-4 min-h-0">
                {/* Left pane: File Explorer */}
                <div className="w-[300px] flex-shrink-0 card-nord flex flex-col overflow-hidden shadow-xl border border-nord3/30">
                    <div className="p-4 border-b border-nord3/20">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-nord4/40" />
                            <input
                                type="text"
                                placeholder="Search problems..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-nord0 border border-nord3/30 rounded-lg text-sm text-nord5 placeholder:text-nord4/30 focus:outline-none focus:border-nord8 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2">
                        {loading ? (
                            <div className="flex items-center justify-center h-20 text-nord4/50 text-sm">
                                Loading repository...
                            </div>
                        ) : (
                            Object.keys(folders).sort().map(folder => (
                                <div key={folder} className="mb-2">
                                    <div className="flex items-center gap-2 px-2 py-1.5 text-nord8 font-medium text-sm">
                                        <Folder size={14} />
                                        {folder}
                                    </div>
                                    <div className="pl-4 space-y-0.5 mt-1">
                                        {folders[folder].map(file => {
                                            const filename = file.path.substring(folder.length + 1);
                                            const isSelected = selectedFile?.sha === file.sha;
                                            return (
                                                <button
                                                    key={file.sha}
                                                    onClick={() => fetchContent(file)}
                                                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${isSelected ? 'bg-nord3/40 text-nord6' : 'text-nord4/70 hover:bg-nord3/20 hover:text-nord5'
                                                        }`}
                                                >
                                                    <FileCode size={12} className={isSelected ? 'text-nord8' : 'text-nord4/50'} />
                                                    <span className="truncate">{filename}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Pane: IDE and Content */}
                <div className="flex-1 flex flex-col gap-4 min-h-0">
                    {selectedFile ? (
                        <>
                            <div className="h-1/3 card-nord p-4 overflow-y-auto shadow-xl border border-nord3/30">
                                <h2 className="text-lg font-bold text-nord6 mb-3 flex items-center gap-2">
                                    <FileCode size={18} className="text-nord8" />
                                    {selectedFile.path.split('/').pop()}
                                </h2>
                                {loadingContent ? (
                                    <div className="animate-pulse flex space-x-4">
                                        <div className="flex-1 space-y-3 py-1">
                                            <div className="h-2 bg-nord3/40 rounded w-3/4"></div>
                                            <div className="h-2 bg-nord3/40 rounded"></div>
                                            <div className="h-2 bg-nord3/40 rounded w-5/6"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <pre className="text-sm text-nord4 font-mono whitespace-pre-wrap">
                                        {fileContent}
                                    </pre>
                                )}
                            </div>
                            <div className="flex-1 min-h-0">
                                <LogicBuildingIDE
                                    problemTitle={selectedFile.path}
                                    initialCode={(logicBuildingCodes || {})[selectedFile.path] || 'public class Main {\n    public static void main(String[] args) {\n        // Write your logic here\n    }\n}'}
                                    onSubmit={(code) => saveLogicBuildingCode(selectedFile.path, code)}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 card-nord flex items-center justify-center shadow-xl border border-nord3/30">
                            <div className="text-center text-nord4/50">
                                <FileCode size={48} className="mx-auto mb-4 opacity-50" />
                                <p>Select a problem from the explorer to begin.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
