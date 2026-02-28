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
    twitter: { name: 'Twitter/X', abbr: 'TX', icon: '🐦', color: '#1da1f2' },
    youtube: { name: 'YouTube', abbr: 'YT', icon: '📺', color: '#ff0000' },
    tiktok: { name: 'TikTok', abbr: 'TK', icon: '🎵', color: '#000000' },
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

    // ── Session guard — runs after client is ready ─────────────────────────
    if (supabaseAPI.client) {
        const { data: { session } } = await supabaseAPI.client.auth.getSession();
        if (!session) {
            console.warn('⚠️ No session — redirecting to login');
            window.location.href = 'login.html';
            return;
        }
    }
    
    injectCalendarStyles();
    initCalendar();
    await loadPosts();
    console.log('✅ App initialized');
}

// ─── Injected CSS for modern calendar event styling ───────────────────────────
function injectCalendarStyles() {
    const style = document.createElement('style');
    style.id = '3c-calendar-styles';
    style.textContent = `
        /* ── WEEK/DAY VIEW: natural column sizing, compact cards ─────────────── */
        .fc-timegrid-event {
            border-radius: 6px !important;
            min-height: 20px !important;
            overflow: visible !important;
        }
        .fc-timegrid-event .fc-event-main {
            padding: 0 !important;
            overflow: visible !important;
        }
        /* Ensure overlapping events split width evenly and stay readable */
        .fc-timegrid-event-harness {
            overflow: visible !important;
        }

        /* ── ALL VIEWS: remove default FullCalendar event background ─────── */
        .fc-event {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }
        .fc-event-main {
            overflow: visible !important;
        }
        .fc-daygrid-event {
            white-space: normal !important;
            overflow: visible !important;
        }
    `;
    document.head.appendChild(style);
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
        initialDate: new Date(),
        nowIndicator: true,
        defaultTimedEventDuration: '00:30',
        eventMaxStack: 10,
        dayMaxEventRows: false,
        eventOrder: 'start',
        eventOverlap: true,
        displayEventTime: true,
        slotEventOverlap: true,
        viewDidMount: function(info) {
            // When switching to day view, always jump to today
            if (info.view.type === 'timeGridDay') {
                calendar.today();
            }
        },
        select: function(info) {
            openCreatePostModal(info.startStr);
        },
        eventClick: function(info) {
            openEditPostModal(info.event.id);
        },
        eventDrop: async function(info) {
            const postId  = info.event.id;
            const startStr = info.event.startStr; // e.g. "2025-01-15T14:30:00"
            const newDate  = startStr.split('T')[0];
            // Extract time if present (week/day view drag gives a full datetime)
            const newTime  = startStr.includes('T') ? startStr.split('T')[1].substring(0, 5) : null;
            await updatePostDateTime(postId, newDate, newTime);
        },
        eventContent: function(arg) {
            const post = arg.event.extendedProps;
            const platform = PLATFORMS[post.platform] || { abbr: 'XX', color: '#9b59b6' };
            const view = calendar.view.type;

            // ── Per-view sizing ────────────────────────────────────────────────
            const isMonth = view === 'dayGridMonth';
            const isWeek  = view === 'timeGridWeek';
            const isDay   = view === 'timeGridDay';

            let fontSize, timeFontSize, badgeFontSize, padding, showTime;

            if (isMonth) {
                fontSize      = '9px';
                timeFontSize  = '8px';
                badgeFontSize = '7px';
                padding       = '3px 4px';
                showTime      = !!post.time;
            } else if (isWeek) {
                fontSize      = '9px';
                timeFontSize  = '8px';
                badgeFontSize = '7px';
                padding       = '3px 4px';
                showTime      = !!post.time;
            } else {
                // Day view
                fontSize      = '10px';
                timeFontSize  = '9px';
                badgeFontSize = '8px';
                padding       = '4px 6px';
                showTime      = !!post.time;
            }

            // ── Dark purple transparent glassmorphism card ─────────────────────
            // #2d1b4e = rgb(45,27,78) — matches the app's "Medium Purple (Cards)"
            const bg = 'rgba(45, 27, 78, 0.72)';
            const leftBorder = platform.color;

            let html = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    padding: ${padding};
                    width: 100%;
                    height: auto;
                    box-sizing: border-box;
                    background: ${bg};
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    border-radius: 6px;
                    border-left: 3px solid ${leftBorder};
                    border: 1px solid rgba(155, 89, 182, 0.25);
                    border-left: 3px solid ${leftBorder};
                    overflow: visible;
                ">
                    <div style="
                        font-size: ${fontSize};
                        font-weight: 600;
                        line-height: 1.2;
                        color: #e8d5ff;
                        white-space: normal;
                        word-break: break-word;
                    ">${post.title || 'Untitled'}</div>`;

            if (showTime) {
                html += `
                    <div style="
                        font-size: ${timeFontSize};
                        color: rgba(232, 213, 255, 0.8);
                        line-height: 1.2;
                    ">🕐 ${post.time}</div>`;
            }

            html += `
                    <div style="display: inline-block; width: fit-content; margin-top: 1px;">
                        <span style="
                            background: ${platform.color};
                            color: #fff;
                            padding: 1px 5px;
                            border-radius: 3px;
                            font-size: ${badgeFontSize};
                            font-weight: 700;
                            letter-spacing: 0.5px;
                            white-space: nowrap;
                            display: inline-block;
                        ">${platform.abbr}</span>
                    </div>
                </div>`;

            return { html };
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
        const endOfMonth   = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        posts = await supabaseAPI.getPosts(
            startOfMonth.toISOString().split('T')[0],
            endOfMonth.toISOString().split('T')[0]
        );
        console.log('📊 Fetched', posts.length, 'posts from Supabase:', posts);
    } else {
        console.log('⚠️ Supabase not initialized, using localStorage');
        posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        console.log('📊 Loaded', posts.length, 'posts from localStorage:', posts);
    }
    
    calendar.removeAllEvents();
    console.log('🗑️ Cleared all existing events');
    
    if (posts.length === 0) {
        console.warn('⚠️ No posts to display');
        return;
    }

    // ── Day-view same-time stacking fix ────────────────────────────────────────
    // Track how many events share the same date + time slot.
    // Each duplicate gets +3 min offset so FullCalendar renders them side-by-side
    // rather than stacked. This is DISPLAY ONLY — stored data is never touched.
    const timeUsage = {}; // key: "YYYY-MM-DD_HH:MM" → count of events seen so far

    posts.forEach(post => {
        const platform = PLATFORMS[post.platform] || { color: '#9b59b6' };

        // Normalise the date
        let dateOnly = post.scheduled_date;
        if (dateOnly && dateOnly.includes('T')) {
            dateOnly = dateOnly.split('T')[0];
        }

        // Build start — use exact stored time, no offset
        let startDateTime = dateOnly;
        if (post.scheduled_time) {
            startDateTime = `${dateOnly}T${post.scheduled_time}`;
        }

        console.log('➕ Adding event:', {
            id: post.id,
            title: post.title,
            start: startDateTime,
            platform: post.platform
        });

        calendar.addEvent({
            id: post.id,
            title: post.title || (post.content?.substring(0, 30) + '...'),
            start: startDateTime,
            backgroundColor: platform.color,
            borderColor: platform.color,
            extendedProps: {
                platform: post.platform,
                title:    post.title,
                content:  post.content,
                time:     post.scheduled_time
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
    
    if (supabaseAPI.initialized) {
        post = await supabaseAPI.getPost(postId);
    } else {
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
    
    document.getElementById('platform').value      = post.platform       || '';
    document.getElementById('title').value         = post.title          || '';
    document.getElementById('content').value       = post.content        || '';
    // Normalise date — Supabase may return "2025-01-15T00:00:00.000Z", input needs "YYYY-MM-DD"
    const rawDate = post.scheduled_date || '';
    document.getElementById('scheduledDate').value = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
    document.getElementById('scheduledTime').value = post.scheduled_time || '';
    
    document.getElementById('postModal').classList.add('active');
}

function closePostModal() {
    document.getElementById('postModal').classList.remove('active');
    document.getElementById('postModal').style.display = '';
}

async function handleImageUrlInput(event) {
    const postId        = document.getElementById('postId').value;
    const platform      = document.getElementById('platform').value;
    const title         = document.getElementById('title').value;
    const content       = document.getElementById('content').value;
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
        postData.id         = postId || 'post_' + Date.now();
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
        let posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        posts = posts.filter(p => p.id !== currentPost.id);
        localStorage.setItem('scheduledPosts', JSON.stringify(posts));
        
        closePostModal();
        await loadPosts();
        alert('Post deleted!');
    }
}

async function updatePostDateTime(postId, newDate, newTime) {
    // Build update payload — always save date; only overwrite time if the drag gave us one
    const update = { scheduled_date: newDate };
    if (newTime) update.scheduled_time = newTime;

    if (supabaseAPI.initialized) {
        await supabaseAPI.updatePost(postId, update);
    } else {
        let posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        posts = posts.map(p => p.id === postId ? { ...p, ...update } : p);
        localStorage.setItem('scheduledPosts', JSON.stringify(posts));
    }
    // Reload so the card display time reflects the new position
    await loadPosts();
}

window.addEventListener('load', initApp);
