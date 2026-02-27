'use client';

interface ProgressRingProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    label?: string;
    sublabel?: string;
}

export default function ProgressRing({
    percentage,
    size = 120,
    strokeWidth = 8,
    color = '#88C0D0',
    label,
    sublabel,
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="flex flex-col items-center gap-2">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="-rotate-90"
                >
                    {/* Track */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        className="progress-ring-track"
                        strokeWidth={strokeWidth}
                    />
                    {/* Bar */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        className="progress-ring-bar"
                        strokeWidth={strokeWidth}
                        stroke={color}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{
                            filter: `drop-shadow(0 0 6px ${color}40)`,
                        }}
                    />
                </svg>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-nord6 font-bold text-lg">
                        {label ? label : (percentage % 1 !== 0 ? percentage.toFixed(1) : Math.round(percentage)) + '%'}
                    </span>
                    {sublabel && <span className="text-[10px] text-nord4/40">{sublabel}</span>}
                </div>
            </div>
        </div>
    );
}
