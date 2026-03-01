/**
 * 3C Content Schedule Planner - Navigation
 *
 * FIX #3 — Security: nav link URLs are stored in a private JS Map keyed by
 * the icon element reference. Nothing is written into the DOM (no data-url
 * attributes, no href values). F12 → Elements will only show the emoji and
 * the title tooltip — no URLs are visible.
 */

// Private module-scoped Map: element reference → URL string
// Not accessible from the console unless you know the variable name
// AND the element reference. Never touches the DOM.
const _navLinkMap = new Map();

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

            // FIX #3 — Store URL in private JS Map keyed by the element reference.
            // Nothing is written to the DOM. No data-url, no href, no title change.
            // The click handler closes over the Map — F12 Elements shows zero URLs.
            _navLinkMap.set(freshIcon, link.url);

            freshIcon.addEventListener('click', (e) => {
                e.preventDefault();
                const url = _navLinkMap.get(freshIcon);
                if (url) {
                    window.open(url, '_blank', 'noopener,noreferrer');
                }
            });

            // Only log the key name to console — never the URL
            console.log(`✅ Nav link attached: ${link.key}`);
        });

    } catch (err) {
        console.error('❌ Nav links fetch error:', err);
    }
}

window.addEventListener('load', initNavigation);
