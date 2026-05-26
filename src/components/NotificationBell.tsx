'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Bell,
    MessageSquare,
    Flame,
    Trophy,
    Zap,
    X,
    Check,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
    loadNotifications,
    markNotificationsRead,
    Notification,
} from '@/lib/firebase';

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
}

const NOTIF_ICONS: Record<string, typeof MessageSquare> = {
    comment: MessageSquare,
    streak: Flame,
    milestone: Trophy,
    system: Zap,
};

const NOTIF_COLORS: Record<string, string> = {
    comment: 'text-nord8 bg-nord8/10',
    streak: 'text-nord12 bg-nord12/10',
    milestone: 'text-nord14 bg-nord14/10',
    system: 'text-nord15 bg-nord15/10',
};

export default function NotificationBell() {
    const { username, isLoggedIn } = useAppStore();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        if (!username || !isLoggedIn) return;
        setLoading(true);
        const data = await loadNotifications(username);
        setNotifications(data);
        setLoading(false);
    }, [username, isLoggedIn]);

    // Poll for notifications every 30 seconds
    useEffect(() => {
        if (!isLoggedIn) return;
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications, isLoggedIn]);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleOpen = async () => {
        setOpen(!open);
        if (!open && unreadCount > 0) {
            // Mark all as read
            await markNotificationsRead(username);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    if (!isLoggedIn) return null;

    return (
        <div className="relative" ref={panelRef} data-tour="notification-bell">
            {/* Bell Button */}
            <button
                onClick={handleOpen}
                className={`relative p-1.5 rounded-lg transition-colors ${open ? 'bg-nord2/30 text-nord8' : 'text-nord4/30 hover:text-nord4/50'
                    }`}
            >
                <Bell size={16} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-nord11 flex items-center justify-center">
                        <span className="text-[8px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-full mt-1.5 w-72 rounded-xl border border-nord3/15 shadow-2xl z-50 overflow-hidden"
                    style={{ backgroundColor: 'rgba(46, 52, 64, 0.95)', backdropFilter: 'blur(20px)' }}
                >
                    <div className="px-3 py-2 border-b border-nord3/10 flex items-center justify-between">
                        <p className="text-xs font-bold text-nord5">Notifications</p>
                        {notifications.length > 0 && (
                            <button onClick={() => setNotifications([])}
                                className="text-[9px] text-nord4/20 hover:text-nord4/40 transition-colors">
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                        {loading && notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <div className="w-4 h-4 border-2 border-nord8 border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                                <p className="text-[10px] text-nord4/20">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="py-8 text-center">
                                <Bell size={20} className="text-nord3/15 mx-auto mb-1" />
                                <p className="text-[10px] text-nord4/15">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.slice(0, 20).map(notif => {
                                const Icon = NOTIF_ICONS[notif.type] || Zap;
                                const colorClass = NOTIF_COLORS[notif.type] || NOTIF_COLORS.system;
                                return (
                                    <div
                                        key={notif.id}
                                        className={`px-3 py-2.5 border-b border-nord3/5 flex gap-2.5 transition-colors ${!notif.read ? 'bg-nord8/3' : ''
                                            }`}
                                    >
                                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                                            <Icon size={11} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] text-nord4/60 leading-snug">{notif.message}</p>
                                            <p className="text-[8px] text-nord4/15 mt-0.5">{timeAgo(notif.createdAt)}</p>
                                        </div>
                                        {!notif.read && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-nord8 flex-shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
