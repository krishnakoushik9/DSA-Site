import { useRef, useEffect, useState } from 'react';
import { Trash2, CheckCircle2, XCircle, Loader2, Terminal, Copy, AlertTriangle, Play, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { TestCase } from './RunnerIDE';

interface RunnerConsoleProps {
    output: string;
    isRunning: boolean;
    isGeneratingTests?: boolean;
    isSuccess: boolean | null;
    executionTime: string | null;
    memory: number | null;
    statusDescription: string;
    testCases?: TestCase[];
    onClear: () => void;
}

export default function RunnerConsole({
    output,
    isRunning,
    isGeneratingTests,
    isSuccess,
    executionTime,
    memory,
    statusDescription,
    testCases,
    onClear,
}: RunnerConsoleProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [expandedTestCase, setExpandedTestCase] = useState<number | null>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [output, isRunning, testCases]);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getBgColor = () => {
        if (isRunning || isGeneratingTests || isSuccess === null) return '#0d1117';
        if (isSuccess) return '#0f2d1a';
        if (statusDescription.includes('Time') || statusDescription.includes('Memory')) return '#2d2410';
        return '#2d1414';
    };

    const isWarning = statusDescription.includes('Time') || statusDescription.includes('Memory');
    const hasTestCases = testCases && testCases.length > 0;

    return (
        <div
            className="flex flex-col h-full overflow-hidden transition-colors duration-300 relative"
            style={{ backgroundColor: getBgColor() }}
        >
            {/* Console Header */}
            <div
                className="flex items-center justify-between px-4 py-2.5 shrink-0 z-10 relative"
                style={{
                    backgroundColor: 'rgba(22, 27, 34, 0.4)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                <div className="flex items-center gap-2">
                    <Terminal size={14} style={{ color: '#e6edf3' }} />
                    <span
                        className="text-xs font-semibold tracking-wider"
                        style={{ color: '#e6edf3' }}
                    >
                        Output Console
                    </span>
                    {hasTestCases && !isRunning && !isGeneratingTests && (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: isSuccess ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)', color: isSuccess ? '#3fb950' : '#f85149', border: `1px solid ${isSuccess ? 'rgba(63, 185, 80, 0.2)' : 'rgba(248, 81, 73, 0.2)'}` }}>
                            {testCases.filter(t => t.passed).length} / {testCases.length} Passed
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[10px] mr-2" style={{ color: '#484f58' }}>
                        Ctrl+L
                    </span>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-md transition-colors duration-200"
                        style={{ color: copied ? '#3fb950' : '#484f58' }}
                        onMouseEnter={(e) => {
                            if (!copied) e.currentTarget.style.color = '#e6edf3';
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                        }}
                        onMouseLeave={(e) => {
                            if (!copied) e.currentTarget.style.color = '#484f58';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Copy output"
                    >
                        {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                    </button>
                    <button
                        id="runner-clear-output"
                        onClick={onClear}
                        className="p-1.5 rounded-md transition-colors duration-200"
                        style={{ color: '#484f58' }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#f85149';
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#484f58';
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Clear output (Ctrl+L)"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Console Body */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 min-h-0 transition-opacity duration-250 opacity-100"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
                {isGeneratingTests && !hasTestCases ? (
                    /* ── Generating AI Tests State ── */
                    <div className="flex flex-col items-center justify-center h-full gap-4 animate-in fade-in duration-200">
                        <Loader2
                            size={24}
                            className="animate-spin"
                            style={{ color: '#8b949e' }}
                        />
                        <span className="text-sm font-medium" style={{ color: '#8b949e' }}>
                            Generating Test Cases...
                        </span>
                    </div>
                ) : isRunning && !hasTestCases ? (
                    /* ── Running Custom Input State ── */
                    <div className="flex flex-col items-center justify-center h-full gap-4 animate-in fade-in duration-200">
                        <Loader2
                            size={24}
                            className="animate-spin"
                            style={{ color: '#8b949e' }}
                        />
                        <span className="text-sm font-medium" style={{ color: '#8b949e' }}>
                            Compiling and executing code...
                        </span>
                    </div>
                ) : hasTestCases ? (
                    /* ── AI Test Cases Grid ── */
                    <div className="space-y-4 animate-in fade-in duration-200 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                            {isSuccess === null || isRunning || isGeneratingTests ? (
                                <Loader2 size={16} className="animate-spin" style={{ color: '#8b949e' }} />
                            ) : isSuccess ? (
                                <CheckCircle2 size={16} style={{ color: '#3fb950' }} />
                            ) : (
                                <XCircle size={16} style={{ color: '#f85149' }} />
                            )}
                            <span
                                className="text-sm font-semibold"
                                style={{
                                    color: (isSuccess === null || isRunning || isGeneratingTests) ? '#8b949e' : isSuccess ? '#3fb950' : '#f85149',
                                }}
                            >
                                {statusDescription || 'Running Test Cases...'}
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {testCases.map((tc, idx) => (
                                <div key={tc.id} className="rounded-lg overflow-hidden border transition-all duration-200" style={{ borderColor: tc.passed ? 'rgba(63, 185, 80, 0.2)' : tc.status === 'done' ? 'rgba(248, 81, 73, 0.2)' : 'rgba(255, 255, 255, 0.1)' }}>
                                    <div
                                        onClick={() => tc.status === 'done' && setExpandedTestCase(expandedTestCase === idx ? null : idx)}
                                        className={`px-3 py-2.5 flex items-center justify-between transition-colors ${tc.status === 'done' ? 'cursor-pointer hover:bg-[rgba(255,255,255,0.03)]' : ''}`}
                                        style={{
                                            backgroundColor: tc.status === 'running' ? 'rgba(255, 255, 255, 0.02)' :
                                                tc.status === 'done' ? (tc.passed ? 'rgba(63, 185, 80, 0.05)' : 'rgba(248, 81, 73, 0.03)') :
                                                    'transparent'
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            {tc.status === 'pending' && <Clock size={15} style={{ color: '#484f58' }} />}
                                            {tc.status === 'running' && <Loader2 size={15} className="animate-spin" style={{ color: '#e6edf3' }} />}
                                            {tc.status === 'done' && tc.passed && <CheckCircle2 size={15} style={{ color: '#3fb950' }} />}
                                            {tc.status === 'done' && !tc.passed && <XCircle size={15} style={{ color: '#f85149' }} />}
                                            <span className="text-xs font-semibold" style={{ color: tc.status === 'pending' ? '#8b949e' : '#e6edf3' }}>
                                                Test Case {idx + 1}
                                            </span>
                                        </div>
                                        {tc.status === 'done' && (
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px]" style={{ color: '#8b949e' }}>{tc.executionTime || '0.00'}s</span>
                                                {expandedTestCase === idx ? <ChevronUp size={14} style={{ color: '#8b949e' }} /> : <ChevronDown size={14} style={{ color: '#8b949e' }} />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Test Case Output Details */}
                                    {expandedTestCase === idx && tc.status === 'done' && (
                                        <div className="px-4 py-3 border-t flex flex-col gap-3" style={{ borderColor: 'rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                                            {tc.input && (
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-widest font-bold block mb-1.5" style={{ color: '#8b949e' }}>Input</span>
                                                    <pre className="text-[11px] leading-relaxed p-2 rounded break-words whitespace-pre-wrap" style={{ backgroundColor: '#0d1117', color: '#e6edf3', border: '1px solid rgba(255, 255, 255, 0.05)' }}>{tc.input}</pre>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-widest font-bold block mb-1.5" style={{ color: '#8b949e' }}>Expected Output</span>
                                                    <pre className="text-[11px] leading-relaxed p-2 rounded break-words whitespace-pre-wrap" style={{ backgroundColor: '#0d1117', color: '#3fb950', border: '1px solid rgba(63, 185, 80, 0.2)' }}>{tc.expectedOutput || '<No output expected>'}</pre>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-widest font-bold block mb-1.5" style={{ color: '#8b949e' }}>Actual Output</span>
                                                    <pre className="text-[11px] leading-relaxed p-2 rounded break-words whitespace-pre-wrap" style={{ backgroundColor: '#0d1117', color: tc.passed ? '#3fb950' : '#f85149', border: `1px solid ${tc.passed ? 'rgba(63, 185, 80, 0.2)' : 'rgba(248, 81, 73, 0.2)'}` }}>{tc.actualOutput || '<No Output>'}</pre>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Summary Execution Metadata */}
                        {(executionTime || memory) && (
                            <>
                                <div className="h-px w-full my-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                <div className="flex items-center gap-6 pb-2" style={{ color: '#8b949e' }}>
                                    {executionTime && (
                                        <div className="flex items-center gap-1.5">
                                            <span>⚡</span>
                                            <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>{executionTime}s (Total)</span>
                                        </div>
                                    )}
                                    {memory && (
                                        <div className="flex items-center gap-1.5">
                                            <span>🧠</span>
                                            <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>{memory} KB (Max)</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ) : output || isSuccess !== null ? (
                    /* ── Standard Result State (Custom Input) ── */
                    <div className="space-y-4 animate-in fade-in duration-200">
                        {/* Status Label */}
                        <div className="flex items-center gap-2 mb-4">
                            {isSuccess ? (
                                <CheckCircle2 size={16} style={{ color: '#3fb950' }} />
                            ) : isWarning ? (
                                <AlertTriangle size={16} style={{ color: '#d29922' }} />
                            ) : (
                                <XCircle size={16} style={{ color: '#f85149' }} />
                            )}
                            <span
                                className="text-sm font-semibold"
                                style={{
                                    color: isSuccess ? '#3fb950' : isWarning ? '#d29922' : '#f85149',
                                }}
                            >
                                {statusDescription || (isSuccess ? 'Execution Successful' : 'Execution Error')}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />

                        {/* Program Output Section */}
                        <div className="mb-2">
                            <span
                                className="text-[10px] uppercase tracking-widest font-bold block mb-2"
                                style={{ color: 'rgba(255,255,255,0.4)' }}
                            >
                                Program Output
                            </span>
                            <pre
                                className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                                style={{ color: '#e6edf3', margin: 0 }}
                            >
                                {output || <span className="italic text-[#484f58]">&lt;No output&gt;</span>}
                            </pre>
                        </div>

                        {/* Execution Metadata */}
                        {(executionTime || memory) && (
                            <>
                                <div className="h-px w-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
                                <div className="flex items-center gap-6" style={{ color: '#8b949e' }}>
                                    {executionTime && (
                                        <div className="flex items-center gap-1.5">
                                            <span>⚡</span>
                                            <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>{executionTime}s</span>
                                        </div>
                                    )}
                                    {memory && (
                                        <div className="flex items-center gap-1.5">
                                            <span>🧠</span>
                                            <span className="text-sm font-semibold" style={{ color: '#e6edf3' }}>{memory} KB</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    /* ── Empty State ── */
                    <div className="flex flex-col items-center justify-center h-full text-center gap-4 animate-in fade-in duration-200">
                        <Play size={28} style={{ color: '#30363d' }} fill="#30363d" />
                        <div>
                            <p className="text-sm font-medium mb-1" style={{ color: '#8b949e' }}>
                                Ready to run
                            </p>
                            <p className="text-xs" style={{ color: '#484f58' }}>
                                Press <span style={{ color: '#e6edf3' }}>Run Code</span> or{' '}
                                <kbd
                                    className="px-1.5 py-0.5 rounded"
                                    style={{
                                        backgroundColor: '#21262d',
                                        border: '1px solid #30363d',
                                        color: '#8b949e',
                                    }}
                                >
                                    Ctrl
                                </kbd>{' '}
                                +{' '}
                                <kbd
                                    className="px-1.5 py-0.5 rounded"
                                    style={{
                                        backgroundColor: '#21262d',
                                        border: '1px solid #30363d',
                                        color: '#8b949e',
                                    }}
                                >
                                    Enter
                                </kbd>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Testing Notice Footer */}
            <div
                className="px-4 py-3 shrink-0"
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                }}
            >
                <p className="text-[10px] leading-relaxed" style={{ color: '#8b949e' }}>
                    Runner evaluates code automatically with dynamic test cases unless custom stdin is provided.
                </p>
            </div>
        </div>
    );
}
