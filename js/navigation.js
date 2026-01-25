let navPanel = null;

function initNavigation() {
    createSupabaseIndicator();
    createNavPanel();
}

function createSupabaseIndicator() {
    const div = document.createElement('div');
    div.id = 'supabase-indicator';
    div.innerHTML = `
        <div class="traffic-light connecting">
            <svg viewBox="0 0 384 512">
                <path d="M384 192h-64v-37.88c37.2-13.22 64-48.38 64-90.12h-64V32c0-17.67-14.33-32-32-32H96C78.33 0 64 14.33 64 32v32H0c0 41.74 26.8 76.9 64 90.12V192H0c0 41.74 26.8 76.9 64 90.12V320H0c0 42.84 28.25 78.69 66.99 91.05C79.42 468.72 130.6 512 192 512s112.58-43.28 125.01-100.95C355.75 398.69 384 362.84 384 320h-64v-37.88c37.2-13.22 64-48.38 64-90.12zM192 416c-26.51 0-48-21.49-48-48s21.49-48 48-48 48 21.49 48 48-21.49 48-48 48zm0-128c-26.51 0-48-21.49-48-48s21.49-48 48-48 48 21.49 48 48-21.49 48-48 48zm0-128c-26.51 0-48-21.49-48-48s21.49-48 48-48 48 21.49 48 48-21.49 48-48 48z"/>
            </svg>
        </div>
    `;
    document.body.appendChild(div);
}

function createNavPanel() {
    const panel = document.createElement('div');
    panel.id = 'nav-panel';
    panel.innerHTML = `
        <div class="nav-toggle" onclick="toggleNavPanel()">
            <svg viewBox="0 0 640 512">
                <path d="M496 224c-79.59 0-144 64.41-144 144s64.41 144 144 144 144-64.41 144-144-64.41-144-144-144zm64 150.29c0 5.34-4.37 9.71-9.71 9.71h-60.57c-5.34 0-9.71-4.37-9.71-9.71v-76.57c0-5.34 4.37-9.71 9.71-9.71h12.57c5.34 0 9.71 4.37 9.71 9.71V352h38.29c5.34 0 9.71 4.37 9.71 9.71v12.58z"/>
            </svg>
        </div>
        <div class="nav-content">
            <a href="#" class="nav-icon" title="Memos">
                <svg viewBox="0 0 448 512">
                    <path d="M0 464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192H0v272zm320-196c0-6.6 5.4-12 12-12h40c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12h-40c-6.6 0-12-5.4-12-12v-40z"/>
                </svg>
            </a>
            <a href="#" class="nav-icon" title="Voice Memo">
                <svg viewBox="0 0 352 512">
                    <path d="M336 192h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 376.89 48 317.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16z"/>
                </svg>
            </a>
            <a href="#" class="nav-icon" title="Chatroom">
                <svg viewBox="0 0 576 512">
                    <path d="M192 496c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V320h-64v176zm32-272h-50.9l-45.2-45.3C115.8 166.6 99.7 160 82.7 160H64c-17.1 0-33.2 6.7-45.3 18.8C6.7 190.9 0 207 0 224.1L.2 320 0 480c0 17.7 14.3 32 31.9 32z"/>
                </svg>
            </a>
            <a href="#" class="nav-icon" title="AI Assistant">
                <svg viewBox="0 0 512 512">
                    <path d="M512 0C460.22 3.56 96.44 38.2 71.01 287.61c-3.09 26.66-4.84 53.44-5.99 80.24l178.87-178.69c6.25-6.25 16.4-6.25 22.65 0s6.25 16.38 0 22.63L7.04 471.03c-9.38 9.37-9.38 24.57 0 33.94z"/>
                </svg>
            </a>
            <a href="#" class="nav-icon" title="Supabase">
                <svg viewBox="0 0 512 512">
                    <path d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12V76c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96z"/>
                </svg>
            </a>
            <a href="#" class="nav-icon" title="Cloudflare">
                <svg viewBox="0 0 576 512">
                    <path d="M519.442 288.651c-41.519 0-59.5 31.593-82.058 31.593C377.409 320.244 432 144 432 144s-196.288 80-196.288-3.297c0-35.827 36.288-46.25 36.288-85.985C272 19.216 243.885 0 210.539 0z"/>
                </svg>
            </a>
            <a href="#" class="nav-icon" title="Password Manager">
                <svg viewBox="0 0 512 512">
                    <path d="M512 176.001C512 273.203 433.202 352 336 352c-11.22 0-22.19-1.062-32.827-3.069l-24.012 27.014A23.999 23.999 0 0 1 261.223 384H224v40c0 13.255-10.745 24-24 24h-40v40c0 13.255-10.745 24-24 24H24z"/>
                </svg>
            </a>
            <a href="#" class="nav-icon mobile-view" title="Mobile View">
                <svg viewBox="0 0 320 512">
                    <path d="M272 0H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h224c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48zM160 480c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/>
                </svg>
            </a>
            <a href="/" class="nav-icon" title="Back to Dashboard">
                <svg viewBox="0 0 512 512">
                    <path d="M444.52 3.52L28.74 195.42c-47.97 22.39-31.98 92.75 19.19 92.75h175.91v175.91c0 51.17 70.36 67.17 92.75 19.19l191.9-415.78c15.99-38.39-25.59-79.97-63.97-63.97z"/>
                </svg>
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
