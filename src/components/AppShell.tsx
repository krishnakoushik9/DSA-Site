'use client';

import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import FloatingDock from '@/components/navigation/FloatingDock';
import SyncIndicator from '@/components/SyncIndicator';
import NotificationBell from '@/components/NotificationBell';
import ThemeToggle from '@/components/ThemeToggle';
import PomodoroWidget from '@/components/PomodoroWidget';
import AuthGuard from '@/components/AuthGuard';
import PremiumPopup from '@/components/PremiumPopup';
import LearnAIPopup from '@/components/LearnAIPopup';
import MobileBlockedScreen from '@/components/MobileBlockedScreen';
import { isMobile as checkIsMobile } from '@/utils/isMobile';
import { useEffect, useState } from 'react';

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isLoggedIn } = useAppStore();
    const [mounted, setMounted] = useState(false);
    const [isMobileDevice, setIsMobileDevice] = useState(false);

    useEffect(() => {
        // 1. Device Detection
        const handleResize = () => {
            setIsMobileDevice(checkIsMobile());
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobileDevice) {
            setMounted(true);
            return;
        }

        // 2. Data Safety: Auto-load from cloud if logged in but not ready
        const state = useAppStore.getState();
        if (state.isLoggedIn && !state._cloudReady && state.username) {
            state.loadFromCloud();
        }

        // 3. Disable Right Click
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();

        // 4. Disable DevTools Shortcuts
        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable F12
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            // Disable Ctrl+U (View Source)
            if (e.ctrlKey && e.key === 'u') {
                e.preventDefault();
                return false;
            }
            // Disable Ctrl+Shift+I, J, C (Inspect/Console/Element)
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
                e.preventDefault();
                return false;
            }
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        setMounted(true);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMobileDevice]);

    // If we detected a mobile device, show the blocked screen
    if (mounted && isMobileDevice) {
        return <MobileBlockedScreen />;
    }

    // Login page and root redirect — no sidebar
    const isAuthPage = pathname === '/login' || pathname === '/';
    const isRunnerPage = pathname === '/runner';

    if (!mounted) {
        return (
            <div className="min-h-screen bg-nord0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-nord8 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <AuthGuard>
            <div className="flex min-h-screen relative overflow-hidden">
                <main className="flex-1 w-full transition-all duration-300 relative min-w-0 overflow-hidden pb-[120px]">
                    <div className="absolute top-2 right-2 lg:right-4 z-50">
                        <ThemeToggle />
                    </div>
                    <div className="absolute top-6 right-16 lg:right-20 z-40 flex items-center gap-2">
                        <NotificationBell />
                        <SyncIndicator />
                    </div>
                    <div className="w-full max-w-[1400px] mx-auto p-6 lg:p-8 overflow-hidden">
                        {children}
                    </div>
                </main>
                {!isRunnerPage && <PomodoroWidget />}
                <FloatingDock />
            </div>
            <PremiumPopup />
            <LearnAIPopup />
        </AuthGuard>
    );
}
