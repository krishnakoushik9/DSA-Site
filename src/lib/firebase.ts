// ============================================================
// Firebase Firestore REST API — No SDK, pure HTTPS calls
// Project: skill-dsa | Rules: open read/write
// ============================================================

const PROJECT_ID = 'skill-dsa';
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Save user data to Firestore.
 * Collection: "users", Document ID: username
 * Stores data as a JSON string + passcode hash.
 */
export async function saveToFirestore(
    username: string,
    data: Record<string, unknown>,
    passcodeHash?: string
): Promise<boolean> {
    try {
        const fields: Record<string, { stringValue: string }> = {
            data: { stringValue: JSON.stringify(data) },
            updatedAt: { stringValue: new Date().toISOString() },
            username: { stringValue: username },
        };

        const maskPaths = ['data', 'updatedAt', 'username'];

        // Include passcode hash if provided (first-time setup)
        if (passcodeHash) {
            fields.passcodeHash = { stringValue: passcodeHash };
            maskPaths.push('passcodeHash');
        }

        const maskQuery = maskPaths.map(path => `updateMask.fieldPaths=${path}`).join('&');
        const url = `${FIRESTORE_BASE}/users/${username}?${maskQuery}`;

        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields }),
        });

        if (!response.ok) {
            console.error('Firestore save failed:', response.status, await response.text());
            return false;
        }

        return true;
    } catch (error) {
        console.error('Firestore save error:', error);
        return false;
    }
}

/**
 * Load user data from Firestore.
 */
export async function loadFromFirestore(
    username: string
): Promise<{ data: Record<string, unknown>; passcodeHash: string } | null> {
    try {
        const url = `${FIRESTORE_BASE}/users/${username}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 404) {
            return null; // No data yet — new user
        }

        if (!response.ok) {
            console.error('Firestore load failed:', response.status);
            return null;
        }

        const doc = await response.json();

        const userData = doc.fields?.data?.stringValue
            ? JSON.parse(doc.fields.data.stringValue)
            : null;

        const passcodeHash = doc.fields?.passcodeHash?.stringValue || '';

        return { data: userData, passcodeHash };
    } catch (error) {
        console.error('Firestore load error:', error);
        return null;
    }
}

/**
 * Check if a user exists in Firestore.
 * Returns the passcode hash if found, null if not.
 */
export async function getUserPasscodeHash(username: string): Promise<string | null> {
    try {
        const url = `${FIRESTORE_BASE}/users/${username}`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) return null;

        const doc = await response.json();
        return doc.fields?.passcodeHash?.stringValue || null;
    } catch {
        return null;
    }
}

/**
 * Simple hash for 4-digit passcode.
 * Not cryptographically secure, but sufficient for a simple lock.
 */
export function hashPasscode(passcode: string): string {
    let hash = 0;
    const salt = 'dsa-tracker-2026';
    const str = salt + passcode + salt;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
}

/**
 * Get the total number of registered users.
 */
export async function getUserCount(): Promise<number> {
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runAggregationQuery`;
        const body = {
            structuredAggregationQuery: {
                structuredQuery: {
                    from: [{ collectionId: 'users' }]
                },
                aggregations: [{ count: { alias: 'total' } }]
            }
        };
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) return 1500; // Generic fallback

        const data = await response.json();
        const count = data[0]?.result?.aggregateFields?.total?.integerValue;
        return count ? parseInt(count, 10) : 1500;
    } catch {
        return 1500; // Fallback
    }
}

// ============================================================
// COMMUNITY API
// ============================================================

export interface CommunityPost {
    id: string;
    author: string;
    content: string;
    createdAt: string;
    upvotes: string[];   // usernames who upvoted
    downvotes: string[]; // usernames who downvoted
    comments: CommunityComment[];
    tag?: string;
}

export interface CommunityComment {
    id: string;
    author: string;
    content: string;
    createdAt: string;
}

/**
 * Create a new community post.
 */
