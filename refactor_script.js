const fs = require('fs');

const file = './src/app/login/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The amoled var mapping
const themeOverrides = {
    'var(--th-nord0)': '#000000',
    'var(--th-nord1)': '#0a0a0a',
    'var(--th-nord2)': '#0a0a0a',
    'var(--th-nord3)': '#1a1a1a',
    'var(--th-nord4)': '#888888',
    'var(--th-nord5)': '#ffffff',
    'var(--th-nord6)': '#ffffff',
    'var(--th-nord7)': '#5e81f4',
    'var(--th-nord8)': '#5e81f4',
    'var(--th-nord9)': '#5e81f4',
    'var(--th-nord10)': '#5e81f4',
    'var(--th-nord11)': '#ec4c47',
    'var(--th-nord12)': '#ec4c47',
    'var(--th-nord13)': '#ec4c47',
    'var(--th-nord14)': '#a3be8c',
    'var(--th-nord15)': '#bf67f5'
};

const parts = content.split('export default function LoginPage() {');
let flappyGame = parts[0];
let loginPage = 'export default function LoginPage() {' + parts[1];

// 1. Strip var(--th-nord*) and replace with AMOLED values
for (const [key, val] of Object.entries(themeOverrides)) {
    loginPage = loginPage.replaceAll(key, val);
}

// 2. Add next/script
flappyGame = flappyGame.replace(
    "import dynamic from 'next/dynamic';",
    "import dynamic from 'next/dynamic';\nimport Script from 'next/script';"
);

// 3. Float UI States
loginPage = loginPage.replace(
    /const \[score, setScore\] = useState\(0\);\n/g,
    `const [score, setScore] = useState(0);\n\n    // [CHANGED] Floating UI States & Refs\n    const [usernameFocused, setUsernameFocused] = useState(false);\n    const [showPrivacyPopover, setShowPrivacyPopover] = useState(false);\n    \n    const usernameInputRef = useRef<HTMLInputElement>(null);\n    const usernameTooltipRef = useRef<HTMLDivElement>(null);\n    const usernameArrowRef = useRef<HTMLDivElement>(null);\n    \n    const privacyBtnRef = useRef<HTMLButtonElement>(null);\n    const privacyPopoverRef = useRef<HTMLDivElement>(null);\n    \n    const pinRowRef = useRef<HTMLDivElement>(null);\n    const pinTooltipRef = useRef<HTMLDivElement>(null);\n\n`
);

