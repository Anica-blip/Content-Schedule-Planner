/**
 * 3C Content Schedule Planner - Main Application
 */

let calendar;
let currentPost = null;
let selectedImageFile = null;

// ── datesSet debounce timer ────────────────────────────────────────────────────
// datesSet fires multiple times rapidly when switching views (FullCalendar
// internal re-renders). Without debouncing, each fire calls removeAllEvents()
// and re-fetches, causing a race condition where the last fire "wins" and
// wipes events loaded by a prior fire. 150ms settles all view-switch bursts.
let _datesSetTimer = null;

// Platform configuration with abbreviations and colors (matching dashboard)
const PLATFORMS = {
    instagram: { name: 'Instagram', abbr: 'IS', icon: '📸', color: '#e4405f' },
    facebook:  { name: 'Facebook',  abbr: 'FB', icon: '📘', color: '#1877f2' },
    linkedin:  { name: 'LinkedIn',  abbr: 'LK', icon: '💼', color: '#0077b5' },
    twitter:   { name: 'Twitter/X', abbr: 'TX', icon: '🐦', color: '#1da1f2' },
    youtube:   { name: 'YouTube',   abbr: 'YT', icon: '📺', color: '#ff0000' },
    tiktok:    { name: 'TikTok',    abbr: 'TK', icon: '🎵', color: '#000000' },
    telegram:  { name: 'Telegram',  abbr: 'TG', icon: '✈️', color: '#0088cc' },
    pinterest: { name: 'Pinterest', abbr: 'PI', icon: '📌', color: '#bd081c' },
    whatsapp:  { name: 'WhatsApp Business', abbr: 'WB', icon: '💬', color: '#25d366' },
    discord:   { name: 'Discord',   abbr: 'DC', icon: '🎮', color: '#5865f2' },
    forum:     { name: 'Forum',     abbr: 'FM', icon: '💭', color: '#ff6b35' }
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
    // NOTE: loadPosts() is no longer called here directly.
    // The calendar's datesSet callback fires immediately on render and
    // handles the initial load automatically.
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

        /*
         * FIX #5A — DO NOT override .fc-timegrid-event-harness
         * FullCalendar uses the harness to set left/right/width per event
         * column via inline styles. Any CSS override here breaks side-by-side
         * placement. Harness CSS removed entirely.
         */

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
            left:   'prev,next today',
            center: 'title',
            right:  'dayGridMonth,timeGridWeek,timeGridDay'
        },
        slotMinTime: '07:00:00',
        slotMaxTime: '22:00:00',
        editable:    true,
        selectable:  true,
        height:      'auto',
        initialDate: new Date(),
        nowIndicator: true,
        defaultTimedEventDuration: '00:30',
        eventMaxStack: 10,
        dayMaxEventRows: false,
        eventOrder: 'start',
        eventOverlap: true,

        // FIX #5B — false = FullCalendar splits overlapping events into
        // true side-by-side columns instead of cascading/stacking them.
        slotEventOverlap: false,

        displayEventTime: true,

        // ── datesSet: debounced to prevent race conditions ─────────────────────
        // FullCalendar fires datesSet multiple times in rapid succession when
        // switching views (month→week→day). Without debounce each fire calls
        // removeAllEvents() then re-fetches — the last fire wins and wipes
        // events from a prior fire. clearTimeout+setTimeout ensures only ONE
        // fetch runs after the burst settles (150ms covers all FC internal fires).
        datesSet: function(info) {
            clearTimeout(_datesSetTimer);
            _datesSetTimer = setTimeout(async () => {
                await loadPosts(info.startStr, info.endStr);
            }, 150);
        },

        viewDidMount: function(info) {
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
            const postId   = info.event.id;
            const startStr = info.event.startStr;
            const newDate  = startStr.split('T')[0];
            const newTime  = startStr.includes('T') ? startStr.split('T')[1].substring(0, 5) : null;
            await updatePostDateTime(postId, newDate, newTime);
        },
        eventContent: function(arg) {
            const post     = arg.event.extendedProps;
            const platform = PLATFORMS[post.platform] || { abbr: 'XX', color: '#9b59b6' };
            const view     = calendar.view.type;

            // ── Per-view sizing ────────────────────────────────────────────────
            const isMonth = view === 'dayGridMonth';
            const isWeek  = view === 'timeGridWeek';

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
            const bg          = 'rgba(45, 27, 78, 0.72)';
            const leftBorder  = platform.color;

            let html = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                    padding: ${padding};
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    background: ${bg};
                    backdrop-filter: blur(6px);
                    -webkit-backdrop-filter: blur(6px);
                    border-radius: 6px;
                    border-left: 3px solid ${leftBorder};
                    border: 1px solid rgba(155, 89, 182, 0.25);
                    border-left: 3px solid ${leftBorder};
                    overflow: hidden;
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
        },

        // ── Manual column positioning — bypasses FC native overlap algorithm ──────
        // FC's native splitting is unreliable with custom eventContent HTML.
        // Instead we pre-calculate colIndex/colTotal in loadPosts() and apply
        // precise harness geometry here after each event mounts in the DOM.
        //
        // Formula (timeGrid views only — week and day):
        //   available  = 96%  (2% margin each side of the day column)
        //   gap        = 2%   (space between containers)
        //   width      = (96 - gap × (colTotal-1)) / colTotal
        //   left       = 2 + colIndex × (width + gap)
        //
        // 1 event  → width 96%,    left 2%
        // 2 events → width 47%,    left 2% / 51%
        // 3 events → width 30.67%, left 2% / 34.67% / 67.33%
        // Month view is untouched — FC handles its own day-grid stacking fine.
        eventDidMount: function(info) {
            const view = info.view.type;
            if (view !== 'timeGridWeek' && view !== 'timeGridDay') return;

            const { colIndex, colTotal } = info.event.extendedProps;
            if (!colTotal || colTotal <= 1) return; // single event — no override needed

            const gap       = 2;
            const available = 96;
            const width     = (available - gap * (colTotal - 1)) / colTotal;
            const left      = 2 + colIndex * (width + gap);

            // The harness is the FC element that controls event position/width
            const harness = info.el.closest('.fc-timegrid-event-harness');
            if (!harness) return;

            harness.style.width              = `${width.toFixed(2)}%`;
            harness.style.left               = `${left.toFixed(2)}%`;
            harness.style.right              = 'auto';
            harness.style.insetInlineStart   = `${left.toFixed(2)}%`;
            harness.style.insetInlineEnd     = 'auto';
        }
    });
    calendar.render();
}

