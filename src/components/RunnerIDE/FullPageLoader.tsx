'use client';

import React from 'react';
import { Zap, Cpu } from 'lucide-react';

interface FullPageLoaderProps {
    isVisible: boolean;
}

/* 🔥 CENTRAL BRAND CONFIG — EDIT ONLY THIS */
const BRAND = {
    name: 'RUNNER', // ← replace (was VELOCITY)
    tagline: 'EXECUTING CODE PIPELINE', // ← replace
    subTagline: 'Initializing runtime environment', // ← replace
    systemStatus: 'SYSTEM READY', // ← replace
    protocol: 'JUDGE0 ENGINE // RUNTIME CORE', // ← replace
    latency: 'LATENCY: 14ms', // dynamic if needed
};

const FullPageLoader: React.FC<FullPageLoaderProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[10000] bg-[#FDFDFD] overflow-hidden flex flex-col items-center justify-center">

            {/* Background Texture */}
            <div className="absolute inset-0 noise-bg pointer-events-none opacity-[0.03]" />

            {/* Long Fazers Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none w-full h-full">
                <span className="animate-lf" style={{ top: '20%', position: 'absolute', height: '2px', width: '20%', background: '#000', opacity: 0.1, animationDelay: '-5s' }}></span>
                <span className="animate-lf2" style={{ top: '40%', position: 'absolute', height: '2px', width: '20%', background: '#000', opacity: 0.1, animationDelay: '-1s' }}></span>
                <span className="animate-lf3" style={{ top: '60%', position: 'absolute', height: '2px', width: '20%', background: '#000', opacity: 0.1 }}></span>
                <span className="animate-lf4" style={{ top: '80%', position: 'absolute', height: '2px', width: '20%', background: '#000', opacity: 0.1, animationDelay: '-3s' }}></span>
            </div>

            {/* Loader */}
            <div className="relative w-full max-w-2xl h-[400px] flex items-center justify-center">
                <div className="loader absolute top-1/2 left-1/2 -ml-[50px] animate-speeder z-10 transition-transform">
                    <span className="loader-span-main">
                        <span className="animate-fazer1" style={{ width: '30px', height: '1px', background: '#000', position: 'absolute' }}></span>
                        <span className="animate-fazer2" style={{ top: '3px', width: '30px', height: '1px', background: '#000', position: 'absolute' }}></span>
                        <span className="animate-fazer3" style={{ top: '1px', width: '30px', height: '1px', background: '#000', position: 'absolute', animationDelay: '-1s' }}></span>
                        <span className="animate-fazer4" style={{ top: '4px', width: '30px', height: '1px', background: '#000', position: 'absolute', animationDelay: '-1s' }}></span>
                    </span>
                    <div className="relative">
                        <span className="loader-base-span"></span>
                        <div className="loader-face"></div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="z-20 text-center mt-8 space-y-4">
                <h1 className="font-space text-4xl font-bold tracking-tighter text-black uppercase animate-pulse">
                    {BRAND.tagline}
                </h1>

                <p className="font-outfit text-gray-400 font-light tracking-widest uppercase text-xs">
                    {BRAND.subTagline}
                </p>

                {/* Progress */}
                <div className="w-64 h-1 bg-gray-100 rounded-full mx-auto mt-12 overflow-hidden relative">
                    <div className="h-full bg-black w-1/3 animate-runner-progress"></div>
                </div>
            </div>

            {/* Bottom Left */}
            <div className="absolute bottom-12 left-12 flex flex-col items-start space-y-2 opacity-40">
                <div className="flex items-center space-x-2 text-[10px] font-space">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-black">{BRAND.systemStatus}</span>
                </div>

                <div className="text-[10px] font-outfit text-gray-500 uppercase tracking-tighter">
                    {BRAND.protocol}
                </div>
            </div>

            {/* Top Right */}
            <div className="absolute top-12 right-12 text-right opacity-40">
                <Cpu size={24} className="text-black mb-2 ml-auto" />
                <div className="text-[10px] font-space text-black font-bold uppercase tracking-widest">
                    {BRAND.latency}
                </div>
            </div>

            {/* Branding */}
            <div className="absolute top-12 left-12">
                <div className="flex items-center space-x-2 group">
                    <div className="w-8 h-8 bg-black flex items-center justify-center">
                        <Zap size={18} className="text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="font-space text-xl font-bold tracking-tighter text-black">
                        {BRAND.name}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default FullPageLoader;