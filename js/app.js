/**
 * 3C Content Schedule Planner - Main Application
 */

let calendar;
let platforms = [];
let currentPost = null;
let selectedImageFile = null;
let workerUrl = '';

async function initApp() {
    console.log('🚀 Initializing 3C Content Schedule Planner...');
    
    const supabaseInit = await supabaseAPI.init();
    if (!supabaseInit) {
        alert('Failed to connect to database');
        return;
    }

    await loadPlatforms();
    initCalendar();
    await loadPosts();
    
    console.log('✅ App initialized');
}

async function loadPlatforms() {
    platforms = await supabaseAPI.getPlatforms();
    const platformSelect = document.getElementById('platform');
    platformSelect.innerHTML = '<option value="">Select platform...</option>';
    
    platforms.forEach(platform => {
        const option = document.createElement('option');
        option.value = platform.name;
        option.textContent = `${platform.icon_emoji} ${platform.display_name}`;
        platformSelect.appendChild(option);
    });
}

function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        editable: true,
        selectable: true,
        select: function(info) {
            openCreatePostModal(info.startStr);
        },
        eventClick: function(info) {
            openEditPostModal(info.event.id);
        },
        eventDrop: async function(info) {
            const postId = info.event.id;
            const newDate = info.event.startStr.split('T')[0];
            const result = await supabaseAPI.updatePost(postId, { scheduled_date: newDate });
            if (!result.success) {
                info.revert();
                alert('Failed to update date');
            }
        }
    });
    calendar.render();
}

async function loadPosts() {
    const currentDate = calendar.getDate();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const posts = await supabaseAPI.getPosts(
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
    );
    
    calendar.removeAllEvents();
    
    posts.forEach(post => {
        const platform = platforms.find(p => p.name === post.platform);
        const color = platform ? platform.color : '#9b59b6';
        
        calendar.addEvent({
            id: post.id,
            title: post.content.substring(0, 30) + '...',
            start: post.scheduled_date,
            backgroundColor: color,
            borderColor: color
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
    const post = await supabaseAPI.getPost(postId);
    if (!post) {
        alert('Failed to load post');
        return;
    }
    
    currentPost = post;
    document.getElementById('modalTitle').textContent = 'Edit Post';
    document.getElementById('postId').value = post.id;
    document.getElementById('deleteBtn').style.display = 'block';
    
    document.getElementById('platform').value = post.platform || '';
    document.getElementById('content').value = post.content || '';
    document.getElementById('scheduledDate').value = post.scheduled_date || '';
    
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
    const content = document.getElementById('content').value;
    const scheduledDate = document.getElementById('scheduledDate').value;
    
    let imageUrl = currentPost?.image_url || null;
    
    if (selectedImageFile) {
        const uploadResult = await uploadImage(selectedImageFile);
        if (uploadResult.success) {
            imageUrl = uploadResult.url;
        }
    }
    
    const postData = {
        platform,
        content,
        scheduled_date: scheduledDate,
        image_url: imageUrl,
        status: 'scheduled'
    };
    
    let result;
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
}

async function handleDeletePost() {
    if (!currentPost) return;
    if (!confirm('Delete this post?')) return;
    
    const result = await supabaseAPI.deletePost(currentPost.id);
    if (result.success) {
        closePostModal();
        await loadPosts();
        alert('Post deleted!');
    } else {
        alert('Failed to delete post');
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