export async function createPost(post: CommunityPost): Promise<boolean> {
    try {
        const url = `${FIRESTORE_BASE}/community/${post.id}`;
        const body = {
            fields: {
                data: { stringValue: JSON.stringify(post) },
            },
        };
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Load all community posts (most recent first).
 * Uses Firestore REST list endpoint.
 */
export async function loadPosts(): Promise<CommunityPost[]> {
    try {
        const url = `${FIRESTORE_BASE}/community?pageSize=100`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) return [];

        const result = await response.json();
        const docs = result.documents || [];

        const posts: CommunityPost[] = docs
            .map((doc: any) => {
                try {
                    return JSON.parse(doc.fields?.data?.stringValue || '{}');
                } catch {
                    return null;
                }
            })
            .filter((p: any) => p && p.id);

        // Sort by newest first
        posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return posts;
    } catch {
        return [];
    }
}

/**
 * Update a post (for votes, comments).
 */
export async function updatePost(post: CommunityPost): Promise<boolean> {
    return createPost(post); // Same PATCH endpoint
}

/**
 * Delete a post (author only).
 */
export async function deletePost(postId: string): Promise<boolean> {
    try {
        const url = `${FIRESTORE_BASE}/community/${postId}`;
        const response = await fetch(url, { method: 'DELETE' });
        return response.ok;
    } catch {
        return false;
    }
}

// ============================================================
// NOTIFICATIONS API
// ============================================================

export interface Notification {
    id: string;
    type: 'comment' | 'streak' | 'milestone' | 'system';
    message: string;
    from?: string;
    postId?: string;
    createdAt: string;
    read: boolean;
}

/**
 * Push a notification to a user.
 */
export async function pushNotification(toUsername: string, notification: Notification): Promise<boolean> {
    try {
        // Load existing notifications
        const existing = await loadNotifications(toUsername);
        const updated = [notification, ...existing].slice(0, 50); // keep last 50

        const url = `${FIRESTORE_BASE}/notifications/${toUsername}`;
        const body = {
            fields: {
                data: { stringValue: JSON.stringify(updated) },
            },
        };
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Load notifications for a user.
 */
export async function loadNotifications(username: string): Promise<Notification[]> {
    try {
        const url = `${FIRESTORE_BASE}/notifications/${username}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) return [];

        const doc = await response.json();
        const data = doc.fields?.data?.stringValue;
        if (!data) return [];
        return JSON.parse(data) as Notification[];
    } catch {
        return [];
    }
}

/**
 * Mark all notifications as read.
 */
export async function markNotificationsRead(username: string): Promise<boolean> {
    try {
        const existing = await loadNotifications(username);
        const updated = existing.map(n => ({ ...n, read: true }));

        const url = `${FIRESTORE_BASE}/notifications/${username}`;
        const body = {
            fields: {
                data: { stringValue: JSON.stringify(updated) },
            },
        };
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return response.ok;
    } catch {
        return false;
    }
}
// ============================================================
// CODES HISTORY API
// ============================================================

export interface SavedCode {
    id: string;
    username: string;
    code: string;
    language: string;
    result: string;
    timestamp: string;
    deviceIp: string;
}

/**
 * Save code to history.
 * Each document: codes/{unique_id}
 */
export async function saveCodeToHistory(savedCode: SavedCode): Promise<boolean> {
    try {
        const url = `${FIRESTORE_BASE}/codes/${savedCode.id}`;
        const body = {
            fields: {
                data: { stringValue: JSON.stringify(savedCode) },
                username: { stringValue: savedCode.username },
                timestamp: { stringValue: savedCode.timestamp },
            },
        };
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Load code history for a user.
 * Queries Firestore using runQuery for filtering.
 */
export async function loadCodeHistory(username: string): Promise<SavedCode[]> {
    try {
        const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
        const body = {
            structuredQuery: {
                from: [{ collectionId: 'codes' }],
                where: {
                    fieldFilter: {
                        field: { fieldPath: 'username' },
                        op: 'EQUAL',
                        value: { stringValue: username }
                    }
                },
                orderBy: [
                    {
                        field: { fieldPath: 'timestamp' },
                        direction: 'DESCENDING'
                    }
                ],
                limit: 50
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) return [];

        const results = await response.json();
        const codes: SavedCode[] = results
            .filter((r: any) => r.document)
            .map((r: any) => {
                try {
                    return JSON.parse(r.document.fields.data.stringValue);
                } catch {
                    return null;
                }
            })
            .filter((c: any) => c !== null);

        return codes;
    } catch {
        return [];
    }
}
// ============================================================
// COMPANY DATA API (Global Cache)
// ============================================================

/**
 * Save the global list of companies to Firestore.
 */
export async function saveCompanyList(companies: string[]): Promise<boolean> {
    try {
        const url = `${FIRESTORE_BASE}/companyData/list`;
        const body = {
            fields: {
                data: { stringValue: JSON.stringify(companies) },
                updatedAt: { stringValue: new Date().toISOString() },
            },
        };
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Load the global list of companies from Firestore.
 */
export async function loadCompanyList(): Promise<string[] | null> {
    try {
        const url = `${FIRESTORE_BASE}/companyData/list`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) return null;

        const doc = await response.json();
        const data = doc.fields?.data?.stringValue;
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

/**
 * Save questions for a specific company to Firestore.
 */
export async function saveCompanyQuestions(company: string, questions: any[]): Promise<boolean> {
    try {
        // Sanitize company name for use as document ID (Firestore IDs can't contain slashes)
        const docId = encodeURIComponent(company).replace(/\./g, '%2E');
        const url = `${FIRESTORE_BASE}/companyQuestions/${docId}`;
        const body = {
            fields: {
                company: { stringValue: company },
                data: { stringValue: JSON.stringify(questions) },
                updatedAt: { stringValue: new Date().toISOString() },
            },
        };
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        return response.ok;
    } catch {
        return false;
    }
}

/**
 * Load questions for a specific company from Firestore.
 */
export async function loadCompanyQuestions(company: string): Promise<any[] | null> {
    try {
        const docId = encodeURIComponent(company).replace(/\./g, '%2E');
        const url = `${FIRESTORE_BASE}/companyQuestions/${docId}`;
        const response = await fetch(url, { method: 'GET' });
        if (!response.ok) return null;

        const doc = await response.json();
        const data = doc.fields?.data?.stringValue;
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}
