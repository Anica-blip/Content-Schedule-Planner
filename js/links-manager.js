/**
 * Links Manager - Secure page for managing navigation URLs
 */

let supabaseClient = null;
let isAuthenticated = false;

function initSupabase() {
    const url = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '';
    const key = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : '';
    
    if (url && key) {
        supabaseClient = supabase.createClient(url, key);
        return true;
    }
    return false;
}

async function checkAuth() {
    if (!initSupabase()) return false;
    
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            isAuthenticated = true;
            showManager();
            loadLinks();
            return true;
        }
    } catch (error) {
        console.error('Auth failed:', error);
    }
    return false;
}

async function loginWithGitHub() {
    if (!initSupabase()) return;
    
    const btn = document.getElementById('auth-btn');
    btn.disabled = true;
    btn.textContent = 'Redirecting...';
    
    try {
        await supabaseClient.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: window.location.href }
        });
    } catch (error) {
        showAuthMessage(error.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Sign in with GitHub';
    }
}

function showManager() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('manager-screen').style.display = 'block';
}

function showAuthMessage(msg, type) {
    const div = document.getElementById('auth-message');
    div.textContent = msg;
    div.className = `message ${type} show`;
    setTimeout(() => div.classList.remove('show'), 5000);
}

function showMessage(msg, type) {
    const div = document.getElementById('message');
    div.textContent = msg;
    div.className = `message ${type} show`;
    setTimeout(() => div.classList.remove('show'), 3000);
}

function loadLinks() {
    const links = JSON.parse(localStorage.getItem('navLinks') || '{}');
    Object.keys(links).forEach(key => {
        const input = document.querySelector(`input[data-key="${key}"]`);
        if (input) input.value = links[key];
    });
}

function saveLink(key) {
    if (!isAuthenticated) return showMessage('Auth required', 'error');
    
    const input = document.querySelector(`input[data-key="${key}"]`);
    const url = input.value.trim();
    
    if (!url) return showMessage('Enter URL', 'error');
    
    try {
        new URL(url);
    } catch (e) {
        return showMessage('Invalid URL', 'error');
    }
    
    const links = JSON.parse(localStorage.getItem('navLinks') || '{}');
    links[key] = url;
    localStorage.setItem('navLinks', JSON.stringify(links));
    
    showMessage(`✓ ${key} saved!`, 'success');
}

function editLink(key) {
    if (!isAuthenticated) return showMessage('Auth required', 'error');
    const input = document.querySelector(`input[data-key="${key}"]`);
    input.focus();
    showMessage(`Editing ${key}...`, 'success');
}

function deleteLink(key) {
    if (!isAuthenticated) return showMessage('Auth required', 'error');
    if (!confirm(`Delete ${key}?`)) return;
    
    const input = document.querySelector(`input[data-key="${key}"]`);
    input.value = '';
    
    const links = JSON.parse(localStorage.getItem('navLinks') || '{}');
    delete links[key];
    localStorage.setItem('navLinks', JSON.stringify(links));
    
    showMessage(`✓ ${key} deleted!`, 'success');
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    document.getElementById('auth-btn').addEventListener('click', loginWithGitHub);
});
