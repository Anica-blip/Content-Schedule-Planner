function initNavigation() {
    console.log('🔧 Initializing navigation...');
    updateSupabaseIndicator();
    
    // Verify panel exists in HTML
    const panel = document.getElementById('nav-panel');
    if (panel) {
        console.log('✅ Navigation panel found in HTML');
    } else {
        console.error('❌ Navigation panel not found in HTML');
    }
    
    // Verify toggle button exists (now in separate container)
    const toggle = document.getElementById('nav-toggle-btn');
    if (toggle) {
        console.log('✅ Toggle button found');
    } else {
        console.error('❌ Toggle button not found');
    }
    
    // Load and attach URLs to nav icons
    loadNavLinks();
}

function updateSupabaseIndicator() {
    const indicator = document.getElementById('supabase-indicator');
    if (indicator) {
        indicator.classList.add('connecting');
    }
}

function toggleNavPanel() {
    const panel = document.getElementById('nav-panel');
    if (panel) {
        panel.classList.toggle('open');
        console.log('Panel toggled, open:', panel.classList.contains('open'));
    }
}

// Load navigation links from localStorage
function loadNavLinks() {
    const links = JSON.parse(localStorage.getItem('navLinks') || '{}');
    
    // Map of emoji keys to their corresponding nav icons
    const navMapping = {
        'memos': 0,
        'voice': 1,
        'chatroom': 2,
        'ai': 3,
        'supabase': 4,
        'railway': 5,
        'password': 6,
        'mobile': 7,
        'dashboard': 8
    };
    
    // Get all nav icons
    const navIcons = document.querySelectorAll('.nav-icon');
    
    // Attach URLs to nav icons
    Object.keys(navMapping).forEach(key => {
        if (links[key]) {
            const index = navMapping[key];
            const icon = navIcons[index];
            
            if (icon) {
                // Store the URL in a data attribute
                icon.dataset.url = links[key];
                
                // Update click handler to open URL
                icon.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = icon.dataset.url;
                    if (url) {
                        window.open(url, '_blank');
                    }
                });
            }
        }
    });
}

window.addEventListener('load', initNavigation);
