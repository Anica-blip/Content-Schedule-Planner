/**
 * 3C Content Schedule Planner - Main Application
 */

let calendar;
let currentPost = null;
let selectedImageFile = null;

// Platform configuration with icons and colors
const PLATFORMS = {
    facebook: { name: 'Facebook', icon: '📘', color: '#1877f2' },
    twitter: { name: 'Twitter/X', icon: '🐦', color: '#1da1f2' },
    instagram: { name: 'Instagram', icon: '📸', color: '#e4405f' },
    linkedin: { name: 'LinkedIn', icon: '💼', color: '#0077b5' },
    tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' },
    youtube: { name: 'YouTube', icon: '📺', color: '#ff0000' },
    telegram: { name: 'Telegram', icon: '✈️', color: '#0088cc' },
    pinterest: { name: 'Pinterest', icon: '📌', color: '#bd081c' }
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
        editable: true,
        selectable: true,
        height: 'auto',
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
            const platform = PLATFORMS[post.platform] || { icon: '📝', color: '#9b59b6' };
            
            let html = '<div style="padding:4px;">';
            html += '<div style="font-size:16px; margin-bottom:2px;">' + platform.icon + '</div>';
            if (post.thumbnail) {
                html += '<img src="' + post.thumbnail + '" style="width:100%; height:40px; object-fit:cover; border-radius:4px; margin-bottom:4px;">';
            }
            html += '<div style="font-size:11px; font-weight:600; line-height:1.2;">' + (post.title || 'Untitled') + '</div>';
            if (post.time) {
                html += '<div style="font-size:10px; opacity:0.8; margin-top:2px;">⏰ ' + post.time + '</div>';
            }
            html += '</div>';
            
            return { html: html };
        }
    });
    calendar.render();
}

async function loadPosts() {
    let posts = [];
    
    // Try Supabase first
    if (supabaseAPI.initialized) {
        const currentDate = calendar.getDate();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        posts = await supabaseAPI.getPosts(
            startOfMonth.toISOString().split('T')[0],
            endOfMonth.toISOString().split('T')[0]
        );
    } else {
        // Fallback to localStorage
        posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
    }
    
    calendar.removeAllEvents();
    
    posts.forEach(post => {
        const platform = PLATFORMS[post.platform] || { color: '#9b59b6' };
        
        calendar.addEvent({
            id: post.id,
            title: post.title || post.content?.substring(0, 30) + '...',
            start: post.scheduled_date,
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
