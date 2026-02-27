'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    Send,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    RefreshCw,
    Trash2,
    Clock,
    Code2,
    MoreHorizontal,
    Copy,
    Check,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
    loadPosts,
    createPost,
    updatePost,
    deletePost,
    CommunityPost,
    CommunityComment,
    pushNotification,
    Notification,
} from '@/lib/firebase';

// Prism.js for syntax highlighting
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';

const TAGS = ['General', 'Question', 'Tip', 'Resource', 'Discussion', 'Help'];
const TAG_COLORS: Record<string, string> = {
    General: 'bg-nord3/30 text-nord4',
    Question: 'bg-nord13/15 text-nord13',
    Tip: 'bg-nord14/15 text-nord14',
    Resource: 'bg-nord8/15 text-nord8',
    Discussion: 'bg-nord9/15 text-nord9',
    Help: 'bg-nord11/15 text-nord11',
};

const LANG_MAP: Record<string, string> = {
    python: 'python', py: 'python',
    javascript: 'javascript', js: 'javascript',
    typescript: 'typescript', ts: 'typescript',
    java: 'java',
    c: 'c', 'c++': 'cpp', cpp: 'cpp',
    go: 'go', golang: 'go',
    rust: 'rust', rs: 'rust',
};

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

// ============================================================
// Code detection and parsing
// ============================================================

function looksLikeCode(text: string): boolean {
    const codeIndicators = [
        /\b(class|public|private|static|void|int|return|if|else|for|while|def|import|from)\b/,
        /[{};]\s*$/m,                    // lines ending with { } ;
        /^\s{2,}(if|for|while|return)/m, // indented control flow
        /\b\w+\s*\([^)]*\)\s*[{:]/,     // function definitions
        /\b(System|console|print|cout|scanf|printf)\b/,
        /(\+\+|--|->|=>|\|\||&&)/,       // operators
        /(int|float|double|string|bool|char)\s+\w+/,  // type declarations
        /\bnew\s+\w+/,                   // new keyword
    ];
    let score = 0;
    for (const pattern of codeIndicators) {
        if (pattern.test(text)) score++;
    }
    return score >= 2;
}

function detectLanguage(code: string, hint?: string): string {
    if (hint && LANG_MAP[hint.toLowerCase()]) return LANG_MAP[hint.toLowerCase()];
    if (hint) return hint.toLowerCase();
    if (/\bdef\s+\w+|print\(|self\./m.test(code)) return 'python';
    if (/\bconsole\.log|=>|const |let |var /m.test(code)) return 'javascript';
    if (/public\s+static\s+void|System\.out|HashMap|ArrayList/m.test(code)) return 'java';
    if (/#include|cout|cin|std::/m.test(code)) return 'cpp';
    if (/\bfunc\s+\w+|fmt\.|package\s+main/m.test(code)) return 'go';
    if (/fn\s+\w+|let\s+mut|println!/m.test(code)) return 'rust';
    return 'javascript'; // fallback
}

type ContentPart = { type: 'text'; value: string } | { type: 'code'; value: string; lang: string };

function parseContent(content: string): ContentPart[] {
    const parts: ContentPart[] = [];
    const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    let foundCodeBlock = false;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        foundCodeBlock = true;
        if (match.index > lastIndex) {
            const text = content.slice(lastIndex, match.index).trim();
            if (text) parts.push({ type: 'text', value: text });
        }
        const lang = match[1] || '';
        const code = match[2].trim();
        parts.push({ type: 'code', value: code, lang: detectLanguage(code, lang || undefined) });
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
        const remaining = content.slice(lastIndex).trim();
        if (remaining) {
            // Auto-detect: if no ``` blocks found and content looks like code
            if (!foundCodeBlock && looksLikeCode(remaining)) {
                parts.push({ type: 'code', value: remaining, lang: detectLanguage(remaining) });
            } else {
                parts.push({ type: 'text', value: remaining });
            }
        }
    }

    if (parts.length === 0) parts.push({ type: 'text', value: content });
    return parts;
}

// ============================================================
// Highlighted Code Block component
// ============================================================
function CodeBlock({ code, language }: { code: string; language: string }) {
    const [copied, setCopied] = useState(false);
    const codeRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (codeRef.current) {
            Prism.highlightElement(codeRef.current);
        }
    }, [code, language]);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const prismLang = LANG_MAP[language] || language || 'javascript';

    return (
        <div className="rounded-lg overflow-hidden border border-nord3/15 my-1.5">
            <div className="flex items-center justify-between px-3 py-1 bg-[#1d1f21] border-b border-[#333]">
                <span className="text-[9px] font-mono text-nord8/50 uppercase tracking-wider">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[9px] text-nord4/25 hover:text-nord8 transition-colors"
                >
                    {copied ? <><Check size={9} className="text-nord14" /> Copied</> : <><Copy size={9} /> Copy</>}
                </button>
            </div>
            <pre className="!m-0 !rounded-none !bg-[#1d1f21] p-3 overflow-x-auto" style={{ fontSize: '12px', lineHeight: '1.6' }}>
                <code ref={codeRef} className={`language-${prismLang}`}>
                    {code}
                </code>
            </pre>
        </div>
    );
}

