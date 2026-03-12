'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
    Play,
    Zap,
    AlertTriangle,
    RotateCcw,
    ChevronDown,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    Lock,
    Unlock,
    Construction,
    AlignLeft
} from 'lucide-react';
import RunnerEditor from './RunnerEditor';
import RunnerConsole from './RunnerConsole';
import RunnerLanguageSelector from './RunnerLanguageSelector';
import {
    executeCode,
    LANGUAGE_MAP,
    LANGUAGE_TEMPLATES,
} from '@/services/judge0RunnerAPI';
import { useAppStore } from '@/store/useAppStore';
import { saveCodeToHistory, loadCodeHistory, SavedCode } from '@/lib/firebase';
import { toast } from 'react-hot-toast'; // Assuming react-hot-toast is available based on professional aesthetic

export interface TestCase {
    id: number;
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    passed?: boolean;
    status: 'pending' | 'running' | 'done';
    executionTime?: string | null;
}

interface RunHistoryEntry {
    id: number;
    language: string;
    status: string;
    success: boolean;
    time: string | null;
    timestamp: Date;
}

export default function RunnerIDE() {
    const [language, setLanguage] = useState('Python');
    const [code, setCode] = useState(LANGUAGE_TEMPLATES['Python']);
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
    const [executionTime, setExecutionTime] = useState<string | null>(null);
    const [memory, setMemory] = useState<number | null>(null);
    const [statusDescription, setStatusDescription] = useState('');
    const [showDevPopup, setShowDevPopup] = useState(true);
    const [hasRun, setHasRun] = useState(false);

    // AI Test Case state
    const [isGeneratingTests, setIsGeneratingTests] = useState(false);
    const [testCases, setTestCases] = useState<TestCase[]>([]);

    // Custom Input
    const [customInput, setCustomInput] = useState('');
    const [isInputOpen, setIsInputOpen] = useState(false);

    // Java banner
    const [showJavaBanner, setShowJavaBanner] = useState(false);
    const javaBannerTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Execution history
    const [runHistory, setRunHistory] = useState<RunHistoryEntry[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const historyRef = useRef<HTMLDivElement>(null);
    const runCountRef = useRef(0);

    const { username } = useAppStore();

    // Firebase Saved Codes
    const [savedCodes, setSavedCodes] = useState<SavedCode[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [showSavedHistory, setShowSavedHistory] = useState(false);

    // Persistence: Load from LocalStorage
    useEffect(() => {
        const savedLang = localStorage.getItem('runner-language');
        const savedCode = localStorage.getItem('runner-code');

        if (savedLang && LANGUAGE_TEMPLATES[savedLang]) {
            setLanguage(savedLang);
        }
        if (savedCode) {
            setCode(savedCode);
        }
    }, []);

    // Persistence: Save to LocalStorage on change
    useEffect(() => {
        localStorage.setItem('runner-language', language);
        localStorage.setItem('runner-code', code);
    }, [language, code]);

    // Load Firebase History
    const fetchHistory = useCallback(async () => {
        if (!username) return;
        setIsLoadingHistory(true);
        const history = await loadCodeHistory(username);
        setSavedCodes(history);
        setIsLoadingHistory(false);
    }, [username]);

    useEffect(() => {
        if (showSavedHistory) {
            fetchHistory();
        }
    }, [showSavedHistory, fetchHistory]);

    // Save to Firebase (Ctrl+S)
    const handleSaveToFirebase = useCallback(async () => {
        if (!username) {
            toast.error('Please login to save your code');
            return;
        }

        const toastId = toast.loading('Saving to cloud...');

        try {
            // Get IP
            let ip = 'Unknown';
            try {
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipRes.json();
                ip = ipData.ip;
            } catch (e) {
                console.warn('Could not fetch IP', e);
            }

            const savedCode: SavedCode = {
                id: `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                username,
                code,
                language,
                result: statusDescription || 'Not executed',
                timestamp: new Date().toISOString(),
                deviceIp: ip,
            };

            const success = await saveCodeToHistory(savedCode);
            if (success) {
                toast.success('Code saved to history!', { id: toastId });
                fetchHistory();
            } else {
                toast.error('Failed to save code. Try again.', { id: toastId });
            }
        } catch (err) {
            toast.error('An error occurred while saving.', { id: toastId });
        }
    }, [username, code, language, statusDescription, fetchHistory]);

    // Handle language change → update editor + load template
    const handleLanguageChange = useCallback(
        (newLang: string) => {
            setLanguage(newLang);

            // Show Java banner
            if (newLang === 'Java') {
                setShowJavaBanner(true);
                if (javaBannerTimerRef.current) clearTimeout(javaBannerTimerRef.current);
                javaBannerTimerRef.current = setTimeout(() => setShowJavaBanner(false), 4000);
            } else {
                setShowJavaBanner(false);
            }

            // Only load template if current code is a default template or empty
            const isDefaultCode = Object.values(LANGUAGE_TEMPLATES).some(
                (t) => t.trim() === code.trim()
            );
            if (!code.trim() || isDefaultCode) {
                setCode(LANGUAGE_TEMPLATES[newLang] || '');
            }
        },
        [code]
    );

    // Reset template
    const handleResetTemplate = useCallback(() => {
        setCode(LANGUAGE_TEMPLATES[language] || '');
    }, [language]);

    // Clear output
    const handleClearOutput = useCallback(() => {
        setOutput('');
        setIsSuccess(null);
        setExecutionTime(null);
        setMemory(null);
        setStatusDescription('');
    }, []);

    // Run code
    const handleRunCode = useCallback(async () => {
        if (isRunning || isGeneratingTests) return;

        setIsRunning(true);
        setHasRun(true);
        setOutput('');
        setIsSuccess(null);
        setExecutionTime(null);
        setMemory(null);
        setStatusDescription('');
        setTestCases([]);

        const languageId = LANGUAGE_MAP[language];

        // If custom input explicitly provided, run as sandbox once
        if (customInput.trim()) {
            try {
                const result = await executeCode(code, languageId, customInput);

                setOutput(result.output);
                setIsSuccess(result.success);
                setExecutionTime(result.executionTime);
                setMemory(result.memory);
                setStatusDescription(result.statusDescription);

                runCountRef.current += 1;
                const entry: RunHistoryEntry = {
                    id: runCountRef.current,
                    language,
                    status: result.statusDescription,
                    success: result.success,
                    time: result.executionTime,
                    timestamp: new Date(),
                };
                setRunHistory((prev) => [entry, ...prev].slice(0, 5));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
                setOutput(`Connection Error:\n${errorMessage}\n\nPlease check if the execution server is running.`);
                setIsSuccess(false);
                setStatusDescription('Connection Error');
            } finally {
                setIsRunning(false);
            }
            return;
        }

        // AI Testing Mode
        setIsGeneratingTests(true);
        setStatusDescription('Generating AI Test Cases...');
        try {
            const res = await fetch('/api/generate-testcases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language })
            });

            if (!res.ok) {
                if (res.status === 429) throw new Error('RESOURCE_EXHAUSTED');
                throw new Error('Failed to generate test cases');
            }
            const data = await res.json();

            if (data.error === 'RESOURCE_EXHAUSTED') throw new Error('RESOURCE_EXHAUSTED');
            if (data.error) throw new Error(data.error);

            let aiCases: any[] = data.testCases;
            if (!aiCases || aiCases.length === 0) {
                throw new Error('STATIC_CODE');
            }

            // Limit to max 12
            aiCases = aiCases.slice(0, 12).map((tc, idx) => ({ ...tc, id: idx + 1, status: 'pending' }));
            setTestCases(aiCases as TestCase[]);
            setStatusDescription('Executing Test Cases...');

            let allPassed = true;
            let totalTime = 0;
            let maxMemory = 0;

            for (let i = 0; i < aiCases.length; i++) {
                setTestCases(prev => prev.map((tc, idx) => idx === i ? { ...tc, status: 'running' } : tc));
                const tcResult = await executeCode(code, languageId, aiCases[i].input);

                const passed = tcResult.success && (tcResult.output.trim() === String(aiCases[i].expectedOutput).trim());
                if (!passed) allPassed = false;

                totalTime += parseFloat(tcResult.executionTime || '0');
                if ((tcResult.memory || 0) > maxMemory) maxMemory = tcResult.memory || 0;

                setTestCases(prev => prev.map((tc, idx) => idx === i ? {
                    ...tc,
                    status: 'done',
                    actualOutput: tcResult.output,
                    passed,
                    executionTime: tcResult.executionTime
                } : tc));
            }

            setIsSuccess(allPassed);
            setStatusDescription(allPassed ? 'All Test Cases Passed!' : 'Some Test Cases Failed');
            setExecutionTime(totalTime.toFixed(3));
            setMemory(maxMemory);

            runCountRef.current += 1;
            const entry: RunHistoryEntry = {
                id: runCountRef.current,
                language,
                status: allPassed ? 'Accepted' : 'Failed Tests',
                success: allPassed,
                time: totalTime.toFixed(3),
                timestamp: new Date(),
            };
            setRunHistory((prev) => [entry, ...prev].slice(0, 5));

        } catch (err: any) {
            // Silently revert to standard mode if static code or exhausted API limits
            if (err.message !== 'STATIC_CODE' && err.message !== 'RESOURCE_EXHAUSTED') {
                console.error(err);
                setStatusDescription('Failed to generate dynamic tests. Running normally...');
            } else {
                setStatusDescription('');
            }

            try {
                const result = await executeCode(code, languageId);
                setOutput(result.output);
                setIsSuccess(result.success);
                setExecutionTime(result.executionTime);
                setMemory(result.memory);
                setStatusDescription(result.statusDescription);

                runCountRef.current += 1;
                const entry: RunHistoryEntry = {
                    id: runCountRef.current,
                    language,
                    status: result.statusDescription,
                    success: result.success,
                    time: result.executionTime,
                    timestamp: new Date(),
                };
                setRunHistory((prev) => [entry, ...prev].slice(0, 5));
            } catch (fallbackErr: any) {
                setOutput(`Connection Error:\n${fallbackErr.message}\n\nPlease check if the execution server is running.`);
                setIsSuccess(false);
                setStatusDescription('Connection Error');
            }
        } finally {
            setIsGeneratingTests(false);
            setIsRunning(false);
        }
    }, [code, language, isRunning, isGeneratingTests, customInput]);

    // Global Ctrl+Enter and Ctrl+L listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleRunCode();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
                e.preventDefault();
                handleClearOutput();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveToFirebase();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleRunCode, handleClearOutput]);

    // Close history dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
                setShowHistory(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup java banner timer
    useEffect(() => {
        return () => {
            if (javaBannerTimerRef.current) clearTimeout(javaBannerTimerRef.current);
        };
    }, []);

    // Run button label
    const runButtonLabel = isRunning ? 'Running...' : hasRun ? 'Run Again' : 'Run Code';
    const RunButtonIcon = isRunning ? Loader2 : hasRun ? RotateCcw : Play;

    return (
        <>
            {/* ── Developer Preview Popup ── */}
            {showDevPopup && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                    }}
                >
                    <div
                        className="relative max-w-md w-full mx-4 rounded-2xl p-8 shadow-2xl"
                        style={{
                            backgroundColor: '#161b22',
                            border: '1px solid rgba(124, 58, 237, 0.3)',
                            animation: 'runnerPopupIn 0.3s ease-out',
                        }}
                    >
                        {/* Glow accent */}
                        <div
                            className="absolute -top-px left-1/2 -translate-x-1/2 w-32 h-[2px] rounded-full"
                            style={{
                                background:
                                    'linear-gradient(90deg, transparent, rgba(230, 237, 243, 0.4), transparent)',
                            }}
                        />

                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: 'rgba(230, 237, 243, 0.1)' }}
                            >
                                <AlertTriangle size={20} style={{ color: '#e6edf3' }} />
                            </div>
                            <div>
                                <h2
                                    className="text-lg font-bold"
                                    style={{ color: '#e6edf3' }}
                                >
                                    Developer Preview
                                </h2>
                                <span
                                    className="text-[10px] uppercase tracking-widest font-semibold"
                                    style={{ color: '#8b949e' }}
                                >
                                    Beta
                                </span>
                            </div>
                        </div>

                        <p
                            className="text-sm leading-relaxed mb-6"
                            style={{ color: '#8b949e' }}
                        >
                            Runner is currently in development phase.
                            <br />
                            Unlimited runs are temporarily enabled for testing.
                        </p>

                        <button
                            id="runner-dev-preview-continue"
                            onClick={() => setShowDevPopup(false)}
                            className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300"
                            style={{
                                background: '#e6edf3',
                                color: '#0d1117',
                                boxShadow: '0 4px 20px rgba(255, 255, 255, 0.1)',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow =
                                    '0 6px 30px rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow =
                                    '0 4px 20px rgba(255, 255, 255, 0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* ── Main IDE Layout ── */}
            <div
                className="flex flex-col h-full overflow-hidden rounded-xl"
                style={{
                    backgroundColor: '#0d1117',
                    border: '1px solid #21262d',
                    fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
                }}
            >
                {/* ── Top Navigation Bar ── */}
                <div
                    className="flex items-center justify-between px-4 py-2.5 shrink-0"
                    style={{
                        backgroundColor: '#161b22',
                        borderBottom: '1px solid #21262d',
                    }}
                >
                    {/* Left: Brand + Language Selector + Java warning + Reset */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Zap size={16} style={{ color: '#e6edf3' }} />
                            <span
                                className="text-sm font-bold tracking-wide"
                                style={{ color: '#e6edf3' }}
                            >
                                Runner
                            </span>
                        </div>

                        <div
                            className="w-px h-5"
                            style={{ backgroundColor: '#21262d' }}
                        />

                        <RunnerLanguageSelector
                            selectedLanguage={language}
                            onLanguageChange={handleLanguageChange}
                        />

                        {/* Reset Template Button */}
                        <button
                            id="runner-reset-template"
                            onClick={handleResetTemplate}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] transition-all duration-200"
                            style={{ color: '#484f58' }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#e6edf3';
                                e.currentTarget.style.backgroundColor =
                                    'rgba(255,255,255,0.06)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#484f58';
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title="Reset to default template"
                        >
                            <RotateCcw size={12} />
                            <span>Reset</span>
                        </button>
                    </div>

                    {/* Right: DEV badge + History + Run Button */}
                    <div className="flex items-center gap-3">
                        {/* DEV MODE Badge */}
                        <div
                            className="relative group"
                            title="Runner is currently in development phase. Unlimited executions are temporarily allowed. Rate limits will be introduced later."
                        >
                            <div
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-default"
                                style={{
                                    backgroundColor: 'rgba(230, 237, 243, 0.1)',
                                    color: '#e6edf3',
                                    border: '1px solid rgba(230, 237, 243, 0.2)',
                                }}
                            >
                                <Zap size={10} />
                                <span>Dev Mode</span>
                            </div>
                        </div>

                        {/* Execution History */}
                        {runHistory.length > 0 && (
                            <div ref={historyRef} className="relative">
                                <button
                                    id="runner-history-toggle"
                                    onClick={() => setShowHistory(!showHistory)}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all duration-200"
                                    style={{
                                        color: '#8b949e',
                                        backgroundColor: showHistory
                                            ? 'rgba(255,255,255,0.06)'
                                            : 'transparent',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor =
                                            'rgba(255,255,255,0.06)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!showHistory) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    <Clock size={12} />
                                    <span>Recent</span>
                                    <ChevronDown
                                        size={10}
                                        style={{
                                            transform: showHistory
                                                ? 'rotate(180deg)'
                                                : 'rotate(0deg)',
                                            transition: 'transform 0.2s',
                                        }}
                                    />
                                </button>

                                {showHistory && (
                                    <div
                                        className="absolute top-full right-0 mt-2 py-1 rounded-xl shadow-2xl z-50 w-[260px] overflow-hidden"
                                        style={{
                                            backgroundColor: '#1c2333',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            animation: 'runnerDropdownIn 0.15s ease-out',
                                        }}
                                    >
                                        <div
                                            className="px-3 py-2 text-[10px] uppercase tracking-widest font-semibold"
                                            style={{
                                                color: '#484f58',
                                                borderBottom: '1px solid #21262d',
                                            }}
                                        >
                                            Recent Runs
                                        </div>
                                        {runHistory.map((entry) => (
                                            <div
                                                key={entry.id}
                                                className="flex items-center justify-between px-3 py-2 text-xs"
                                                style={{
                                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {entry.success ? (
                                                        <CheckCircle2
                                                            size={11}
                                                            style={{ color: '#3fb950' }}
                                                        />
                                                    ) : (
                                                        <XCircle
                                                            size={11}
                                                            style={{ color: '#f85149' }}
                                                        />
                                                    )}
                                                    <span style={{ color: '#e6edf3' }}>
                                                        Run #{entry.id}
                                                    </span>
                                                    <span style={{ color: '#484f58' }}>—</span>
                                                    <span
                                                        style={{
                                                            color: entry.success ? '#3fb950' : '#f85149',
                                                        }}
                                                    >
                                                        {entry.status}
                                                    </span>
                                                </div>
                                                {entry.time && (
                                                    <span style={{ color: '#484f58' }}>
                                                        {entry.time}s
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Saved History */}
                        <div className="relative">
                            <button
                                onClick={() => setShowSavedHistory(!showSavedHistory)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-all duration-200"
                                style={{
                                    color: '#8b949e',
                                    backgroundColor: showSavedHistory
                                        ? 'rgba(255,255,255,0.06)'
                                        : 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        'rgba(255,255,255,0.06)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!showSavedHistory) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <Lock size={12} className={username ? 'text-nord14' : 'text-nord11'} />
                                <span>Cloud Saver</span>
                                <ChevronDown
                                    size={10}
                                    style={{
                                        transform: showSavedHistory
                                            ? 'rotate(180deg)'
                                            : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                    }}
                                />
                            </button>

                            {showSavedHistory && (
                                <div
                                    className="absolute top-full right-0 mt-2 py-1 rounded-xl shadow-2xl z-50 w-[320px] overflow-hidden"
                                    style={{
                                        backgroundColor: '#1c2333',
                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                        animation: 'runnerDropdownIn 0.15s ease-out',
                                    }}
                                >
                                    <div
                                        className="px-3 py-2 text-[10px] uppercase tracking-widest font-semibold flex justify-between items-center"
                                        style={{
                                            color: '#484f58',
                                            borderBottom: '1px solid #21262d',
                                        }}
                                    >
                                        <span>Cloud Sync History</span>
                                        {isLoadingHistory && <Loader2 size={10} className="animate-spin" />}
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {!username ? (
                                            <div className="p-4 text-center text-xs text-nord11">
                                                Please login to view cloud history.
                                            </div>
                                        ) : savedCodes.length === 0 && !isLoadingHistory ? (
                                            <div className="p-4 text-center text-xs text-nord3">
                                                No saved codes found. Press Ctrl+S to save.
                                            </div>
                                        ) : (
                                            savedCodes.map((entry) => (
                                                <div
                                                    key={entry.id}
                                                    onClick={() => {
                                                        if (confirm('Load this code? Current code will be overwritten.')) {
                                                            setCode(entry.code);
                                                            setLanguage(entry.language);
                                                            setShowSavedHistory(false);
                                                        }
                                                    }}
                                                    className="group flex flex-col px-3 py-2.5 hover:bg-white/[0.03] cursor-pointer transition-colors border-bottom border-white/[0.02]"
                                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[11px] font-bold text-nord4/90 flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-nord14" />
                                                            {entry.language}
                                                        </span>
                                                        <span className="text-[9px] text-nord3 font-mono">
                                                            {new Date(entry.timestamp).toLocaleString([], {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-nord3 truncate mb-1">
                                                        {entry.result}
                                                    </div>
                                                    <div className="text-[9px] text-nord3/40 flex items-center gap-1">
                                                        <AlignLeft size={8} />
                                                        IP: {entry.deviceIp}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Shortcut hint */}
                        <span
                            className="text-[10px] hidden lg:inline"
                            style={{ color: '#30363d' }}
                        >
                            Ctrl+Enter
                        </span>

                        {/* Run Button */}
                        <button
                            id="runner-run-code"
                            onClick={handleRunCode}
                            disabled={isRunning}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                            style={{
                                background: isRunning
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : '#e6edf3',
                                color: isRunning ? '#8b949e' : '#0d1117',
                                boxShadow: isRunning
                                    ? 'none'
                                    : '0 2px 12px rgba(230, 237, 243, 0.2)',
                                cursor: isRunning ? 'not-allowed' : 'pointer',
                                opacity: isRunning ? 0.7 : 1,
                            }}
                            onMouseEnter={(e) => {
                                if (!isRunning) {
                                    e.currentTarget.style.boxShadow =
                                        '0 4px 20px rgba(230, 237, 243, 0.4)';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isRunning) {
                                    e.currentTarget.style.boxShadow =
                                        '0 2px 12px rgba(230, 237, 243, 0.2)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            <RunButtonIcon
                                size={14}
                                className={isRunning ? 'animate-spin' : ''}
                                fill={
                                    !isRunning && !hasRun ? 'currentColor' : 'transparent'
                                }
                            />
                            {runButtonLabel}
                        </button>
                    </div>
                </div>

                {/* ── Java Banner ── */}
                {showJavaBanner && (
                    <div
                        className="flex items-center gap-2 px-4 py-2 shrink-0"
                        style={{
                            backgroundColor: 'rgba(240, 136, 62, 0.08)',
                            borderBottom: '1px solid rgba(240, 136, 62, 0.15)',
                            animation: 'runnerDropdownIn 0.2s ease-out',
                        }}
                    >
                        <AlertTriangle size={13} style={{ color: '#f0883e' }} />
                        <span className="text-xs font-semibold" style={{ color: '#f0883e' }}>
                            Java Runner Requirement
                        </span>
                        <span className="text-xs" style={{ color: '#8b949e' }}>
                            — The main class must be named{' '}
                            <code
                                className="px-1 py-0.5 rounded text-[10px]"
                                style={{
                                    backgroundColor: '#21262d',
                                    color: '#e6edf3',
                                }}
                            >
                                Main
                            </code>{' '}
                            for execution.
                        </span>
                    </div>
                )}

                {/* ── Split Pane: Editor + Console ── */}
                <div className="flex flex-1 min-h-0 overflow-hidden">
                    {/* Left: Editor + Stdin panel */}
                    <div
                        className="flex-[7] min-w-0 flex flex-col overflow-hidden"
                        style={{ borderRight: '1px solid #21262d' }}
                    >
                        {/* Code Editor */}
                        <div className="flex-1 min-h-0 overflow-hidden relative">
                            <RunnerEditor
                                code={code}
                                language={language}
                                onCodeChange={setCode}
                                onRun={handleRunCode}
                                onClearOutput={handleClearOutput}
                            />
                            {isRunning && (
                                <div
                                    className="absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
                                >
                                    <div
                                        className="px-4 py-2.5 rounded-xl backdrop-blur-sm shadow-xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200"
                                        style={{
                                            backgroundColor: 'rgba(22, 27, 34, 0.85)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                        }}
                                    >
                                        <Loader2 size={16} className="animate-spin" style={{ color: '#8b949e' }} />
                                        <span className="text-sm font-medium tracking-wide" style={{ color: '#e6edf3' }}>
                                            Running your program...
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Custom Input (stdin) Panel */}
                        <div
                            className="shrink-0 flex flex-col transition-all duration-300 ease-in-out"
                            style={{
                                backgroundColor: '#161b22',
                                borderTop: '1px solid #21262d',
                            }}
                        >
                            {/* Toggle Header */}
                            <button
                                onClick={() => setIsInputOpen(!isInputOpen)}
                                className="px-4 py-2.5 flex items-center justify-between w-full hover:bg-[rgba(255,255,255,0.02)] transition-colors duration-200"
                            >
                                <div className="flex items-center gap-2">
                                    <AlignLeft size={14} style={{ color: isInputOpen ? '#e6edf3' : '#8b949e' }} />
                                    <span
                                        className="text-xs font-semibold tracking-wider transition-colors duration-200"
                                        style={{ color: isInputOpen ? '#e6edf3' : '#8b949e' }}
                                    >
                                        Custom Input (stdin)
                                    </span>
                                </div>
                                <ChevronDown
                                    size={14}
                                    style={{
                                        color: '#8b949e',
                                        transform: isInputOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                        transition: 'transform 0.2s',
                                    }}
                                />
                            </button>

                            {/* Textarea body */}
                            {isInputOpen && (
                                <div className="px-4 pb-4 pt-1 animate-in slide-in-from-top-2 duration-200">
                                    <textarea
                                        value={customInput}
                                        onChange={(e) => setCustomInput(e.target.value)}
                                        placeholder="Enter testcase input here..."
                                        className="w-full h-24 rounded-lg p-3 text-sm resize-y outline-none transition-all duration-200 focus:ring-1"
                                        style={{
                                            backgroundColor: '#0d1117',
                                            color: '#e6edf3',
                                            border: '1px solid #30363d',
                                            fontFamily: "'JetBrains Mono', monospace",
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                                            e.currentTarget.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.borderColor = '#30363d';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                        spellCheck={false}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Output Console */}
                    <div className="flex-[3] min-w-0 overflow-hidden">
                        <RunnerConsole
                            output={output}
                            isRunning={isRunning}
                            isGeneratingTests={isGeneratingTests}
                            isSuccess={isSuccess}
                            executionTime={executionTime}
                            memory={memory}
                            statusDescription={statusDescription}
                            testCases={testCases}
                            onClear={handleClearOutput}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
