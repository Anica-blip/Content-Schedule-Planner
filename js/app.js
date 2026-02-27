/**
 * 3C Content Schedule Planner - Main Application
 */

let calendar;
let currentPost = null;
let selectedImageFile = null;

// Platform configuration with abbreviations and colors (matching dashboard)
const PLATFORMS = {
    instagram: { name: 'Instagram', abbr: 'IS', icon: '📸', color: '#e4405f' },
    facebook: { name: 'Facebook', abbr: 'FB', icon: '📘', color: '#1877f2' },
    linkedin: { name: 'LinkedIn', abbr: 'LK', icon: '💼', color: '#0077b5' },
    twitter: { name: 'Twitter/X', abbr: 'TX', icon: '��', color: '#1da1f2' },
    youtube: { name: 'YouTube', abbr: 'YT', icon: '📺', color: '#ff0000' },
    tiktok: { name: 'TikTok', abbr: 'TK', icon: '��', color: '#000000' },
    telegram: { name: 'Telegram', abbr: 'TG', icon: '✈️', color: '#0088cc' },
    pinterest: { name: 'Pinterest', abbr: 'PI', icon: '📌', color: '#bd081c' },
    whatsapp: { name: 'WhatsApp Business', abbr: 'WB', icon: '💬', color: '#25d366' },
    discord: { name: 'Discord', abbr: 'DC', icon: '🎮', color: '#5865f2' },
    forum: { name: 'Forum', abbr: 'FM', icon: '💭', color: '#ff6b35' }
};

async function initApp() {
    console.log('🚀 Initializing 3C Content Schedule Planner...');
    
    const supabaseInit = await supabaseAPI.init();
    if (!supabaseInit) {
        console.warn('⚠️ Supabase not configured, using localStorage fallback');
    }
    
    initCalendar();
    await loadPosts();
    console.log('✅ App initialized');
}

function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        slotMinTime: '07:00:00',
        slotMaxTime: '22:00:00',
        editable: true,
        selectable: true,
        height: 'auto',
        eventMaxStack: 3,
        dayMaxEventRows: false,
        eventOrder: 'start',
        eventOverlap: true,
        displayEventTime: true,
        slotEventOverlap: true,
        select: function(info) {
            openCreatePostModal(info.startStr);
        },
        eventClick: function(info) {
            openEditPostModal(info.event.id);
        },
        eventDrop: async function(info) {
            const postId = info.event.id;
            const newDate = info.event.startStr.split('T')[0];
            await updatePostDate(postId, newDate);
        },
        eventContent: function(arg) {
            const post = arg.event.extendedProps;
            const platform = PLATFORMS[post.platform] || { abbr: 'XX', color: '#9b59b6' };
            const view = calendar.view.type;
            const isMonthView = view === 'dayGridMonth';
            
            const fontSize = isMonthView ? '10px' : '8px';
            const timeFontSize = isMonthView ? '9px' : '7px';
            const badgeFontSize = isMonthView ? '8px' : '7px';
            const padding = isMonthView ? '6px' : '4px';
            
            let html = '<div style="display:flex; flex-direction:column; gap:3px; padding:' + padding + '; width:100%; height:100%; overflow:hidden; background:rgba(75, 85, 180, 0.85); border-radius:6px; box-sizing:border-box; border-left:3px solid ' + platform.color + ';">';
            
            html += '<div style="font-size:' + fontSize + '; font-weight:600; line-height:1.3; color:#ffffff; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">' + (post.title || 'Untitled') + '</div>';
            
            html += '<div style="display:flex; gap:4px; align-items:center;">';
            if (post.time) {
                html += '<span style="font-size:' + timeFontSize + '; color:rgba(255,255,255,0.9);">🕐 ' + post.time + '</span>';
            }
            html += '<span style="background:' + platform.color + '; color:#fff; padding:1px 4px; border-radius:3px; font-size:' + badgeFontSize + '; font-weight:600; white-space:nowrap;">' + platform.abbr + '</span>';
            html += '</div></div>';
            
            return { html: html };
        }
    });
    calendar.render();
}

