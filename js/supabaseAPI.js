/**
 * 3C Content Schedule Planner - Supabase API
 * Database operations for posts and platforms
 */

class SupabaseAPI {
    constructor() {
        this.supabaseUrl = null;
        this.supabaseKey = null;
        this.client = null;
        this.initialized = false;
    }

    async init() {
        try {
            // Get credentials from config.js only
            this.supabaseUrl = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : null;
            this.supabaseKey = typeof SUPABASE_ANON_KEY !== 'undefined' ? SUPABASE_ANON_KEY : null;

            if (!this.supabaseUrl || !this.supabaseKey || this.supabaseUrl === '' || this.supabaseKey === '') {
                console.warn('⚠️ Supabase credentials not configured in config.js');
                return false;
            }

            this.client = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            this.initialized = true;
            console.log('✅ Supabase initialized');
            return true;
        } catch (error) {
            console.error('❌ Supabase init failed:', error);
            return false;
        }
    }

    async getPlatforms() {
        if (!this.initialized) await this.init();
        const { data, error } = await this.client
            .from('platforms')
            .select('*')
            .eq('enabled', true)
            .order('name');
        if (error) {
            console.error('Error fetching platforms:', error);
            return [];
        }
        return data;
    }

    async getPosts(startDate, endDate) {
        if (!this.initialized) await this.init();
        const { data, error } = await this.client
            .from('posts')
            .select('*')
            .gte('scheduled_date', startDate)
            .lte('scheduled_date', endDate)
            .order('scheduled_date', { ascending: true });
        if (error) {
            console.error('Error fetching posts:', error);
            return [];
        }
        return data;
    }

    async getPost(postId) {
        if (!this.initialized) await this.init();
        const { data, error } = await this.client
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();
        if (error) {
            console.error('Error fetching post:', error);
            return null;
        }
        return data;
    }

    async createPost(postData) {
        if (!this.initialized) await this.init();
        const user = await this.getCurrentUser();
        if (!user) return { success: false, error: 'Not authenticated' };

        const { data, error } = await this.client
            .from('posts')
            .insert([{
                user_id: user.id,
                ...postData
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating post:', error);
            return { success: false, error: error.message };
        }
        return { success: true, data };
    }

    async updatePost(postId, postData) {
        if (!this.initialized) await this.init();
        const { data, error } = await this.client
            .from('posts')
            .update(postData)
            .eq('id', postId)
            .select()
            .single();

        if (error) {
            console.error('Error updating post:', error);
            return { success: false, error: error.message };
        }
        return { success: true, data };
    }

    async deletePost(postId) {
        if (!this.initialized) await this.init();
        const { error } = await this.client
            .from('posts')
            .delete()
            .eq('id', postId);

        if (error) {
            console.error('Error deleting post:', error);
            return { success: false, error: error.message };
        }
        return { success: true };
    }

    async getCurrentUser() {
        if (!this.initialized) await this.init();
        const { data: { user } } = await this.client.auth.getUser();
        return user;
    }
}

const supabaseAPI = new SupabaseAPI();
