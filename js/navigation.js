function initNavigation() {
    console.log('🔧 Initializing navigation...');
    updateSupabaseIndicator();
    
    // Verify panel exists in HTML
    const panel = document.getElementById('nav-panel');
    if (panel) {
        console.log('✅ Navigation panel found in HTML');
        const toggle = panel.querySelector('.nav-toggle');
        if (toggle) {
            console.log('✅ Toggle button found');
        } else {
            console.error('❌ Toggle button not found');
        }
    } else {
        console.error('❌ Navigation panel not found in HTML');
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
