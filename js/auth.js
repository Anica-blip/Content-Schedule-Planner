/**
 * auth.js — Record Centre session for the Content Schedule Planner
 * 3C Content Schedule Planner · 3C Thread To Success™
 *
 * Plain global script, not an ES module — matches every other file in
 * this repo (app.js, supabaseAPI.js).
 *
 * Mirrors Record Centre's own auth.js exactly: same token, same storage
 * key, same Bearer pattern. The one difference is redirectToLogin() adds
 * ?app=planner, so the Worker's /auth/callback knows to send the token
 * back here instead of to Record Centre's own front-end.
 */

const RC_API_BASE  = 'https://recordmanagement.threadcommand.center';
const RC_TOKEN_KEY = '3c_session_token'; // must match Record Centre exactly

function getRecordCentreToken() {
    return localStorage.getItem(RC_TOKEN_KEY);
}

function setRecordCentreToken(token) {
    localStorage.setItem(RC_TOKEN_KEY, token);
}

function clearRecordCentreToken() {
    localStorage.removeItem(RC_TOKEN_KEY);
}

// Catches the token handed back in the URL fragment (#token=...) after
// the GitHub OAuth round trip, then cleans the URL so it doesn't linger.
function captureRecordCentreTokenFromUrl() {
    if (!window.location.hash.startsWith('#token=')) return;
    const token = window.location.hash.slice('#token='.length);
    setRecordCentreToken(token);
    history.replaceState(null, '', window.location.pathname);
}

async function checkRecordCentreSession() {
    captureRecordCentreTokenFromUrl();
    const token = getRecordCentreToken();
    if (!token) return null;

    try {
        const res = await fetch(`${RC_API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            clearRecordCentreToken();
            return null;
        }
        const data = await res.json();
        return data.user;
    } catch {
        return null;
    }
}

// Guard for index.html — redirects to login.html if there's no valid
// session. Call this before rendering anything else.
async function requireRecordCentreSession() {
    const user = await checkRecordCentreSession();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// Guard for login.html itself — skip straight to the app if already logged in.
async function redirectIfRecordCentreLoggedIn() {
    const user = await checkRecordCentreSession();
    if (user) {
        window.location.href = 'index.html';
    }
}

// ?app=planner is read by the Worker's handleLogin() to know which
// front-end to bounce the token back to after GitHub auth completes.
function redirectToRecordCentreLogin() {
    window.location.href = `${RC_API_BASE}/auth/login?app=planner`;
}

function logoutRecordCentre() {
    clearRecordCentreToken();
    window.location.href = 'login.html';
}
