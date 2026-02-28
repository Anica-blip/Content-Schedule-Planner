function initNavigation() {
    console.log('🔧 Initializing navigation...');
    updateSupabaseIndicator();

    const panel = document.getElementById('nav-panel');
    if (panel) {
        console.log('✅ Navigation panel found in HTML');
    } else {
        console.error('❌ Navigation panel not found in HTML');
    }

    const toggle = document.getElementById('nav-toggle-btn');
    if (toggle) {
        console.log('✅ Toggle button found');
    } else {
        console.error('❌ Toggle button not found');
    }

    // Load links from Supabase and attach to nav icons
    loadNavLinksFromSupabase();
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

// Map of Supabase key values to nav icon position index
const NAV_MAPPING = {
    'memos':     0,
    'voice':     1,
    'chatroom':  2,
    'ai':        3,
    'supabase':  4,
    'railway':   5,
    'password':  6,
    'mobile':    7,
    'dashboard': 8
};

async function loadNavLinksFromSupabase() {
    // supabaseAPI is initialised in app.js — wait briefly if not ready yet
    if (!supabaseAPI || !supabaseAPI.client) {
        console.warn('⚠️ supabaseAPI not ready for nav links, retrying in 500ms...');
        setTimeout(loadNavLinksFromSupabase, 500);
        return;
    }

    try {
        const { data, error } = await supabaseAPI.client
            .from('navigation_links')
            .select('key, url');

        if (error) {
            console.error('❌ Failed to load nav links:', error);
            return;
        }

        if (!data || data.length === 0) {
            console.warn('⚠️ No navigation links found in Supabase');
            return;
        }

        const navIcons = document.querySelectorAll('.nav-icon');

        data.forEach(link => {
            const index = NAV_MAPPING[link.key];
            if (index === undefined) return;

            const icon = navIcons[index];
            if (!icon) return;

            // Clone to remove any pre-existing click listeners
            const freshIcon = icon.cloneNode(true);
            icon.parentNode.replaceChild(freshIcon, icon);

            freshIcon.dataset.url = link.url;
            freshIcon.addEventListener('click', (e) => {
                e.preventDefault();
                if (freshIcon.dataset.url) {
                    window.open(freshIcon.dataset.url, '_blank');
                }
            });

            console.log(`✅ Nav link attached: ${link.key} → ${link.url}`);
        });

    } catch (err) {
        console.error('❌ Nav links fetch error:', err);
    }
}

window.addEventListener('load', initNavigation);
