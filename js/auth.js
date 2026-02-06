/**
 * Authentication module for 3C Content Schedule Planner
 * Handles login, logout, and session management with Supabase
 */

let supabaseClient = null;

// Initialize Supabase client
function initSupabase() {
    // Try to get credentials from config.js first
    let url = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '';
    let key = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : '';
    
    // If not in config.js, try localStorage
    if (!url || url === '') {
        url = localStorage.getItem('supabase_url') || '';
    }
    if (!key || key === '') {
        key = localStorage.getItem('supabase_key') || '';
    }
    
    // Pre-fill settings form if credentials exist
    if (url) document.getElementById('supabase-url').value = url;
    if (key) document.getElementById('supabase-key').value = key;
    
    if (url && key && url !== '' && key !== '') {
        try {
            supabaseClient = supabase.createClient(url, key);
            console.log('✅ Supabase client initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Supabase:', error);
            showError('Failed to initialize Supabase. Please check your credentials.');
            return false;
        }
    } else {
        showError('Please configure your Supabase credentials in Settings below.');
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

// Login function
async function login(email, password) {
    if (!supabaseClient) {
        if (!initSupabase()) return;
    }
    
    const loginBtn = document.getElementById('login-btn');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';
    
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        console.log('✅ Login successful');
        showSuccess('Login successful! Redirecting...');
        
        // Store session info
        localStorage.setItem('user_email', email);
        
        // Redirect to main app after short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
        
    } catch (error) {
        console.error('❌ Login failed:', error);
        showError(error.message || 'Login failed. Please check your credentials.');
        loginBtn.disabled = false;
        loginBtn.textContent = 'Sign In';
    }
}

// Save Supabase settings
function saveSettings() {
    const url = document.getElementById('supabase-url').value.trim();
    const key = document.getElementById('supabase-key').value.trim();
    
    if (!url || !key) {
        showError('Please enter both Supabase URL and Anon Key.');
        return;
    }
    
    // Validate URL format
    try {
        new URL(url);
    } catch (e) {
        showError('Invalid Supabase URL format. Should be like: https://xxxxx.supabase.co');
        return;
    }
    
    // Save to localStorage
    localStorage.setItem('supabase_url', url);
    localStorage.setItem('supabase_key', key);
    
    showSuccess('Settings saved! Please try logging in now.');
    
    // Reinitialize Supabase client
    initSupabase();
    
    // Hide settings panel
    document.getElementById('settings-panel').classList.remove('active');
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
    
    // Login form submission
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        login(email, password);
    });
    
    // Settings toggle
    document.getElementById('settings-toggle').addEventListener('click', (e) => {
        e.preventDefault();
        const panel = document.getElementById('settings-panel');
        panel.classList.toggle('active');
    });
    
    // Save settings button
    document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
});
