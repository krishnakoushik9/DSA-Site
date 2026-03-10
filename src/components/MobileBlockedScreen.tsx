'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Smartphone, Apple, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

export default function MobileBlockedScreen() {
    const [email, setEmail] = useState('');
    const [platform, setPlatform] = useState<'android' | 'ios' | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Email is required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (!platform) {
            setError('Please select your platform');
            return;
        }

        setError('');
        setStatus('loading');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setStatus('success');
    };

    return (
        <div className="min-h-[100dvh] bg-nord0 flex items-center justify-center p-6 text-nord4 font-sans select-none overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-[420px] bg-nord1 border border-nord3/30 rounded-[24px] p-8 shadow-2xl relative"
            >
                {/* Background Decor */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-nord8/5 blur-[100px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-nord15/5 blur-[100px] rounded-full" />

                <AnimatePresence mode="wait">
                    {status !== 'success' ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center"
                        >
                            <div className="mb-8 flex flex-col items-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-nord8 to-nord10 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-nord8/20">
                                    <span className="text-nord0 font-extrabold text-2xl">DT</span>
                                </div>
                                <h1 className="text-2xl font-bold text-nord6 mb-2 tracking-tight">DSA Tracker</h1>
                                <p className="text-nord4/70 text-sm leading-relaxed max-w-[280px] mx-auto">
                                    This application is currently optimized for desktop use.
                                    A dedicated mobile app is under development.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 text-left">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-nord4/50 mb-2 ml-1">
                                        Email Address
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-nord3 group-focus-within:text-nord8 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email to get notified"
                                            className="block w-full pl-11 pr-4 py-3 bg-nord0 border border-nord3/30 rounded-xl text-nord6 placeholder-nord3 focus:ring-2 focus:ring-nord8/50 focus:border-nord8 outline-none transition-all text-base"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-nord4/50 mb-2 ml-1">
                                        Platform Selection
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPlatform('android')}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${platform === 'android'
                                                    ? 'bg-nord8/10 border-nord8 text-nord8 scale-[1.02]'
                                                    : 'bg-nord0 border-nord3/30 text-nord4/60 hover:border-nord3'
                                                }`}
                                        >
                                            <Smartphone className="h-4 w-4" />
                                            <span className="font-medium">Android</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPlatform('ios')}
                                            className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${platform === 'ios'
                                                    ? 'bg-nord8/10 border-nord8 text-nord8 scale-[1.02]'
                                                    : 'bg-nord0 border-nord3/30 text-nord4/60 hover:border-nord3'
                                                }`}
                                        >
                                            <Apple className="h-4 w-4" />
                                            <span className="font-medium">iOS</span>
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <motion.p
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-nord11 text-xs font-medium bg-nord11/10 p-2 rounded-lg text-center"
                                    >
                                        {error}
                                    </motion.p>
                                )}

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-nord8 hover:bg-nord7 disabled:bg-nord3 text-nord0 font-bold py-4 rounded-xl shadow-lg shadow-nord8/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                                >
                                    {status === 'loading' ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <>
                                            Notify Me
                                            <ChevronRight className="h-4 w-4" />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-8 text-[11px] text-nord4/40">
                                We will notify you when the mobile version launches.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 text-center"
                        >
                            <div className="w-20 h-20 bg-nord14/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="h-10 w-10 text-nord14" />
                            </div>
                            <h2 className="text-2xl font-bold text-nord6 mb-4">You're on the list!</h2>
                            <p className="text-nord4/70 text-sm leading-relaxed px-4">
                                We'll notify you at <span className="text-nord8 font-medium">{email}</span> when the mobile version launches.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
