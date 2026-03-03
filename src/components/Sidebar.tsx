'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    CalendarDays,
    PenTool,
    ChevronLeft,
    ChevronRight,
    Zap,
    GraduationCap,
    LogOut,
    User,
    MessageSquare,
    Search,
    Gift,
    Laugh,
    Briefcase,
    BrainCircuit,
    Coins,
    ShieldCheck,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/calendar', label: 'Calendar', icon: CalendarDays },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/exams', label: 'Exams', icon: GraduationCap },
    { href: '/workspace', label: 'Workspace', icon: PenTool },
    { href: '/company', label: 'Company Mode', icon: Briefcase },
    { href: '/community', label: 'Community', icon: MessageSquare },
    { href: '/perks', label: 'Perks', icon: Gift },
    { href: '/memes', label: 'Krack Updates', icon: Laugh },
    { href: '/learnings/learn-ai', label: 'Learnings', icon: BrainCircuit },
    { href: '/about', label: 'Profile', icon: User },
];

export default function Sidebar() {
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { username, logout, isSidebarCollapsed, setSidebarCollapsed, credits, isPremium, setPremiumPopupOpen } = useAppStore();

    useEffect(() => { setMounted(true); }, []);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <aside
            className={`fixed left-0 top-0 h-screen z-50 flex flex-col transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
                }`}
            style={{
                backgroundColor: 'color-mix(in srgb, var(--th-nord1) 85%, transparent)',
                backdropFilter: 'blur(24px) saturate(150%)',
                WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                borderRight: '1px solid color-mix(in srgb, var(--th-nord3) 30%, transparent)',
            }}
        >
            {/* Brand */}
            <div className="flex items-center gap-3 px-5 py-6 border-b border-nord3/30">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-nord8 to-nord10 flex items-center justify-center">
                    <Zap size={20} className="text-nord0" />
                </div>
                {!isSidebarCollapsed && (
                    <div className="animate-fade-in-up">
                        <h1 className="text-nord6 font-bold text-lg tracking-tight leading-none">DSA Tracker</h1>
                        <p className="text-nord4/60 text-xs mt-0.5">SRCS</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ease-in-out group ${isActive
                                ? 'bg-nord8/15 text-nord8'
                                : 'text-nord4/70 hover:bg-nord2/50 hover:text-nord5'
                                }`}
                        >
                            <Icon
                                size={20}
                                className={`flex-shrink-0 transition-all duration-300 ${isActive ? 'text-nord8' : 'text-nord4/50 group-hover:text-nord8/70'
                                    }`}
                            />
                            {!isSidebarCollapsed && (
                                <span className="font-medium text-sm whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}
                            {isActive && !isSidebarCollapsed && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-nord8 animate-pulse-glow" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Actions */}
            <div className="px-3 pb-4 space-y-1">
                {mounted && username && !isSidebarCollapsed && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-nord0/40 mb-2">
                        <User size={14} className="text-nord8/50" />
                        <span className="text-xs text-nord4/50 font-medium truncate">@{username}</span>
                        {isPremium && (
                            <ShieldCheck size={12} className="text-amber-400 ml-auto shrink-0" />
                        )}
                    </div>
                )}

                {/* Credit balance chip */}
                {mounted && !isSidebarCollapsed ? (
                    <button
                        onClick={() => setPremiumPopupOpen(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all mb-1 group"
                    >
                        <Coins size={14} className="text-amber-400 shrink-0" />
                        <span className="text-xs font-bold text-amber-300 truncate">{(credits ?? 0).toLocaleString()} credits</span>
                        {isPremium ? (
                            <span className="ml-auto text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-full shrink-0">PRO</span>
                        ) : (
                            <span className="ml-auto text-[9px] text-amber-500/60 group-hover:text-amber-400 transition-colors shrink-0">store →</span>
                        )}
                    </button>
                ) : mounted && isSidebarCollapsed ? (
                    <button
                        onClick={() => setPremiumPopupOpen(true)}
                        title={`${(credits ?? 0)} credits`}
                        className="w-full flex items-center justify-center py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all mb-1"
                    >
                        <Coins size={16} className="text-amber-400" />
                    </button>
                ) : null}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-nord11/50 hover:text-nord11 hover:bg-nord11/10 transition-all duration-300"
                >
                    <LogOut size={16} />
                    {!isSidebarCollapsed && <span className="text-xs font-medium">Logout</span>}
                </button>
                <button
                    onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-nord4/50 hover:text-nord8 hover:bg-nord2/40 transition-all duration-300"
                >
                    {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    {!isSidebarCollapsed && <span className="text-xs font-medium">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
