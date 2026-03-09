// ============================================================
// Firebase Auth SDK — GitHub OAuth Sign-In
// Uses Firebase SDK only for Authentication (GitHub OAuth)
// Firestore operations remain REST-based in firebase.ts
// ============================================================

import { initializeApp, getApps } from 'firebase/app';
import {
    getAuth,
    GithubAuthProvider,
    signInWithPopup,
    signOut,
    type UserCredential,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: 'AIzaSyDhN5allGCmhJ9M0GR3RF7rL0e4CmGXRZU',
    authDomain: 'skill-dsa.firebaseapp.com',
    projectId: 'skill-dsa',
    storageBucket: 'skill-dsa.appspot.com',
    messagingSenderId: '000000000000', // placeholder — not needed for auth
    appId: '1:000000000000:web:0000000000000000000000', // placeholder
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const githubProvider = new GithubAuthProvider();

// Request email scope from GitHub
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');

export interface GitHubUserInfo {
    uid: string;
    displayName: string;
    email: string;
    photoURL: string;
    githubUsername: string; // extracted from GitHub profile
}

/**
 * Sign in with GitHub via popup.
 * Returns GitHub user info on success, null on cancel/failure.
 */
export async function signInWithGitHub(): Promise<GitHubUserInfo | null> {
    try {
        const result: UserCredential = await signInWithPopup(auth, githubProvider);
        const user = result.user;

        // Extract GitHub username from the provider data
        const githubData = user.providerData.find(
            (p) => p.providerId === 'github.com'
        );

        // Try to get the GitHub username from the additional user info
        const credential = GithubAuthProvider.credentialFromResult(result);
        let githubUsername = '';

        // The display name from GitHub is usually the full name
        // The GitHub username can be found in the additionalUserInfo
        // We'll use the uid-based approach as a fallback
        if (githubData?.uid) {
            githubUsername = githubData.uid; // GitHub numeric ID
        }

        // Try fetching the actual GitHub username from the access token
        if (credential?.accessToken) {
            try {
                const ghResponse = await fetch('https://api.github.com/user', {
                    headers: { Authorization: `Bearer ${credential.accessToken}` },
                });
                if (ghResponse.ok) {
                    const ghUser = await ghResponse.json();
                    githubUsername = ghUser.login || githubUsername;
                }
            } catch {
                // Fallback to uid
            }
        }

        return {
            uid: user.uid,
            displayName: user.displayName || githubUsername || 'GitHub User',
            email: user.email || githubData?.email || '',
            photoURL: user.photoURL || githubData?.photoURL || '',
            githubUsername,
        };
    } catch (error: unknown) {
        const err = error as { code?: string; message?: string };
        // User closed popup or denied access
        if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
            return null;
        }
        console.error('GitHub sign-in error:', err.code, err.message);
        throw error;
    }
}

/**
 * Sign out from Firebase Auth.
 */
export async function signOutFirebase(): Promise<void> {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Firebase sign-out error:', error);
    }
}

export { auth };