// ============================================================
// Post Content with truncation
// ============================================================
function PostContent({ content }: { content: string }) {
    const [expanded, setExpanded] = useState(false);
    const parts = parseContent(content);
    const isLong = content.length > 300;
    const shouldTruncate = isLong && !expanded;

    if (shouldTruncate) {
        const previewText = content.replace(/```[\s\S]*?```/g, ' [code] ').slice(0, 200);
        return (
            <div>
                <p className="text-sm text-nord4/70 leading-relaxed whitespace-pre-wrap">{previewText}...</p>
                <button
                    onClick={() => setExpanded(true)}
                    className="text-xs text-nord8 hover:text-nord7 font-medium mt-1.5 flex items-center gap-0.5 transition-colors"
                >
                    <MoreHorizontal size={12} /> Show more
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-1">
            {parts.map((part, i) =>
                part.type === 'text' ? (
                    <p key={i} className="text-sm text-nord4/70 whitespace-pre-wrap leading-relaxed">{part.value}</p>
                ) : (
                    <CodeBlock key={i} code={part.value} language={part.lang} />
                )
            )}
            {isLong && expanded && (
                <button
                    onClick={() => setExpanded(false)}
                    className="text-xs text-nord4/25 hover:text-nord4/40 font-medium flex items-center gap-0.5 transition-colors"
                >
                    Show less
                </button>
            )}
        </div>
    );
}

// ============================================================
// Main Page
// ============================================================
export default function CommunityPage() {
    const { username } = useAppStore();
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [newTag, setNewTag] = useState('General');
    const [posting, setPosting] = useState(false);
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
    const [mounted, setMounted] = useState(false);
    const [showCodeHint, setShowCodeHint] = useState(false);
    const feedRef = useRef<HTMLDivElement>(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const data = await loadPosts();
        setPosts(data);
        setLoading(false);
    }, []);

    useEffect(() => { setMounted(true); fetchPosts(); }, [fetchPosts]);

    const handleCreatePost = async () => {
        if (!newPost.trim() || !username) return;
        setPosting(true);
        const post: CommunityPost = {
            id: generateId(), author: username, content: newPost.trim(),
            createdAt: new Date().toISOString(), upvotes: [], downvotes: [],
            comments: [], tag: newTag,
        };
        const success = await createPost(post);
        if (success) {
            setPosts(prev => [post, ...prev]);
            setNewPost('');
            feedRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        setPosting(false);
    };

    const handleVote = async (postId: string, type: 'up' | 'down') => {
        if (!username) return;
        setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p;
            let upvotes = [...p.upvotes], downvotes = [...p.downvotes];
            if (type === 'up') {
                if (upvotes.includes(username)) upvotes = upvotes.filter(u => u !== username);
                else { upvotes.push(username); downvotes = downvotes.filter(u => u !== username); }
            } else {
                if (downvotes.includes(username)) downvotes = downvotes.filter(u => u !== username);
                else { downvotes.push(username); upvotes = upvotes.filter(u => u !== username); }
            }
            const updated = { ...p, upvotes, downvotes };
            updatePost(updated);
            return updated;
        }));
    };

    const handleAddComment = async (postId: string) => {
        const text = commentTexts[postId]?.trim();
        if (!text || !username) return;
        const comment: CommunityComment = {
            id: generateId(), author: username, content: text, createdAt: new Date().toISOString(),
        };
        setPosts(prev => prev.map(p => {
            if (p.id !== postId) return p;

            // Send notification to post author if it's not the same person
            if (p.author !== username) {
                const notif: Notification = {
                    id: generateId(),
                    type: 'comment',
                    message: `@${username} commented on your post: "${text.slice(0, 30)}${text.length > 30 ? '...' : ''}"`,
                    from: username,
                    postId: p.id,
                    createdAt: new Date().toISOString(),
                    read: false,
                };
                pushNotification(p.author, notif);
            }

            const updated = { ...p, comments: [...p.comments, comment] };
            updatePost(updated);
            return updated;
        }));
        setCommentTexts(prev => ({ ...prev, [postId]: '' }));
    };

    const handleDeletePost = async (postId: string) => {
        if (await deletePost(postId)) setPosts(prev => prev.filter(p => p.id !== postId));
    };

    const toggleComments = (postId: string) => {
        setExpandedComments(prev => {
            const next = new Set(prev);
            next.has(postId) ? next.delete(postId) : next.add(postId);
            return next;
        });
    };

    if (!mounted) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-nord8 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="h-[calc(100vh-3rem)] flex flex-col max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0 mb-3">
                <div>
                    <h1 className="text-2xl font-bold text-nord6 tracking-tight">Community</h1>
                    <p className="text-nord4/50 text-xs">Share tips, code, and discuss DSA</p>
                </div>
                <button onClick={fetchPosts} disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-nord4/50 border border-nord3/20 hover:border-nord8/30 hover:text-nord8 transition-all">
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Compose */}
            <div className="card-nord p-4 flex-shrink-0 mb-3">
                <textarea value={newPost} onChange={e => setNewPost(e.target.value)}
                    placeholder={'Share something...\nWrap code in ```language ... ``` or paste code directly — it auto-detects!'}
                    rows={3}
                    className="w-full bg-nord0/50 border border-nord3/20 rounded-xl px-3 py-2.5 text-sm text-nord5 placeholder:text-nord3/25 focus:outline-none focus:ring-1 focus:ring-nord8/30 resize-none font-mono"
                    onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleCreatePost(); }}
                />
                {/* Code format hint */}
                <button onClick={() => setShowCodeHint(!showCodeHint)}
                    className="text-[9px] text-nord4/15 hover:text-nord8/40 transition-colors flex items-center gap-1 mt-1">
                    <Code2 size={10} /> {showCodeHint ? 'Hide' : 'How to post code?'}
                </button>
                {showCodeHint && (
                    <div className="mt-1.5 p-2.5 rounded-lg bg-nord0/40 border border-nord3/10 text-[10px] text-nord4/35 font-mono leading-relaxed">
                        <p className="font-sans text-nord4/50 mb-1">Option 1: Wrap in triple backticks</p>
                        <span className="text-nord8/60">```java</span><br />
                        class Solution {'{'}<br />
                        &nbsp;&nbsp;public int solve() {'{'} ... {'}'}<br />
                        {'}'}<br />
                        <span className="text-nord8/60">```</span>
                        <p className="font-sans text-nord4/50 mt-2 mb-1">Option 2: Just paste code — auto-detected!</p>
                        <p className="font-sans text-[9px] text-nord4/15 mt-1">Supported: Python, Java, C++, JavaScript, TypeScript, Go, Rust</p>
                    </div>
                )}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-1 flex-wrap">
                        {TAGS.map(tag => (
                            <button key={tag} onClick={() => setNewTag(tag)}
                                className={`px-2 py-0.5 rounded-md text-[9px] font-medium border transition-all ${newTag === tag ? `${TAG_COLORS[tag]} border-current/20` : 'bg-nord2/10 text-nord4/20 border-nord3/5 hover:text-nord4/35'
                                    }`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleCreatePost} disabled={posting || !newPost.trim()}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${posting || !newPost.trim()
                            ? 'bg-nord3/10 text-nord4/12 cursor-not-allowed'
                            : 'bg-gradient-to-r from-nord8 to-nord9 text-nord0 hover:from-nord7 hover:to-nord8'
                            }`}>
                        {posting ? <div className="w-3 h-3 border-2 border-nord0/30 border-t-nord0 rounded-full animate-spin" /> : <Send size={11} />}
                        Post
                    </button>
                </div>
            </div>

            {/* Feed */}
            <div ref={feedRef} className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#4C566A #2E3440' }}>
                {loading && posts.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="w-6 h-6 border-2 border-nord8 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-xs text-nord4/25">Loading posts...</p>
                        </div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-16">
                        <MessageSquare size={28} className="text-nord3/15 mx-auto mb-2" />
                        <p className="text-sm text-nord4/20">No posts yet. Be the first!</p>
                    </div>
                ) : (
                    posts.map(post => (
                        <PostCard key={post.id} post={post} username={username}
                            showComments={expandedComments.has(post.id)} commentText={commentTexts[post.id] || ''}
                            onVote={(t) => handleVote(post.id, t)} onToggleComments={() => toggleComments(post.id)}
                            onCommentChange={(t) => setCommentTexts(prev => ({ ...prev, [post.id]: t }))}
                            onAddComment={() => handleAddComment(post.id)} onDelete={() => handleDeletePost(post.id)}
                        />
                    ))
                )}
                <div className="h-4" />
            </div>
        </div>
    );
}

// ============================================================
// PostCard
// ============================================================
function PostCard({ post, username, showComments, commentText, onVote, onToggleComments, onCommentChange, onAddComment, onDelete }: {
    post: CommunityPost; username: string; showComments: boolean; commentText: string;
    onVote: (t: 'up' | 'down') => void; onToggleComments: () => void;
    onCommentChange: (t: string) => void; onAddComment: () => void; onDelete: () => void;
}) {
    const score = post.upvotes.length - post.downvotes.length;
    const userVote = post.upvotes.includes(username) ? 'up' : post.downvotes.includes(username) ? 'down' : null;

    return (
        <div className="card-nord overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-3 pb-1.5 flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-nord8/25 to-nord10/25 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-nord8">{post.author[0].toUpperCase()}</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-nord5">@{post.author}</span>
                            {post.tag && <span className={`text-[8px] font-medium px-1.5 py-px rounded ${TAG_COLORS[post.tag] || TAG_COLORS.General}`}>{post.tag}</span>}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-nord4/15">
                            <Clock size={8} /> {timeAgo(post.createdAt)}
                        </div>
                    </div>
                </div>
                {post.author === username && (
                    <button onClick={onDelete} className="text-nord4/8 hover:text-nord11 transition-colors p-1"><Trash2 size={12} /></button>
                )}
            </div>

            {/* Content */}
            <div className="px-4 pb-2.5">
                <PostContent content={post.content} />
            </div>

            {/* Actions */}
            <div className="px-4 py-1.5 border-t border-nord3/6 flex items-center gap-1">
                <div className="flex items-center rounded-lg bg-nord0/20 border border-nord3/6">
                    <button onClick={() => onVote('up')}
                        className={`p-1.5 rounded-l-lg transition-colors ${userVote === 'up' ? 'text-nord14 bg-nord14/10' : 'text-nord4/15 hover:text-nord14 hover:bg-nord14/5'}`}>
                        <ThumbsUp size={12} />
                    </button>
                    <span className={`text-[10px] font-bold min-w-[18px] text-center ${score > 0 ? 'text-nord14' : score < 0 ? 'text-nord11' : 'text-nord4/15'}`}>{score}</span>
                    <button onClick={() => onVote('down')}
                        className={`p-1.5 rounded-r-lg transition-colors ${userVote === 'down' ? 'text-nord11 bg-nord11/10' : 'text-nord4/15 hover:text-nord11 hover:bg-nord11/5'}`}>
                        <ThumbsDown size={12} />
                    </button>
                </div>
                <button onClick={onToggleComments}
                    className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] transition-colors ${showComments ? 'text-nord8 bg-nord8/8' : 'text-nord4/15 hover:text-nord8 hover:bg-nord2/15'}`}>
                    <MessageSquare size={12} /> <span className="font-medium">{post.comments.length}</span>
                </button>
            </div>

            {/* Comments */}
            {showComments && (
                <div className="border-t border-nord3/6 bg-nord0/10">
                    {post.comments.length > 0 && (
                        <div className="px-4 py-2 space-y-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                            {post.comments.map(c => (
                                <div key={c.id} className="flex gap-2">
                                    <div className="w-5 h-5 rounded bg-nord2/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-[7px] font-bold text-nord4/25">{c.author[0].toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-semibold text-nord5">@{c.author}</span>
                                            <span className="text-[8px] text-nord4/12">{timeAgo(c.createdAt)}</span>
                                        </div>
                                        <p className="text-[11px] text-nord4/45 leading-relaxed">{c.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="px-4 py-2 border-t border-nord3/5">
                        <div className="flex gap-2">
                            <input value={commentText} onChange={e => onCommentChange(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onAddComment(); } }}
                                placeholder="Write a comment..."
                                className="flex-1 bg-nord2/10 border border-nord3/8 rounded-lg px-2.5 py-1.5 text-[11px] text-nord5 placeholder:text-nord3/15 focus:outline-none focus:ring-1 focus:ring-nord8/12" />
                            <button onClick={onAddComment} disabled={!commentText.trim()}
                                className={`px-2 py-1.5 rounded-lg transition-colors ${commentText.trim() ? 'bg-nord8/10 text-nord8 hover:bg-nord8/18' : 'bg-nord2/5 text-nord4/8'}`}>
                                <Send size={11} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
