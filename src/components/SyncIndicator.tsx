'use client';

import { useAppStore, SyncStatus } from '@/store/useAppStore';
import { Cloud, CloudOff, Check, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SyncIndicator() {
    const { syncStatus, isLoggedIn, username, lastSyncedAt } = useAppStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isLoggedIn) return null;

    const statusConfig: Record<SyncStatus, { icon: React.ReactNode; text: string; color: string; glow: string }> = {
        idle: {
            icon: <Cloud size={14} />,
            text: 'Saved locally',
            color: 'text-nord4/40',
            glow: '',
        },
        syncing: {
            icon: <Loader2 size={14} className="animate-spin" />,
            text: 'Syncing to cloud...',
            color: 'text-nord8',
            glow: 'shadow-[0_0_10px_rgba(136,192,208,0.3)]',
        },
        synced: {
            icon: <Check size={14} />,
            text: 'Synced to cloud',
            color: 'text-nord14',
            glow: 'shadow-[0_0_10px_rgba(163,190,140,0.3)]',
        },
        error: {
            icon: <AlertCircle size={14} />,
            text: 'Sync failed',
            color: 'text-nord11',
            glow: 'shadow-[0_0_10px_rgba(191,97,106,0.3)]',
        },
    };

    const config = statusConfig[syncStatus];

    return (
        <div
            data-tour="sync-indicator"
            className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-500 ${config.glow}
        ${syncStatus === 'syncing' ? 'bg-nord1/90 border-nord8/30' :
                    syncStatus === 'synced' ? 'bg-nord1/90 border-nord14/30' :
                        syncStatus === 'error' ? 'bg-nord1/90 border-nord11/30' :
                            'bg-nord1/60 border-nord3/20'}
      `}
            style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}
        >
            <span className={`${config.color} transition-colors duration-300`}>
                {config.icon}
            </span>
            <span className={`text-xs font-medium ${config.color} transition-colors duration-300`}>
                {config.text}
            </span>
            {username && (
                <span className="text-[10px] text-nord4/20 ml-1">
                    @{username}
                </span>
            )}
        </div>
    );
}
