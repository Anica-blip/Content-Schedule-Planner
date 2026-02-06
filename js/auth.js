/**
 * Authentication module for 3C Content Schedule Planner
 * Handles login, logout, and session management with Supabase
 */

let supabaseClient = null;

function initSupabase() {
    const url = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '';
    const key = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : '';
    
    if (url && key && url !== '' && key !== '') {
        try {
            supabaseClient = supabase.createClient(url, key);
            console.log('✅ Supabase initialized');
            return true;
        } catch (error) {
            showError('Check config.js credentials');
            return false;
        }
    } else {
        showError('Configure config.js');
        return false;
    }
}

// Check if user is already logged in
async function checkSession() {
    if (!supabaseClient) {
        if (!initSupabase()) return false;
    }
    
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
            console.log('✅ User already logged in');
            // Redirect to main app
            window.location.href = 'index.html';
            return true;
        }
        return false;
    } catch (error) {
        console.error('❌ Session check failed:', error);
        return false;
    }
}

async function loginWithGitHub() {
    if (!supabaseClient && !initSupabase()) return;
    
    const btn = document.getElementById('github-login-btn');
    btn.disabled = true;
    btn.textContent = 'Redirecting...';
    
    try {
        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: window.location.origin + '/index.html' }
        });
        if (error) throw error;
    } catch (error) {
        showError(error.message);
        btn.disabled = false;
        btn.textContent = 'Sign in with GitHub';
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    successDiv.classList.remove('show');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const errorDiv = document.getElementById('error-message');
    const successDiv = document.getElementById('success-message');
    
    errorDiv.classList.remove('show');
    successDiv.textContent = message;
    successDiv.classList.add('show');
    
    setTimeout(() => {
        successDiv.classList.remove('show');
    }, 5000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    checkSession();
    
    // Initialize Supabase
    initSupabase();
    
    // GitHub login button
    document.getElementById('github-login-btn').addEventListener('click', loginWithGitHub);
});
