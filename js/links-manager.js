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
        // Use current URL to handle both GitHub Pages and custom domains
        const redirectUrl = window.location.href;
        
        await supabaseClient.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: redirectUrl }
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

async function loadLinks() {
    if (!supabaseClient) return;
    try {
        const { data, error } = await supabaseClient
            .from('navigation_links')
            .select('*');
        
        if (error) throw error;
        
        if (data) {
            data.forEach(link => {
                const input = document.querySelector(`input[data-key="${link.key}"]`);
                if (input) input.value = link.url;
            });
        }
    } catch (error) {
        console.error('Error loading links:', error);
        showMessage('Failed to load links', 'error');
    }
}

async function saveLink(key) {
    if (!isAuthenticated) return showMessage('Auth required', 'error');
    const input = document.querySelector(`input[data-key="${key}"]`);
    const url = input.value.trim();
    if (!url) return showMessage('Enter URL', 'error');
    try { new URL(url); } catch (e) { return showMessage('Invalid URL', 'error'); }
    
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const { error } = await supabaseClient
            .from('navigation_links')
            .upsert({ 
                key: key, 
                url: url,
                user_id: user.id,
                updated_at: new Date().toISOString()
            }, { onConflict: 'key,user_id' });
        
        if (error) throw error;
        showMessage(`✓ ${key} saved!`, 'success');
    } catch (error) {
        console.error('Error saving link:', error);
        showMessage('Failed to save link', 'error');
    }
}

function editLink(key) {
    if (!isAuthenticated) return showMessage('Auth required', 'error');
    document.querySelector(`input[data-key="${key}"]`).focus();
    showMessage(`Editing ${key}...`, 'success');
}

async function deleteLink(key) {
    if (!isAuthenticated) return showMessage('Auth required', 'error');
    if (!confirm(`Delete ${key}?`)) return;
    
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const { error } = await supabaseClient
            .from('navigation_links')
            .delete()
            .eq('key', key)
            .eq('user_id', user.id);
        
        if (error) throw error;
        document.querySelector(`input[data-key="${key}"]`).value = '';
        showMessage(`✓ ${key} deleted!`, 'success');
    } catch (error) {
        console.error('Error deleting link:', error);
        showMessage('Failed to delete link', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    document.getElementById('auth-btn').addEventListener('click', loginWithGitHub);
});
