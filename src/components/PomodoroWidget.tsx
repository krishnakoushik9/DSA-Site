'use client';

import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, CloudRain, Bird, Flame, Moon, X, Volume2 } from 'lucide-react';

const MODES = {
    work: { label: 'Pomodoro', minutes: 25 },
    shortBreak: { label: 'Short Break', minutes: 5 },
    longBreak: { label: 'Long Break', minutes: 15 },
};

const AMBIENCE = [
    { id: 'rain', label: 'Rain', icon: CloudRain, file: '/audio/mixkit-rain-and-thunder-storm-2390.wav' },
    { id: 'water', label: 'River', icon: Bird, file: '/audio/mixkit-natural-ambience-with-flowing-water-and-birds-61.wav' },
    { id: 'fire', label: 'Campfire', icon: Flame, file: '/audio/mixkit-campfire-night-wind-1736.wav' },
    { id: 'night', label: 'Night', icon: Moon, file: '/audio/mixkit-summer-night-crickets-loop-1789.wav' },
];

export default function PomodoroWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<keyof typeof MODES>('work');
    const [timeLeft, setTimeLeft] = useState(MODES['work'].minutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [selectedAmbience, setSelectedAmbience] = useState<string[]>([]);
    const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

    const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
    const alarmRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio objects on mount
    useEffect(() => {
        AMBIENCE.forEach((a) => {
            const audio = new Audio(a.file);
            audio.loop = true;
            // lower ambience volume slightly
            audio.volume = 0.6;
            audioRefs.current[a.id] = audio;
        });

        alarmRef.current = new Audio('/audio/mixkit-happy-bell-alert-601.wav');
        alarmRef.current.volume = 1.0;

        return () => {
            Object.values(audioRefs.current).forEach(a => {
                a.pause();
                a.src = '';
            });
            if (alarmRef.current) {
                alarmRef.current.pause();
                alarmRef.current.src = '';
            }
        };
    }, []);

    // Handle ambience playback when selectedAmbience or alarm state changes
    useEffect(() => {
        Object.keys(audioRefs.current).forEach(id => {
            const audio = audioRefs.current[id];
            // Play ambience if it is selected, alarm is NOT playing, and the widget might be open/closed (play it anyway if selected!)
            // Notice: user might want it playing even when closed, so it acts as background ambience while working
            if (selectedAmbience.includes(id) && !isAlarmPlaying) {
                audio.play().catch(e => console.log('Ambience auto-play prevented:', e));
            } else {
                audio.pause();
            }
        });
    }, [selectedAmbience, isAlarmPlaying]);

    // Handle timer interval
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            setIsActive(false);
            setIsAlarmPlaying(true);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    // Handle alarm loop
    useEffect(() => {
        if (isAlarmPlaying && alarmRef.current) {
            const alarm = alarmRef.current;
            let playCount = 0;

            const onEnded = () => {
                playCount++;
                if (playCount < 5) {
                    alarm.currentTime = 0;
                    alarm.play().catch(console.error);
                } else {
                    setIsAlarmPlaying(false);
                }
            };

            alarm.addEventListener('ended', onEnded);
            alarm.currentTime = 0;
            alarm.play().catch(err => {
                console.error('Alarm auto-play prevented:', err);
                setIsAlarmPlaying(false);
            });

            return () => {
                alarm.removeEventListener('ended', onEnded);
                alarm.pause();
            };
        }
    }, [isAlarmPlaying]);

    const switchMode = (newMode: keyof typeof MODES) => {
        setMode(newMode);
        setTimeLeft(MODES[newMode].minutes * 60);
        setIsActive(false);
        if (isAlarmPlaying) setIsAlarmPlaying(false);
    };

    const toggleTimer = () => {
        if (isAlarmPlaying) {
            setIsAlarmPlaying(false);
            return;
        }
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setTimeLeft(MODES[mode].minutes * 60);
        setIsActive(false);
        if (isAlarmPlaying) setIsAlarmPlaying(false);
    };

    const toggleAmbience = (id: string) => {
        setSelectedAmbience(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div
            className={`fixed bottom-24 right-8 z-[100] rounded-[32px] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-2xl flex flex-col justify-end origin-bottom-right
                ${isOpen ? 'w-[340px] h-[450px] opacity-100' : 'w-16 h-16'}
            `}
            style={{
                backgroundColor: 'var(--th-nord1)',
                border: '1px solid color-mix(in srgb, var(--th-nord3) 40%, transparent)',
            }}
        >
            {/* Open UI */}
            <div className={`absolute bottom-0 right-0 w-[340px] h-[450px] p-6 transition-all duration-500 ease-in-out flex flex-col ${isOpen ? 'opacity-100 pointer-events-auto delay-100' : 'opacity-0 pointer-events-none -translate-x-4 translate-y-4 scale-95'}`}>

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 font-bold tracking-wider uppercase text-xs" style={{ color: 'var(--th-nord4)' }}>
                        <Timer size={16} style={{ color: 'var(--th-nord8)' }} />
                        Pomodoro Focus
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 rounded-full hover:bg-black/10 transition-colors"
                        style={{ color: 'var(--th-nord4)' }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Mode Selection */}
                <div className="flex justify-between bg-black/10 rounded-xl p-1 mb-6">
                    {(['work', 'shortBreak', 'longBreak'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${mode === m ? 'shadow-sm bg-white/10' : 'hover:bg-white/5 opacity-70'}`}
                            style={{ color: mode === m ? 'var(--th-nord8)' : 'var(--th-nord4)' }}
                        >
                            {MODES[m].label}
                        </button>
                    ))}
                </div>

                {/* Timer Display */}
                <div className="text-center font-mono text-6xl font-light mb-6 tracking-tight flex-1 flex items-center justify-center" style={{ color: 'var(--th-nord4)' }}>
                    {formatTime(timeLeft)}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mb-6">
                    <button
                        onClick={toggleTimer}
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                        style={{ backgroundColor: 'var(--th-nord8)', color: 'var(--th-nord1)' }}
                    >
                        {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </button>
                    <button
                        onClick={resetTimer}
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-105"
                        style={{ backgroundColor: 'color-mix(in srgb, var(--th-nord3) 20%, transparent)', color: 'var(--th-nord4)' }}
                    >
                        <RotateCcw size={20} />
                    </button>
                </div>

                {/* Ambience Modes */}
                <div className="border-t pt-4" style={{ borderColor: 'color-mix(in srgb, var(--th-nord3) 30%, transparent)' }}>
                    <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--th-nord3)' }}>
                        <Volume2 size={14} /> Ambience
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {AMBIENCE.map(a => {
                            const isSelected = selectedAmbience.includes(a.id);
                            const Icon = a.icon;
                            return (
                                <button
                                    key={a.id}
                                    onClick={() => toggleAmbience(a.id)}
                                    className={`flex items-center gap-2 py-2 px-3 rounded-xl border transition-all text-xs font-medium ${isSelected ? 'shadow-inner' : 'hover:bg-black/5'}`}
                                    style={{
                                        borderColor: isSelected ? 'var(--th-nord8)' : 'color-mix(in srgb, var(--th-nord3) 20%, transparent)',
                                        backgroundColor: isSelected ? 'color-mix(in srgb, var(--th-nord8) 15%, transparent)' : 'transparent',
                                        color: isSelected ? 'var(--th-nord8)' : 'var(--th-nord4)'
                                    }}
                                >
                                    <Icon size={16} />
                                    <span className="truncate">{a.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>

            {/* Closed Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`absolute bottom-0 right-0 w-16 h-16 flex items-center justify-center bg-transparent transition-all duration-300 pointer-events-auto ${isOpen ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100 hover:scale-110'}`}
                style={{ color: 'var(--th-nord8)' }}
            >
                <div className="relative">
                    <Timer size={28} />
                    {(isActive || isAlarmPlaying || selectedAmbience.length > 0) && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-nord1 animate-pulse" />
                    )}
                </div>
            </button>
        </div>
    );
}
