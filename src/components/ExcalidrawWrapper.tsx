'use client';

import { useState } from 'react';
import { Maximize2, Minimize2, ExternalLink } from 'lucide-react';

interface ExcalidrawWrapperProps {
    boardId: string;
    data?: string;
    onSave: (data: string) => void;
}

export default function ExcalidrawWrapper({ boardId }: ExcalidrawWrapperProps) {
    const [fullscreen, setFullscreen] = useState(false);

    return (
        <div
            className={`${fullscreen
                    ? 'fixed inset-0 z-[100] bg-nord0'
                    : 'h-full w-full relative'
                }`}
            style={{ minHeight: fullscreen ? '100vh' : '400px' }}
        >
            {/* Toolbar */}
            <div className="absolute top-2 right-2 z-10 flex gap-1.5">
                <button
                    onClick={() => setFullscreen(!fullscreen)}
                    className="p-1.5 rounded-lg bg-nord1/80 border border-nord3/30 text-nord4/60 hover:text-nord8 transition-colors"
                    style={{ backdropFilter: 'blur(8px)' }}
                    title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                >
                    {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
                <a
                    href="https://excalidraw.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-nord1/80 border border-nord3/30 text-nord4/60 hover:text-nord8 transition-colors"
                    style={{ backdropFilter: 'blur(8px)' }}
                    title="Open in new tab"
                >
                    <ExternalLink size={14} />
                </a>
            </div>

            <iframe
                src="https://excalidraw.com"
                className="w-full h-full rounded-lg border-0"
                style={{
                    minHeight: fullscreen ? '100vh' : '400px',
                    backgroundColor: '#2E3440',
                }}
                title={`Whiteboard - ${boardId}`}
                allow="clipboard-read; clipboard-write"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
            />

            {/* Escape hint in fullscreen */}
            {fullscreen && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-nord1/70 border border-nord3/20 text-[10px] text-nord4/40"
                    style={{ backdropFilter: 'blur(8px)' }}
                >
                    Press the ✕ button to exit fullscreen
                </div>
            )}
        </div>
    );
}
