'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, FileCode, ChevronRight, Search, Hash, Star, Zap } from 'lucide-react';

interface GithubNode {
    path: string;
    mode: string;
    type: 'blob' | 'tree';
    sha: string;
    url: string;
}

interface SidebarProps {
    folders: Record<string, GithubNode[]>;
    selectedFile: GithubNode | null;
    onSelectFile: (file: GithubNode) => void;
    loading: boolean;
    completedFiles: string[];
}

export default function Sidebar({
    folders,
    selectedFile,
    onSelectFile,
    loading,
    completedFiles
}: SidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

    const toggleFolder = (folder: string) => {
        setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
    };

    const sortedFolders = Object.keys(folders).sort();

    return (
        <div className="h-full flex flex-col bg-nord1/50 backdrop-blur-md border-r border-nord3/20">
            <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-nord4/50 uppercase tracking-widest flex items-center gap-2">
                        <Hash size={12} className="text-nord8" />
                        Explorer
                    </h2>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-nord4/40 font-mono">LIVE</span>
                    </div>
                </div>

                <div className="relative group">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-nord4/30 group-focus-within:text-nord8 transition-colors" />
                    <input
                        type="text"
                        placeholder="Quick search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-nord0/50 border border-nord3/20 rounded-xl text-xs text-nord5 placeholder:text-nord4/30 focus:outline-none focus:border-nord8/50 focus:ring-1 focus:ring-nord8/20 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-40 space-y-3">
                        <div className="w-8 h-8 border-2 border-nord8/30 border-t-nord8 rounded-full animate-spin" />
                        <span className="text-[10px] text-nord4/40 font-mono uppercase">Syncing Arena...</span>
                    </div>
                ) : (
                    sortedFolders.map(folder => {
                        const isExpanded = expandedFolders[folder] || searchQuery !== '';
                        const folderFiles = folders[folder].filter(f => 
                            f.path.toLowerCase().includes(searchQuery.toLowerCase())
                        );

                        if (folderFiles.length === 0) return null;

                        return (
                            <div key={folder} className="space-y-0.5">
                                <button
                                    onClick={() => toggleFolder(folder)}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-nord3/10 transition-colors group text-left"
                                >
                                    <motion.div
                                        animate={{ rotate: isExpanded ? 90 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronRight size={14} className="text-nord4/30 group-hover:text-nord4/60" />
                                    </motion.div>
                                    <Folder size={14} className="text-nord8/70" />
                                    <span className="text-xs font-medium text-nord4 group-hover:text-nord6 transition-colors truncate">
                                        {folder}
                                    </span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-4 ml-2 border-l border-nord3/10 space-y-0.5"
                                        >
                                            {folderFiles.map(file => {
                                                const filename = file.path.split('/').pop()?.replace('.java', '') || '';
                                                const isSelected = selectedFile?.sha === file.sha;
                                                const isCompleted = completedFiles.includes(file.path);

                                                return (
                                                    <button
                                                        key={file.sha}
                                                        onClick={() => onSelectFile(file)}
                                                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all relative group ${
                                                            isSelected 
                                                                ? 'bg-nord8/10 text-nord8' 
                                                                : 'text-nord4/60 hover:bg-nord3/5 hover:text-nord5'
                                                        }`}
                                                    >
                                                        {isSelected && (
                                                            <motion.div 
                                                                layoutId="active-bg"
                                                                className="absolute inset-0 bg-nord8/10 rounded-lg -z-10 border border-nord8/20"
                                                            />
                                                        )}
                                                        <FileCode size={14} className={isSelected ? 'text-nord8' : 'text-nord4/30 group-hover:text-nord4/50'} />
                                                        <span className="text-[11px] font-mono truncate">{filename}</span>
                                                        
                                                        {isCompleted && (
                                                            <div className="ml-auto">
                                                                <Star size={10} className="text-nord13 fill-nord13" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="p-4 border-t border-nord3/10 bg-nord0/30">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-nord3/30 flex items-center justify-center overflow-hidden border border-nord3/50">
                            <Zap size={16} className="text-nord8" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-nord1" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-nord6 truncate uppercase tracking-wider">Upendhar10</p>
                        <p className="text-[9px] text-nord4/40 truncate">Lvl 42 Architect</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
