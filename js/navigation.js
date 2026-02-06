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

window.addEventListener('load', initNavigation);
