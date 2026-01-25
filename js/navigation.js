let navPanel = null;

function initNavigation() {
    createSupabaseIndicator();
    createNavPanel();
}

function createSupabaseIndicator() {
    const div = document.createElement('div');
    div.id = 'supabase-indicator';
    div.className = 'traffic-light connecting';
    div.innerHTML = '<svg viewBox="0 0 384 512" width="24"><circle cx="192" cy="160" r="40"/><circle cx="192" cy="256" r="40"/><circle cx="192" cy="352" r="40"/></svg>';
    document.querySelector('.header').appendChild(div);
}

function createNavPanel() {
    const panel = document.createElement('div');
    panel.id = 'nav-panel';
    panel.className = 'nav-panel';
    panel.innerHTML = `
        <div class="nav-toggle" onclick="toggleNavPanel()">
            <svg viewBox="0 0 640 512" width="24"><path d="M496 224c-79.59 0-144 64.41-144 144s64.41 144 144 144 144-64.41 144-144-64.41-144-144-144z"/></svg>
        </div>
        <div class="nav-content">
            <a href="#" class="nav-icon" title="Memos">
                <svg viewBox="0 0 448 512" width="24"><path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272z"/></svg>
            </a>
            <a href="#" class="nav-icon" title="Voice Memo">
                <svg viewBox="0 0 352 512" width="24"><path d="M176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96z"/></svg>
            </a>
            <a href="#" class="nav-icon" title="Chatroom">
                <svg viewBox="0 0 576 512" width="24"><path d="M192 496c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V320h-64v176z"/></svg>
            </a>
            <a href="#" class="nav-icon" title="AI Assistant">
                <svg viewBox="0 0 512 512" width="24"><path d="M512 0C460.22 3.56 96.44 38.2 71.01 287.61c-3.09 26.66-4.84 53.44-5.99 80.24l178.87-178.69c6.25-6.25 16.4-6.25 22.65 0z"/></svg>
            </a>
            <a href="#" class="nav-icon" title="Supabase">
                <svg viewBox="0 0 512 512" width="24"><path d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84z"/></svg>
            </a>
            <a href="#" class="nav-icon" title="Cloudflare">
                <svg viewBox="0 0 576 512" width="24"><path d="M519.442 288.651c-41.519 0-59.5 31.593-82.058 31.593C377.409 320.244 432 144 432 144z"/></svg>
            </a>
            <a href="#" class="nav-icon" title="Password Manager">
                <svg viewBox="0 0 512 512" width="24"><path d="M512 176.001C512 273.203 433.202 352 336 352c-11.22 0-22.19-1.062-32.827-3.069z"/></svg>
            </a>
            <a href="#" class="nav-icon mobile-view" title="Mobile View">
                <svg viewBox="0 0 320 512" width="24"><path d="M272 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48z"/></svg>
            </a>
            <a href="/" class="nav-icon" title="Back to Dashboard">
                <svg viewBox="0 0 512 512" width="24"><path d="M444.52 3.52L28.74 195.42c-47.97 22.39-31.98 92.75 19.19 92.75h175.91v175.91z"/></svg>
            </a>
        </div>
    `;
    document.body.appendChild(panel);
}

function toggleNavPanel() {
    const panel = document.getElementById('nav-panel');
    panel.classList.toggle('open');
}

window.addEventListener('load', initNavigation);
