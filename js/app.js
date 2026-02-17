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
        slotMinTime: '06:00:00',
        slotMaxTime: '21:00:00',
        editable: true,
        selectable: true,
        height: 'auto',
        eventMaxStack: 3,
        dayMaxEventRows: false,
        eventOrder: 'start',
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
            
            console.log('Rendering event:', post.title, 'View:', view, 'Thumbnail:', post.thumbnail);
            
            // Different layouts for month vs week/day
            const isMonthView = view === 'dayGridMonth';
            const imgSize = isMonthView ? '40px' : '25px';
            const fontSize = isMonthView ? '8.5px' : '7px';
            const timeFontSize = isMonthView ? '8px' : '6.5px';
            const badgeFontSize = isMonthView ? '7px' : '6px';
            const containerPadding = isMonthView ? '5px' : '2px';
            const gap = isMonthView ? '5px' : '2px';
            
            // Fixed-size container with flex layout
            let html = '<div style="display:flex; gap:' + gap + '; padding:' + containerPadding + '; align-items:flex-start; width:100%; height:100%; overflow:hidden; background:rgba(255,255,255,0.95); border-radius:6px; box-sizing:border-box;">';
            
            // Thumbnail (left side)
            if (post.thumbnail) {
                html += '<img src="' + post.thumbnail + '" alt="Post thumbnail" style="width:' + imgSize + '; height:' + imgSize + '; min-width:' + imgSize + '; min-height:' + imgSize + '; max-width:' + imgSize + '; max-height:' + imgSize + '; object-fit:cover; border-radius:4px; flex-shrink:0; display:block !important; border:1px solid rgba(0,0,0,0.1);" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">';
                html += '<div style="width:' + imgSize + '; height:' + imgSize + '; min-width:' + imgSize + '; min-height:' + imgSize + '; background:#e0e0e0; border-radius:4px; flex-shrink:0; display:none; align-items:center; justify-content:center; font-size:' + (isMonthView ? '18px' : '14px') + ';">📷</div>';
            } else {
                html += '<div style="width:' + imgSize + '; height:' + imgSize + '; min-width:' + imgSize + '; min-height:' + imgSize + '; background:#e0e0e0; border-radius:4px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:' + (isMonthView ? '18px' : '14px') + ';">📷</div>';
            }
            
            // Info (right side) - flexible width with wrapping
            html += '<div style="flex:1; min-width:0; display:flex; flex-direction:column; gap:1px; overflow:hidden;">';
            
            // Title (wraps to multiple lines) - dark text, word-wrap enabled
            html += '<div style="font-size:' + fontSize + '; font-weight:600; line-height:1.3; overflow:hidden; word-wrap:break-word; overflow-wrap:break-word; color:#1a0b2e; max-height:' + (isMonthView ? '26px' : '20px') + ';">' + (post.title || 'Untitled') + '</div>';
            
            // Time (if exists) - dark text
            if (post.time) {
                html += '<div style="font-size:' + timeFontSize + '; color:#1a0b2e; opacity:0.7; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + post.time + '</div>';
            }
            
            // Platform badge - positioned at bottom
            html += '<div style="display:inline-block; background:' + platform.color + '; color:white; font-size:' + badgeFontSize + '; font-weight:700; padding:2px 4px; border-radius:3px; width:fit-content; margin-top:auto; line-height:1;">' + platform.abbr + '</div>';
            
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
        let startDateTime = post.scheduled_date;
        if (post.scheduled_time) {
            startDateTime = post.scheduled_date + 'T' + post.scheduled_time;
        }
        
        console.log('➕ Adding event:', {
            id: post.id,
            title: post.title,
            date: startDateTime,
            platform: post.platform,
            image: post.image_url
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
                thumbnail: post.image_url
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
    selectedImageFile = null;
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
    
    if (post.image_url) {
        const preview = document.getElementById('imagePreview');
        preview.src = post.image_url;
        preview.style.display = 'block';
    }
    
    document.getElementById('postModal').classList.add('active');
}

function closePostModal() {
    document.getElementById('postModal').classList.remove('active');
    currentPost = null;
    selectedImageFile = null;
}

function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

async function handlePostSubmit(event) {
    event.preventDefault();
    
    const postId = document.getElementById('postId').value;
    const platform = document.getElementById('platform').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const scheduledDate = document.getElementById('scheduledDate').value;
    const scheduledTime = document.getElementById('scheduledTime').value;
    
    let imageUrl = currentPost?.image_url || null;
    
    if (selectedImageFile) {
        const uploadResult = await uploadImage(selectedImageFile);
        if (uploadResult.success) {
            imageUrl = uploadResult.url;
        }
    }
    
    const postData = {
        platform,
        title,
        content,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        image_url: imageUrl,
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

async function uploadImage(file) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'schedule-planner');
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    } catch (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
    }
}

window.addEventListener('load', initApp);
