/**
 * Sign out functionality
 */

async function signOut() {
    try {
        // Get Supabase credentials
        let url = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '';
        let key = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : '';
        
        if (!url || url === '') url = localStorage.getItem('supabase_url') || '';
        if (!key || key === '') key = localStorage.getItem('supabase_key') || '';
        
        if (url && key) {
            const client = supabase.createClient(url, key);
            const { error } = await client.auth.signOut();
            
            if (error) throw error;
        }
        
        // Clear user session data
        localStorage.removeItem('user_email');
        
        console.log('✅ Signed out successfully');
        
        // Redirect to login page
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('❌ Sign out failed:', error);
        // Still redirect to login even if sign out fails
        window.location.href = 'login.html';
    }
}