// ── FIX #4: now accepts startStr / endStr from datesSet callback ──────────────
// For localStorage fallback the date params are ignored (no range filtering needed
// since localStorage volumes are small). Supabase uses the exact visible range.
async function loadPosts(startStr, endStr) {
    console.log('Loading posts...', startStr, '→', endStr);
    let posts = [];
    
    if (supabaseAPI.initialized) {
        console.log('Supabase initialized, fetching from database');

        // FullCalendar's datesSet gives ISO strings with time component —
        // we only need the date portion for the Supabase query.
        const startDate = startStr ? startStr.split('T')[0] : null;
        const endDate   = endStr   ? endStr.split('T')[0]   : null;

        if (!startDate || !endDate) {
            console.warn('⚠️ No date range provided to loadPosts');
            return;
        }

        posts = await supabaseAPI.getPosts(startDate, endDate);
        console.log('Fetched', posts.length, 'posts from Supabase:', posts);
    } else {
        console.log('Supabase not initialized, using localStorage');
        posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        console.log('Loaded', posts.length, 'posts from localStorage:', posts);
    }
    
    calendar.removeAllEvents();
    console.log('Cleared all existing events');
    
    if (posts.length === 0) {
        console.warn('⚠️ No posts to display for this range');
        return;
    }

    // ── Pre-calculate column groups ────────────────────────────────────────────
    // Group posts that share the same date + time into a slot.
    // Each post gets colIndex (0-based position) and colTotal (size of its group).
    // eventDidMount uses these to manually position the harness with exact widths.
    const slotGroups = {}; // key: "YYYY-MM-DD_HH:MM" → array of post ids in order

    posts.forEach(post => {
        let dateOnly = post.scheduled_date;
        if (dateOnly && dateOnly.includes('T')) dateOnly = dateOnly.split('T')[0];
        const timeKey = post.scheduled_time ? post.scheduled_time.substring(0, 5) : 'allday';
        const slotKey = `${dateOnly}_${timeKey}`;
        if (!slotGroups[slotKey]) slotGroups[slotKey] = [];
        slotGroups[slotKey].push(post.id);
    });

    posts.forEach(post => {
        const platform = PLATFORMS[post.platform] || { color: '#9b59b6' };

        let dateOnly = post.scheduled_date;
        if (dateOnly && dateOnly.includes('T')) dateOnly = dateOnly.split('T')[0];

        const timeKey  = post.scheduled_time ? post.scheduled_time.substring(0, 5) : 'allday';
        const slotKey  = `${dateOnly}_${timeKey}`;
        const group    = slotGroups[slotKey];
        const colIndex = group.indexOf(post.id);
        const colTotal = group.length;

        let startDateTime = dateOnly;
        if (post.scheduled_time) {
            startDateTime = `${dateOnly}T${post.scheduled_time}`;
        }

        calendar.addEvent({
            id:              post.id,
            title:           post.title || (post.content?.substring(0, 30) + '...'),
            start:           startDateTime,
            backgroundColor: platform.color,
            borderColor:     platform.color,
            extendedProps: {
                platform: post.platform,
                title:    post.title,
                content:  post.content,
                time:     post.scheduled_time,
                colIndex,   // 0-based position within same-time group
                colTotal    // total events sharing this date + time
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
        // date may arrive as "2025-03-15T..." from a time-grid select — strip time
        document.getElementById('scheduledDate').value = date.split('T')[0];
    }
    
    // FIX #2 — imagePreview does not exist in the HTML modal; reference removed.
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
    const rawDate = post.scheduled_date || '';
    document.getElementById('scheduledDate').value = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
    document.getElementById('scheduledTime').value = post.scheduled_time || '';
    
    document.getElementById('postModal').classList.add('active');
}

function closePostModal() {
    document.getElementById('postModal').classList.remove('active');
    document.getElementById('postModal').style.display = '';
}

// FIX #2 — renamed from handleImageUrlInput to match the form's onsubmit="handlePostSubmit(event)"
async function handlePostSubmit(event) {
    event.preventDefault();

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
            // Re-fetch the current visible range so the calendar stays in sync
            const view  = calendar.view;
            await loadPosts(view.activeStart.toISOString(), view.activeEnd.toISOString());
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
        const view = calendar.view;
        await loadPosts(view.activeStart.toISOString(), view.activeEnd.toISOString());
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
            const view = calendar.view;
            await loadPosts(view.activeStart.toISOString(), view.activeEnd.toISOString());
            alert('Post deleted!');
        } else {
            alert('Failed to delete post');
        }
    } else {
        let posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        posts = posts.filter(p => p.id !== currentPost.id);
        localStorage.setItem('scheduledPosts', JSON.stringify(posts));
        
        closePostModal();
        const view = calendar.view;
        await loadPosts(view.activeStart.toISOString(), view.activeEnd.toISOString());
        alert('Post deleted!');
    }
}

async function updatePostDateTime(postId, newDate, newTime) {
    const update = { scheduled_date: newDate };
    if (newTime) update.scheduled_time = newTime;

    if (supabaseAPI.initialized) {
        await supabaseAPI.updatePost(postId, update);
    } else {
        let posts = JSON.parse(localStorage.getItem('scheduledPosts') || '[]');
        posts = posts.map(p => p.id === postId ? { ...p, ...update } : p);
        localStorage.setItem('scheduledPosts', JSON.stringify(posts));
    }

    const view = calendar.view;
    await loadPosts(view.activeStart.toISOString(), view.activeEnd.toISOString());
}

window.addEventListener('load', initApp);
