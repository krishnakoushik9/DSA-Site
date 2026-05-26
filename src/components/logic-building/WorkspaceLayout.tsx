'use client';

import React, { ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { motion } from 'framer-motion';

interface WorkspaceLayoutProps {
    sidebar: ReactNode;
    problem: ReactNode;
    editor: ReactNode;
    console: ReactNode;
    isSidebarVisible: boolean;
    isConsoleVisible: boolean;
}

export default function WorkspaceLayout({
    sidebar,
    problem,
    editor,
    console,
    isSidebarVisible,
    isConsoleVisible
}: WorkspaceLayoutProps) {
    return (
        <div className="h-full w-full flex flex-col bg-nord0 overflow-hidden relative">
            <PanelGroup direction="horizontal">
                {isSidebarVisible && (
                    <>
                        <Panel defaultSize={20} minSize={15} maxSize={30}>
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="h-full"
                            >
                                {sidebar}
                            </motion.div>
                        </Panel>
                        <PanelResizeHandle className="w-1 bg-nord3/20 hover:bg-nord8/50 transition-colors cursor-col-resize relative">
                            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-nord3/40" />
                        </PanelResizeHandle>
                    </>
                )}

                <Panel defaultSize={isSidebarVisible ? 35 : 40} minSize={20}>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full border-r border-nord3/10"
                    >
                        {problem}
                    </motion.div>
                </Panel>

                <PanelResizeHandle className="w-1 bg-nord3/20 hover:bg-nord8/50 transition-colors cursor-col-resize relative">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-nord3/40" />
                </PanelResizeHandle>

                <Panel defaultSize={45} minSize={30}>
                    <PanelGroup direction="vertical">
                        <Panel defaultSize={isConsoleVisible ? 70 : 100} minSize={30}>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="h-full"
                            >
                                {editor}
                            </motion.div>
                        </Panel>

                        {isConsoleVisible && (
                            <>
                                <PanelResizeHandle className="h-1 bg-nord3/20 hover:bg-nord8/50 transition-colors cursor-row-resize relative">
                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-nord3/40" />
                                </PanelResizeHandle>
                                <Panel defaultSize={30} minSize={15}>
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="h-full"
                                    >
                                        {console}
                                    </motion.div>
                                </Panel>
                            </>
                        )}
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
}
