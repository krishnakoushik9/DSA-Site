'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function RootPage() {
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (isLoggedIn) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [mounted, isLoggedIn, router]);

  return (
    <div className="min-h-screen bg-nord0 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-nord8 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
