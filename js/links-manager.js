/**
 * Links Manager - Secure page for managing navigation URLs
 */

let isAuthenticated = false;

// Simple password check (change this password!)
const MANAGER_PASSWORD = 'chef2024';

function checkAuth() {
    // Check if already authenticated in this session
    const authSession = sessionStorage.getItem('linksManagerAuth');
    if (authSession === 'authenticated') {
        isAuthenticated = true;
        showManager();
        loadLinks();
        return true;
    }
    return false;
}

function authenticateWithPassword() {
    const input = document.getElementById('password-input');
    const password = input.value.trim();
    
    if (!password) {
        showAuthMessage('Please enter password', 'error');
        return;
    }
    
    if (password === MANAGER_PASSWORD) {
        // Store auth in session (cleared when browser closes)
        sessionStorage.setItem('linksManagerAuth', 'authenticated');
        isAuthenticated = true;
        showManager();
        loadLinks();
        showAuthMessage('Access granted!', 'success');
    } else {
        showAuthMessage('Incorrect password', 'error');
        input.value = '';
        input.focus();
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
    
    const authBtn = document.getElementById('auth-btn');
    const passwordInput = document.getElementById('password-input');
    
    authBtn.addEventListener('click', authenticateWithPassword);
    
    // Allow Enter key to submit password
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            authenticateWithPassword();
        }
    });
});