// 4. Init AOS and setup Float UI useEffect
loginPage = loginPage.replace(
    /        getUserCount\(\)\.then\(setUserCount\);\n    \}, \[\]\);/g,
    `        getUserCount().then(setUserCount);\n        // [CHANGED] Init AOS\n        // @ts-ignore\n        if (typeof window !== 'undefined' && window.AOS) window.AOS.init({ once: true });\n    }, []);\n\n    // [CHANGED] Floating UI Positioning Effect\n    useEffect(() => {\n        let cleanup = false;\n        async function updatePositions() {\n            if (!mounted) return;\n            const { computePosition, offset, flip, shift, arrow } = await import('https://esm.sh/@floating-ui/dom@1.6.3');\n            if (cleanup) return;\n\n            const isUsernameInvalid = username.length > 0 && (username.length < 5 || username.length > 20 || /[^a-z0-9_-]/i.test(username));\n            if (usernameFocused && isUsernameInvalid && usernameInputRef.current && usernameTooltipRef.current) {\n                const { x, y, placement, middlewareData } = await computePosition(usernameInputRef.current, usernameTooltipRef.current, {\n                    placement: 'top',\n                    middleware: [offset(8), flip(), shift({ padding: 8 }), arrow({ element: usernameArrowRef.current })]\n                });\n                if (!cleanup && usernameTooltipRef.current) {\n                    Object.assign(usernameTooltipRef.current.style, { left: \`\${x}px\`, top: \`\${y}px\`, display: 'block' });\n                    if (middlewareData.arrow && usernameArrowRef.current) {\n                        const { x: arrowX, y: arrowY } = middlewareData.arrow;\n                        const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[placement.split('-')[0]] || 'bottom';\n                        Object.assign(usernameArrowRef.current.style, {\n                            left: arrowX != null ? \`\${arrowX}px\` : '', top: arrowY != null ? \`\${arrowY}px\` : '',\n                            right: '', bottom: '', [staticSide]: '-4px'\n                        });\n                    }\n                }\n            } else if (usernameTooltipRef.current) {\n                 usernameTooltipRef.current.style.display = 'none';\n            }\n\n            if (showPrivacyPopover && privacyBtnRef.current && privacyPopoverRef.current) {\n                const { x, y } = await computePosition(privacyBtnRef.current, privacyPopoverRef.current, {\n                    placement: 'right-start',\n                    middleware: [offset(16), flip(), shift({ padding: 16 })]\n                });\n                if (!cleanup && privacyPopoverRef.current) {\n                    Object.assign(privacyPopoverRef.current.style, { left: \`\${x}px\`, top: \`\${y}px\`, display: 'block' });\n                }\n            } else if (privacyPopoverRef.current) {\n                privacyPopoverRef.current.style.display = 'none';\n            }\n\n            const allPinsFilled = passcode.every(p => p !== '');\n            if (allPinsFilled && !loading && pinRowRef.current && pinTooltipRef.current) {\n                const { x, y } = await computePosition(pinRowRef.current, pinTooltipRef.current, {\n                    placement: 'bottom',\n                    middleware: [offset(12), flip(), shift({ padding: 8 })]\n                });\n                if (!cleanup && pinTooltipRef.current) {\n                    Object.assign(pinTooltipRef.current.style, { left: \`\${x}px\`, top: \`\${y}px\`, display: 'block' });\n                }\n            } else if (pinTooltipRef.current) {\n                 pinTooltipRef.current.style.display = 'none';\n            }\n        }\n        updatePositions();\n        return () => { cleanup = true; };\n    }, [mounted, usernameFocused, username, showPrivacyPopover, passcode, loading]);`
);

// 5. Wrap root div with login-root and <style>
loginPage = loginPage.replace(
    '<div className="min-h-screen relative flex flex-col items-center overflow-x-hidden transition-colors" style={{ backgroundColor: \'#000000\' }}>',
    `// [CHANGED] Added .login-root, scoped styles, and AMOLED background\n        <div className="login-root min-h-screen relative flex flex-col items-center overflow-x-hidden transition-colors" style={{ backgroundColor: '#000000' }}>\n            {/* [CHANGED] Added Scoped CSS Custom Properties For This File Only */}\n            <style>{\`\n                .login-root {\n                    --th-nord0: #000000;\n                    --th-nord1: #0a0a0a;\n                    --th-nord2: #0a0a0a;\n                    --th-nord3: #1a1a1a;\n                    --th-nord4: #888888;\n                    --th-nord5: #ffffff;\n                    --th-nord6: #ffffff;\n                    --th-nord8: #5e81f4;\n                    --th-nord9: #5e81f4;\n                    --th-nord10: #5e81f4;\n                    --th-nord11: #ec4c47;\n                    --th-nord12: #ec4c47;\n                    --th-nord14: #a3be8c;\n                    --th-nord15: #bf67f5;\n                }\n                @keyframes amoled-pulse {\n                    0% { box-shadow: 0 0 0 0px #5e81f4; }\n                    100% { box-shadow: 0 0 0 6px transparent; }\n                }\n                .pulse-ring {\n                    animation: amoled-pulse 0.4s ease-out forwards;\n                    border-color: #5e81f4 !important;\n                }\n            \`}</style>`
);