async function loadPosts() {
    console.log('📅 Loading posts...');
    let posts = [];
    
    // Try Supabase first
    if (supabaseAPI.initialized) {
        console.log('✅ Supabase initialized, fetching from database');
        const currentDate = calendar.getDate();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        console.log('📆 Date range:', startOfMonth.toISOString().split('T')[0], 'to', endOfMonth.toISOString().split('T')[0]);
        
        posts = await supabaseAPI.getPosts(
            startOfMonth.toISOString().split('T')[0],
            endOfMonth.toISOString().split('T')[0]
        );
        console.log('📊 Fetched', posts.length, 'posts from Supabase:', posts);
    } else {
        console.log('⚠️ Supabase not initialized, using localStorage');
        // Fallback to localStorage
        posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        console.log('📊 Loaded', posts.length, 'posts from localStorage:', posts);
    }
    
    calendar.removeAllEvents();
    console.log('🗑️ Cleared all existing events');
    
    if (posts.length === 0) {
        console.warn('⚠️ No posts to display');
        return;
    }
    
    posts.forEach(post => {
        const platform = PLATFORMS[post.platform] || { color: '#9b59b6' };
        
        // Create datetime for proper sorting
        // Extract just the date part (YYYY-MM-DD) from scheduled_date
        let dateOnly = post.scheduled_date;
        if (dateOnly.includes('T')) {
            dateOnly = dateOnly.split('T')[0];
        }
        
        // Build proper ISO datetime
        let startDateTime = dateOnly;
        if (post.scheduled_time) {
            startDateTime = dateOnly + 'T' + post.scheduled_time;
        }
        
        console.log('➕ Adding event:', {
            id: post.id,
            title: post.title,
            date: startDateTime,
            platform: post.platform,
        });
        
        calendar.addEvent({
            id: post.id,
            title: post.title || post.content?.substring(0, 30) + '...',
            start: startDateTime,
            backgroundColor: platform.color,
            borderColor: platform.color,
            extendedProps: {
                platform: post.platform,
                title: post.title,
                content: post.content,
                time: post.scheduled_time,
            }
        });
    });
    
    console.log('✅ Finished loading', posts.length, 'posts to calendar');
}

function openCreatePostModal(date = null) {
    currentPost = null;
    document.getElementById('modalTitle').textContent = 'Create New Post';
    document.getElementById('postForm').reset();
    document.getElementById('postId').value = '';
    document.getElementById('deleteBtn').style.display = 'none';
    
    if (date) {
        document.getElementById('scheduledDate').value = date;
    }
    
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('postModal').classList.add('active');
}

async function openEditPostModal(postId) {
    let post = null;
    
    // Try Supabase first
    if (supabaseAPI.initialized) {
        post = await supabaseAPI.getPost(postId);
    } else {
        // Fallback to localStorage
        const posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        post = posts.find(p => p.id === postId);
    }
    
    if (!post) {
        alert('Failed to load post');
        return;
    }
    
    currentPost = post;
    document.getElementById('modalTitle').textContent = 'Edit Post';
    document.getElementById('postId').value = post.id;
    document.getElementById('deleteBtn').style.display = 'block';
    
    document.getElementById('platform').value = post.platform || '';
    document.getElementById('title').value = post.title || '';
    document.getElementById('content').value = post.content || '';
    document.getElementById('scheduledDate').value = post.scheduled_date || '';
    document.getElementById('scheduledTime').value = post.scheduled_time || '';
    
    document.getElementById('postModal').classList.add('active');
}

function closePostModal() {
    document.getElementById('postModal').style.display = 'none';
    document.getElementById('imagePreview').style.display = 'none';
}

async function handleImageUrlInput(event) {
    const postId = document.getElementById('postId').value;
    const platform = document.getElementById('platform').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const scheduledDate = document.getElementById('scheduledDate').value;
    const scheduledTime = document.getElementById('scheduledTime').value;
    
    
    const postData = {
        platform,
        title,
        content,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        status: 'scheduled'
    };
    
    let result;
    
    // Try Supabase first
    if (supabaseAPI.initialized) {
        if (postId) {
            result = await supabaseAPI.updatePost(postId, postData);
        } else {
            result = await supabaseAPI.createPost(postData);
        }
        
        if (result.success) {
            closePostModal();
            await loadPosts();
            alert(postId ? 'Post updated!' : 'Post created!');
        } else {
            alert('Failed to save post: ' + result.error);
        }
    } else {
        // Fallback to localStorage
        postData.id = postId || 'post_' + Date.now();
        postData.created_at = currentPost?.created_at || new Date().toISOString();
        
        let posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        
        if (postId) {
            posts = posts.map(p => p.id === postId ? postData : p);
        } else {
            posts.push(postData);
        }
        
        localStorage.setItem('scheduledPosts', JSON.stringify(posts));
        
        closePostModal();
        await loadPosts();
        alert(postId ? 'Post updated!' : 'Post created!');
    }
}

async function handleDeletePost() {
    if (!currentPost) return;
    if (!confirm('Delete this post?')) return;
    
    let result;
    
    // Try Supabase first
    if (supabaseAPI.initialized) {
        result = await supabaseAPI.deletePost(currentPost.id);
        
        if (result.success) {
            closePostModal();
            await loadPosts();
            alert('Post deleted!');
        } else {
            alert('Failed to delete post');
        }
    } else {
        // Fallback to localStorage
        let posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        posts = posts.filter(p => p.id !== currentPost.id);
        localStorage.setItem('scheduledPosts', JSON.stringify(posts));
        
        closePostModal();
        await loadPosts();
        alert('Post deleted!');
    }
}

async function updatePostDate(postId, newDate) {
    // Try Supabase first
    if (supabaseAPI.initialized) {
        await supabaseAPI.updatePost(postId, { scheduled_date: newDate });
    } else {
        // Fallback to localStorage
        let posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        posts = posts.map(p => p.id === postId ? { ...p, scheduled_date: newDate } : p);
        localStorage.setItem('scheduledPosts', JSON.stringify(posts));
    }
}

window.addEventListener('load', initApp);
