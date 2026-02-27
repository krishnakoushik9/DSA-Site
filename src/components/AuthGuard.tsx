'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const { isLoggedIn } = useAppStore();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isLoggedIn && pathname !== '/login' && pathname !== '/') {
            router.replace('/login');
        }
    }, [mounted, isLoggedIn, pathname, router]);

    if (!mounted) {
        return (
            <div className="min-h-screen bg-nord0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-nord8 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