// 6. AOS injected in DOM
loginPage = loginPage.replace(
    '<DancingGirl3DLazy mode="login" />',
    `{/* [CHANGED] AOS Scripts & Tooltip Portals */}\n            {mounted && (\n                <>\n                    <link href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" rel="stylesheet" />\n                    <Script \n                        src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.min.js" \n                        strategy="afterInteractive" \n                        onLoad={() => {\n                            // @ts-ignore\n                            if (window.AOS) window.AOS.init({ once: true });\n                        }} \n                    />\n                    \n                    {/* Username Tooltip */}\n                    <div ref={usernameTooltipRef} style={{ position: 'absolute', display: 'none', top: 0, left: 0, zIndex: 9999, backgroundColor: '#1a1a1a', border: '1px solid #5e81f4', color: '#ffffff', fontSize: '12px', padding: '6px 12px', borderRadius: '8px' }}>\n                        5–20 chars, letters, numbers, _ or -\n                        <div ref={usernameArrowRef} style={{ position: 'absolute', width: '8px', height: '8px', backgroundColor: '#1a1a1a', borderRight: '1px solid #5e81f4', borderBottom: '1px solid #5e81f4', transform: 'rotate(45deg)' }} />\n                    </div>\n\n                    {/* Privacy Popover */}\n                    <div ref={privacyPopoverRef} style={{ position: 'absolute', display: 'none', top: 0, left: 0, zIndex: 9999, backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', maxWidth: '320px', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', padding: '16px' }}>\n                        <div className="flex justify-between items-center mb-4">\n                            <h3 className="text-sm font-bold text-[#a3be8c] flex items-center gap-2"><ShieldCheck size={16} /> Privacy Info</h3>\n                            <button onClick={() => setShowPrivacyPopover(false)} className="text-[#888888] hover:text-[#ffffff]">✕</button>\n                        </div>\n                        <ul className="text-xs text-[#888888] space-y-2">\n                            <li>• Data Storage: Progress on Google Firebase</li>\n                            <li>• Auth: PIN is securely hashed</li>\n                            <li>• Transparency: No data sold, no ads.</li>\n                        </ul>\n                    </div>\n\n                    {/* Pin Tooltip */}\n                    <div ref={pinTooltipRef} style={{ position: 'absolute', display: 'none', top: 0, left: 0, zIndex: 9999, backgroundColor: '#1a1a1a', border: '1px solid #5e81f4', color: '#ffffff', fontSize: '12px', padding: '6px 12px', borderRadius: '8px' }}>\n                        Press Enter to sign in\n                    </div>\n                </>\n            )}\n            <DancingGirl3DLazy mode="login" />`
);

// 7. Hero section AOS
// Remove motion from hero wrapper and add AOS to children
loginPage = loginPage.replace(
    /<motion\.div\n\s*initial=\{\{ opacity: 0, y: 30 \}\}\n\s*animate=\{\{ opacity: 1, y: 0 \}\}\n\s*transition=\{\{ duration: 0\.8, ease: "easeOut" \}\}\n\s*className="space-y-6 mb-16"\n\s*>/,
    `{/* [CHANGED] AOS implementation on Hero */}\n                <div className="space-y-6 mb-16">`
);
loginPage = loginPage.replace(
    /<h1 className="text-4xl md:text-6xl lg:text-\[64px\] font-\[800\] leading-\[1\.1\] tracking-tight" style=\{\{ color: '#ffffff' \}\}>/g,
    `<h1 data-aos="fade-up" data-aos-duration="900" className="text-4xl md:text-6xl lg:text-[64px] font-[800] leading-[1.1] tracking-tight" style={{ color: '#ffffff' }}>`
);
loginPage = loginPage.replace(
    /<p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-80" style=\{\{ color: '#888888' \}\}>/g,
    `<p data-aos="fade-up" data-aos-delay="150" className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed opacity-80" style={{ color: '#888888' }}>`
);

