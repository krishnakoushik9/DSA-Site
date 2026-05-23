'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Smartphone, Apple, CheckCircle2, ChevronRight, Loader2, Tablet, ShieldCheck, ShieldAlert } from 'lucide-react';
import { APPROVED_DEVICES, ApprovedDevice } from '@/utils/allowlist';
import { toast } from 'react-hot-toast';

export default function MobileBlockedScreen() {
    const [email, setEmail] = useState('');
    const [platform, setPlatform] = useState<'android' | 'ios' | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [error, setError] = useState('');
    const [authorizingKey, setAuthorizingKey] = useState<string | null>(null);
    const [currentUA, setCurrentUA] = useState('');
    const [currentTouchPoints, setCurrentTouchPoints] = useState(0);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setCurrentUA(navigator.userAgent || navigator.vendor || (window as any).opera);
            setCurrentTouchPoints(navigator.maxTouchPoints || 0);
        }
    }, []);

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

    const handleDeviceClick = async (device: ApprovedDevice) => {
        if (authorizingKey) return; // Prevent double click

        // 1. Verify environment matches approved signature
        const isMatch = device.match(currentUA, currentTouchPoints);

        if (!isMatch) {
            toast.error(
                `Authorization Failed! Current browser/device does not match the approved signature for "${device.name}".`,
                {
                    duration: 5000,
                    style: {
                        background: '#2E3440',
                        color: '#BF616A',
                        border: '1px solid rgba(191, 97, 106, 0.2)',
                        borderRadius: '12px',
                    },
                    icon: <ShieldAlert className="h-5 w-5 text-nord11" />
                }
            );
            return;
        }

        // 2. Animate authorization verification
        setAuthorizingKey(device.accessKey);
        const toastId = toast.loading(`Verifying device signature for ${device.name}...`, {
            style: {
                background: '#2E3440',
                color: '#D8DEE9',
                borderRadius: '12px',
            }
        });

        await new Promise(resolve => setTimeout(resolve, 1200));

        // 3. Save to localStorage & notify success
        localStorage.setItem('dsa_tracker_authorized_device', device.accessKey);

        toast.success(`Access Authorized! Welcome back, ${device.name}.`, {
            id: toastId,
            duration: 3000,
            style: {
                background: '#2E3440',
                color: '#A3BE8C',
                border: '1px solid rgba(163, 190, 140, 0.2)',
                borderRadius: '12px',
            },
            icon: <ShieldCheck className="h-5 w-5 text-nord14" />
        });

        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 4. Reload page to let AppShell re-initialize with new auth bypass
        window.location.reload();
    };

    return (
        <div className="min-h-[100dvh] bg-nord0 flex items-center justify-center p-6 text-nord4 font-sans select-none overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-[440px] bg-nord1/90 border border-nord3/30 rounded-[28px] p-6 sm:p-8 shadow-2xl relative my-8 backdrop-blur-md"
            >
                {/* Background Decor */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-nord8/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-nord15/5 blur-[100px] rounded-full pointer-events-none" />

                <AnimatePresence mode="wait">
                    {status !== 'success' ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center"
                        >
                            <div className="mb-6 flex flex-col items-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-nord8 to-nord10 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-nord8/20">
                                    <span className="text-nord0 font-extrabold text-2xl">DT</span>
                                </div>
                                <h1 className="text-2xl font-bold text-nord6 mb-2 tracking-tight">DSA Tracker</h1>
                                <p className="text-nord4/70 text-sm leading-relaxed max-w-[290px] mx-auto">
                                    This application is optimized for larger displays. A mobile experience is currently in experimental review.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-nord4/50 mb-1.5 ml-1">
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
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-nord4/50 mb-1.5 ml-1">
                                        Platform Selection
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setPlatform('android')}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all cursor-pointer ${platform === 'android'
                                                    ? 'bg-nord8/10 border-nord8 text-nord8 scale-[1.02]'
                                                    : 'bg-nord0 border-nord3/30 text-nord4/60 hover:border-nord3'
                                                }`}
                                        >
                                            <Smartphone className="h-4 w-4" />
                                            <span className="font-medium text-sm">Android</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setPlatform('ios')}
                                            className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all cursor-pointer ${platform === 'ios'
                                                    ? 'bg-nord8/10 border-nord8 text-nord8 scale-[1.02]'
                                                    : 'bg-nord0 border-nord3/30 text-nord4/60 hover:border-nord3'
                                                }`}
                                        >
                                            <Apple className="h-4 w-4" />
                                            <span className="font-medium text-sm">iOS</span>
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
                                    className="w-full bg-nord8 hover:bg-nord7 disabled:bg-nord3 text-nord0 font-bold py-3.5 rounded-xl shadow-lg shadow-nord8/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
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

                            {/* Separator line */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-nord3/20"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-nord1 px-3 text-nord4/50 font-bold tracking-wider">
                                        Authorized Test Devices
                                    </span>
                                </div>
                            </div>

                            {/* Approved Devices Allowlist Section */}
                            <div className="space-y-3">
                                {APPROVED_DEVICES.map((device) => {
                                    const isCurrentAuthorizing = authorizingKey === device.accessKey;
                                    const isTouchOrApple = device.name === "Krishna" || device.name === "Internal QA Device";
                                    const DeviceIcon = isTouchOrApple ? Tablet : Smartphone;
                                    
                                    return (
                                        <motion.button
                                            key={device.accessKey}
                                            type="button"
                                            onClick={() => handleDeviceClick(device)}
                                            disabled={!!authorizingKey}
                                            whileHover={{ y: -1, scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className="w-full text-left p-3.5 rounded-xl border border-nord3/20 bg-nord0/40 backdrop-blur-md hover:border-nord8/30 hover:bg-nord8/5 transition-all duration-200 cursor-pointer relative overflow-hidden group flex items-start gap-3"
                                        >
                                            <div className="p-2 rounded-lg bg-nord2 border border-nord3/20 group-hover:border-nord8/30 group-hover:text-nord8 transition-colors shrink-0">
                                                {isCurrentAuthorizing ? (
                                                    <Loader2 className="h-4.5 w-4.5 text-nord8 animate-spin" />
                                                ) : (
                                                    <DeviceIcon className="h-4.5 w-4.5 text-nord4" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-sm text-nord6 group-hover:text-nord8 transition-colors">
                                                        {device.name}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold text-nord4/40 group-hover:text-nord8/40 tracking-wider">
                                                        Bypass Approved
                                                    </span>
                                                </div>
                                                <p className="text-xs text-nord4/60 mt-0.5 truncate">
                                                    {device.device} • <span className="text-nord4/40">{device.browser}</span>
                                                </p>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <p className="mt-6 text-[10px] text-nord4/40">
                                We will notify you when the mobile version officially launches.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-10 text-center"
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
