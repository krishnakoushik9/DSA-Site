'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, AlertTriangle } from 'lucide-react';
import {
    getSupportedLanguages,
    LANGUAGE_LABELS,
} from '@/services/judge0RunnerAPI';

interface RunnerLanguageSelectorProps {
    selectedLanguage: string;
    onLanguageChange: (language: string) => void;
}

export default function RunnerLanguageSelector({
    selectedLanguage,
    onLanguageChange,
}: RunnerLanguageSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showJavaTooltip, setShowJavaTooltip] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const languages = getSupportedLanguages();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
            if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
                setShowJavaTooltip(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isJava = selectedLanguage === 'Java';

    return (
        <div className="flex items-center gap-2">
            <div ref={dropdownRef} className="relative">
                <button
                    id="runner-language-selector"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                        backgroundColor: 'rgba(230, 237, 243, 0.1)',
                        color: '#e6edf3',
                        border: '1px solid rgba(230, 237, 243, 0.2)',
                    }}
                >
                    <span>{LANGUAGE_LABELS[selectedLanguage]}</span>
                    <ChevronDown
                        size={14}
                        className="transition-transform duration-200"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                </button>

                {isOpen && (
                    <div
                        className="absolute top-full left-0 mt-2 py-1 rounded-xl shadow-2xl z-50 min-w-[220px] overflow-hidden"
                        style={{
                            backgroundColor: '#1c2333',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            animation: 'runnerDropdownIn 0.15s ease-out',
                        }}
                    >
                        {languages.map((lang) => {
                            const isSelected = lang === selectedLanguage;
                            return (
                                <button
                                    key={lang}
                                    onClick={() => {
                                        onLanguageChange(lang);
                                        setIsOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between transition-colors duration-150"
                                    style={{
                                        color: isSelected ? '#e6edf3' : '#8b949e',
                                        backgroundColor: isSelected
                                            ? 'rgba(255, 255, 255, 0.08)'
                                            : 'transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                                            e.currentTarget.style.color = '#e6edf3';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = '#8b949e';
                                        }
                                    }}
                                >
                                    <span className="flex items-center gap-2">
                                        {LANGUAGE_LABELS[lang]}
                                        {lang === 'Java' && (
                                            <AlertTriangle size={11} style={{ color: '#f0883e' }} />
                                        )}
                                    </span>
                                    {isSelected && <Check size={14} style={{ color: '#e6edf3' }} />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Java warning indicator */}
            {isJava && (
                <div ref={tooltipRef} className="relative">
                    <button
                        onClick={() => setShowJavaTooltip(!showJavaTooltip)}
                        onMouseEnter={() => setShowJavaTooltip(true)}
                        onMouseLeave={() => setShowJavaTooltip(false)}
                        className="flex items-center justify-center w-6 h-6 rounded-md transition-colors duration-200"
                        style={{
                            backgroundColor: 'rgba(240, 136, 62, 0.12)',
                            color: '#f0883e',
                        }}
                        title='Java programs must use class name "Main"'
                    >
                        <AlertTriangle size={13} />
                    </button>

                    {showJavaTooltip && (
                        <div
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-[280px] rounded-lg p-3 shadow-xl"
                            style={{
                                backgroundColor: '#1c2333',
                                border: '1px solid rgba(240, 136, 62, 0.25)',
                                animation: 'runnerDropdownIn 0.15s ease-out',
                            }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle size={12} style={{ color: '#f0883e' }} />
                                <span className="text-xs font-semibold" style={{ color: '#f0883e' }}>
                                    Java Runner Requirement
                                </span>
                            </div>
                            <p className="text-xs mb-2" style={{ color: '#8b949e' }}>
                                The main class must be named <code className="px-1 py-0.5 rounded text-[10px]" style={{ backgroundColor: '#21262d', color: '#e6edf3' }}>Main</code> for execution.
                            </p>
                            <pre
                                className="text-[10px] leading-relaxed p-2 rounded"
                                style={{
                                    backgroundColor: '#0d1117',
                                    color: '#8b949e',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    border: '1px solid #21262d',
                                }}
                            >
                                {`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}`}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