// We need to close it with `</div>` instead of `</motion.div>`.
loginPage = loginPage.replace(
    /<\/motion\.div>\n\n\s*\{\/\* ── Phase 3:/,
    `</div>\n\n                {/* ── Phase 3:`
);

// 8. productSteps AOS
loginPage = loginPage.replace(
    /\{productSteps\.map\(\(s, i\) => \(\n\s*<motion\.div\n\s*key=\{s\.title\}\n\s*initial=\{\{ opacity: 0, y: 20 \}\}\n\s*animate=\{\{ opacity: 1, y: 0 \}\}\n\s*transition=\{\{ delay: 0\.6 \+ i \* 0\.2 \}\}\n\s*className="bg-white\/\[0\.03\] border border-white\/5 p-8 rounded-3xl hover:bg-white\/\[0\.05\] transition-all group relative text-center"\n\s*>/g,
    `{productSteps.map((s, i) => (\n                        {/* [CHANGED] Replaced framer-motion with AOS */}\n                        <div\n                            key={s.title}\n                            data-aos="fade-up"\n                            data-aos-delay={i * 100}\n                            className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl hover:bg-white/[0.05] transition-all group relative text-center"\n                        >`
);
// replace closing </motion.div> for product steps
loginPage = loginPage.replace(
    /<\/motion\.div>\n\s*\)\)}/g,
    `</div>\n                    ))}`
);

// 9. how it works AOS
loginPage = loginPage.replace(
    /<div key=\{i\} className="flex items-center gap-4 group">/g,
    `<div key={i} data-aos="fade-left" data-aos-delay={i * 60} className="flex items-center gap-4 group"> {/* [CHANGED] Added AOS */} `
);

// 10. feature highlights AOS
loginPage = loginPage.replace(
    /\{featureHighlights\.map\(\(f: any, i\) => \(\n\s*<motion\.div\n\s*key=\{i\}\n\s*whileHover=\{\{ y: -5 \}\}\n\s*className=\{`p-4/g,
    `{featureHighlights.map((f: any, i) => (\n                            {/* [CHANGED] Replaced framer-motion with AOS */}\n                            <div\n                                key={i}\n                                data-aos="zoom-in"\n                                data-aos-delay={i * 50}\n                                className={\`hover:-translate-y-1 p-4`
);
loginPage = loginPage.replace(
    /<\/motion\.div>\n\s*\)\)}\n\s*<\/div>/g,
    `</div>\n                        ))}\n                    </div>`
);

// 11. footer AOS
loginPage = loginPage.replace(
    /<footer className="w-full border-t border-white\/5 mt-auto bg-\[\#000000\]\/50 backdrop-blur-md">/g,
    `{/* [CHANGED] Added AOS fade-up to footer */}\n            <footer data-aos="fade-up" className="w-full border-t border-white/5 mt-auto bg-[#000000]/50 backdrop-blur-md">`
);

// 12. Floating UI Username ref & focus events
loginPage = loginPage.replace(
    /<input\n\s*type="text"\n\s*value=\{username\}/,
    `<input\n                                                ref={usernameInputRef}\n                                                onFocus={() => setUsernameFocused(true)}\n                                                onBlur={() => setUsernameFocused(false)}\n                                                type="text"\n                                                value={username}`
);


// 13. Floating UI Privacy Popover trigger
loginPage = loginPage.replace(
    /<button onClick=\{.*?\} className="underline hover:text-white">privacy policy<\/button>/,
    `{/* [CHANGED] Modified privacy policy button for Float UI tooltip */}<button ref={privacyBtnRef} onClick={(e) => {\n                                                e.preventDefault();\n                                                if (window.innerWidth < 640) setFooterModal('privacy');\n                                                else setShowPrivacyPopover(!showPrivacyPopover);\n                                            }} className="underline hover:text-white">privacy policy</button>`
);

// 14. Floating UI PIN Array refs and styling
loginPage = loginPage.replace(
    /<div className="flex justify-center gap-3">/g,
    `<div ref={pinRowRef} className="flex justify-center gap-3">`
);
loginPage = loginPage.replace(
    /className="w-14 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all bg-white\/5"\n\s*style=\{\{\n\s*borderColor: passcode\[i\] \? '\#5e81f4' : '\#1a1a1a',\n\s*color: '\#ffffff'\n\s*\}\}/g,
    `className={\`w-14 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none transition-all bg-white/5 \${passcode.every(p => p !== '') && passcode[i] ? 'pulse-ring' : ''}\`}\n                                                style={{\n                                                    borderColor: passcode[i] ? '#5e81f4' : '#1a1a1a',\n                                                    color: '#ffffff'\n                                                }}`
);


fs.writeFileSync(file, flappyGame + loginPage);
console.log("Done refactoring");
