'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Layout, 
    Terminal, 
    Eye, 
    Maximize2, 
    PenTool, 
    Timer, 
    Coffee, 
    HelpCircle,
    Command
} from 'lucide-react';

interface TaskbarProps {
    isSidebarVisible: boolean;
    setSidebarVisible: (v: boolean) => void;
    isConsoleVisible: boolean;
    setConsoleVisible: (v: boolean) => void;
    currentMode: 'zen' | 'focus' | 'normal';
    setMode: (m: 'zen' | 'focus' | 'normal') => void;
    onToggleNotes: () => void;
}

export default function Taskbar({
    isSidebarVisible,
    setSidebarVisible,
    isConsoleVisible,
    setConsoleVisible,
    currentMode,
    setMode,
    onToggleNotes
}: TaskbarProps) {
    const items = [
        { 
            icon: Layout, 
            label: 'Sidebar', 
            active: isSidebarVisible, 
            onClick: () => setSidebarVisible(!isSidebarVisible),
            shortcut: '⌘B'
        },
        { 
            icon: Terminal, 
            label: 'Console', 
            active: isConsoleVisible, 
            onClick: () => setConsoleVisible(!isConsoleVisible),
            shortcut: '⌘J'
        },
        { 
            icon: Eye, 
            label: 'Focus', 
            active: currentMode === 'focus', 
            onClick: () => setMode(currentMode === 'focus' ? 'normal' : 'focus'),
            shortcut: '⌘F'
        },
        { 
            icon: Maximize2, 
            label: 'Zen', 
            active: currentMode === 'zen', 
            onClick: () => setMode(currentMode === 'zen' ? 'normal' : 'zen'),
            shortcut: '⌘Z'
        },
        { 
            icon: PenTool, 
            label: 'Notes', 
            active: false, 
            onClick: onToggleNotes,
            shortcut: '⌘N'
        },
        { 
            icon: Timer, 
            label: 'Deep Work', 
            active: false, 
            onClick: () => {},
            shortcut: '⌘D'
        },
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
            <motion.div 
                layout
                className="flex items-center gap-1.5 p-2 bg-nord1/80 backdrop-blur-xl border border-white/10 rounded-[24px] shadow-2xl"
                style={{
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)'
                }}
            >
                {/* Command Palette Trigger */}
                <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-nord8/20 hover:bg-nord8/30 text-nord8 transition-all group border border-nord8/20">
                    <Command size={18} className="group-hover:scale-110 transition-transform" />
                </button>

                <div className="w-[1px] h-6 bg-white/10 mx-1" />

                {items.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={index} className="relative group">
                            <motion.button
                                whileHover={{ scale: 1.1, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={item.onClick}
                                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                                    item.active 
                                        ? 'bg-white/10 text-nord6 shadow-inner' 
                                        : 'text-nord4/50 hover:bg-white/5 hover:text-nord6'
                                }`}
                            >
                                <Icon size={20} />
                                {item.active && (
                                    <motion.div 
                                        layoutId="taskbar-dot"
                                        className="absolute -bottom-1.5 w-1 h-1 bg-nord8 rounded-full shadow-[0_0_8px_var(--th-nord8)]"
                                    />
                                )}
                            </motion.button>
                            
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-nord0/90 backdrop-blur-md border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-2 group-hover:translate-y-0 min-w-max">
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-bold text-nord6 uppercase tracking-widest">{item.label}</span>
                                    <span className="text-[9px] font-mono text-nord4/30">{item.shortcut}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="w-[1px] h-6 bg-white/10 mx-1" />

                <button className="flex items-center justify-center w-10 h-10 rounded-xl text-nord4/30 hover:text-nord6 hover:bg-white/5 transition-all">
                    <Coffee size={18} />
                </button>
                <button className="flex items-center justify-center w-10 h-10 rounded-xl text-nord4/30 hover:text-nord6 hover:bg-white/5 transition-all">
                    <HelpCircle size={18} />
                </button>
            </motion.div>
        </div>
    );
}
