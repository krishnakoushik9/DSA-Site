'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    CalendarDays,
    PenTool,
    GraduationCap,
    User,
    MessageSquare,
    Search,
    Gift,
    Laugh,
    Briefcase,
    BrainCircuit,
} from 'lucide-react';

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

export default function FloatingDock() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-fit max-w-[90vw]"
            role="navigation"
            aria-label="Main Navigation"
        >
            <motion.div
                className="flex items-center gap-1.5 p-2 rounded-[20px] overflow-x-auto overflow-y-hidden hide-scrollbar"
                style={{
                    backgroundColor: 'var(--dock-bg)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.05) inset',
                    backdropFilter: 'blur(6px)',
                    WebkitBackdropFilter: 'blur(6px)',
                }}
            >
                {navItems.map((item, index) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
                    const isHovered = hoveredIndex === index;

                    // Subtle scale for macOS dock feel
                    const distance = hoveredIndex !== null ? Math.abs(hoveredIndex - index) : Infinity;
                    const scale = distance === 0 ? 1.15 : distance === 1 ? 1.05 : 1;

                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            tabIndex={0}
                            className="outline-none"
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onFocus={() => setHoveredIndex(index)}
                            onBlur={() => setHoveredIndex(null)}
                        >
                            <motion.div
                                className="relative flex items-center justify-center h-12 rounded-xl cursor-pointer"
                                style={{ minWidth: 48 }}
                                whileTap={{ scale: 0.95 }}
                                initial={false}
                                animate={{
                                    paddingLeft: isHovered ? 16 : 0,
                                    paddingRight: isHovered ? 16 : 0,
                                    scale: scale,
                                    backgroundColor: isHovered ? 'var(--dock-hover)' : 'transparent',
                                }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            >
                                <motion.div
                                    className="flex-shrink-0 z-10"
                                    animate={{
                                        color: isActive ? 'var(--dock-active)' : 'var(--dock-icon)',
                                        filter: isActive ? 'drop-shadow(0 0 8px var(--dock-active))' : 'none'
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Icon size={20} />
                                </motion.div>

                                <motion.div
                                    className="flex items-center whitespace-nowrap overflow-hidden"
                                    initial={false}
                                    animate={{
                                        width: isHovered ? "auto" : 0,
                                        opacity: isHovered ? 1 : 0,
                                    }}
                                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                >
                                    <span
                                        className="text-sm font-medium ml-2"
                                        style={{ color: 'var(--dock-text)' }}
                                    >
                                        {item.label}
                                    </span>
                                </motion.div>

                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute bottom-1 w-1 h-1 rounded-full"
                                        style={{ backgroundColor: 'var(--dock-active)' }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                    />
                                )}
                            </motion.div>
                        </Link>
                    );
                })}
            </motion.div>
        </div>
    );
}
