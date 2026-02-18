# Jan AI Assistant Integration Guide

## Overview

Jan's AI Assistant chat has been integrated into the Content Schedule Planner as an overlay interface. This guide explains the integration and how to connect it with the 3c-content-scheduler repository.

---

## What's Been Added

### 1. **Jan's Profile Button**
- **Location**: Header (top-left, first button)
- **Design**: Circular profile image with orange border
- **Hover Effect**: Purple glow and scale animation
- **Function**: Opens Jan's chat overlay

### 2. **Chat Overlay Interface**
- **Design**: Modern, responsive chat window
- **Features**:
  - Profile header with Jan's avatar and online status
  - Scrollable message area
  - Quick action buttons for common tasks
  - Text input with send button
  - Smooth animations and transitions

### 3. **Quick Actions**
- 📝 **Content Ideas**: Brainstorm content suggestions
- 📅 **Schedule Help**: Get posting time recommendations
- ✨ **Review Content**: Request feedback on posts
- 💡 **Tips**: Get social media best practices

---

## Files Modified/Created

### Modified Files:
1. **`index.html`**
   - Added Jan's profile button to header
   - Added chat overlay HTML structure

2. **`css/styles.css`**
   - Added styles for profile button (circular, hover effects)
   - Added complete chat overlay styling
   - Responsive design for mobile

### New Files:
3. **`js/jan-chat.js`**
   - Chat functionality (open/close, send messages)
   - Quick action handlers
   - Message rendering
   - Placeholder AI responses

---

## Current Functionality

### ✅ Working Now:
- Click Jan's profile to open chat overlay
- Send messages via input or Enter key
- Quick action buttons populate input field
- Simulated AI responses based on keywords
- Smooth animations and transitions
- Click outside overlay to close
- Mobile responsive design

### ⏳ To Be Implemented:
- Connect to actual 3c-content-scheduler API
- Real AI responses from Claude/OpenAI
- Save chat history to Supabase
- Context awareness (current posts, schedule)
- Multi-voice persona switching (Aurion, Caelum, Anica)

---

## Integration with 3c-content-scheduler

The 3c-content-scheduler repository contains the full AI assistant logic. Here's how to integrate:

### Option 1: Iframe Embed (Simple)
```html
<!-- Replace chat body with iframe -->
<div class="jan-chat-body" id="janChatBody">
    <iframe 
        src="https://anica-blip.github.io/3c-content-scheduler/" 
        style="width: 100%; height: 100%; border: none;"
        allow="clipboard-write">
    </iframe>
</div>
```

### Option 2: API Integration (Recommended)
1. **Extract API from 3c-content-scheduler**
   - Create `/api/jan-chat.js` endpoint
   - Connect to Claude API or OpenAI
   - Implement character profiles (Anica, Caelum, Aurion)

2. **Update `jan-chat.js`**
```javascript
async function sendJanMessage() {
    const input = document.getElementById('janChatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addJanMessage(message, 'user');
    input.value = '';
    
    // Call actual API
    try {
        const response = await fetch('/api/jan-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                context: {
                    currentPosts: await getCurrentPosts(),
                    userPreferences: getUserPreferences()
                }
            })
        });
        
        const data = await response.json();
        addJanMessage(data.response, 'ai');
    } catch (error) {
        addJanMessage('Sorry, I encountered an error. Please try again.', 'ai');
    }
}
```

3. **Add Context Awareness**
```javascript
async function getCurrentPosts() {
    // Get posts from calendar
    const posts = await supabaseAPI.getPosts(
        new Date().toISOString().split('T')[0],
        // ... date range
    );
    return posts;
}
```

---

## Character Profiles Integration

Jan has three voice personas from the 3c-content-scheduler:

### 1. **Anica** (Default)
- Warm, encouraging, mentor-like
- Greeting: "Hello Legends!"
- Use for: General content advice, strategy

### 2. **Caelum**
- Creative, innovative, visionary
- Greeting: "Hey, Creative Captains!"
- Use for: Brainstorming, creative content

### 3. **Aurion**
- Energetic, motivational, action-oriented
- Greeting: "Hey, Champs!"
- Use for: Motivation, quick wins, execution

**To implement:**
```javascript
// Add character selector to chat footer
<div class="jan-character-selector">
    <button onclick="switchJanVoice('anica')">Anica</button>
    <button onclick="switchJanVoice('caelum')">Caelum</button>
    <button onclick="switchJanVoice('aurion')">Aurion</button>
</div>

// In jan-chat.js
let currentVoice = 'anica';

function switchJanVoice(voice) {
    currentVoice = voice;
    // Update API calls to use selected voice
}
```

---

## Next Steps

### Immediate (You Can Do Now):
1. **Add Jan's profile image**
   - Save image as: `public/jan-profile.png`
   - Should be square, high quality
   - Will be displayed as circular

2. **Test the interface**
   - Click Jan's profile button
   - Try quick actions
   - Send test messages
   - Check mobile responsiveness

### Short-term (Next Development Phase):
1. **Connect to 3c-content-scheduler API**
   - Deploy API endpoint
   - Update `jan-chat.js` to use real API
   - Add authentication

2. **Add chat history**
   - Save conversations to Supabase
   - Load previous chats on open
   - Clear chat option

3. **Context awareness**
   - Pass current calendar view
   - Include scheduled posts
   - User preferences and history

### Long-term (Future Enhancements):
1. **Voice persona switching**
   - UI for selecting Anica/Caelum/Aurion
   - Different response styles
   - Visual indicators for active persona

2. **Advanced features**
   - Content generation directly in chat
   - Schedule posts from chat
   - Image suggestions
   - Analytics insights

---

## Styling Customization

All Jan chat styles are in `css/styles.css` under these classes:

```css
.btn-jan-profile          /* Profile button */
.jan-chat-overlay         /* Overlay background */
.jan-chat-container       /* Chat window */
.jan-chat-header          /* Header with avatar */
.jan-chat-body            /* Message area */
.jan-message              /* Individual messages */
.jan-quick-actions        /* Quick action buttons */
.jan-chat-input           /* Input field */
.jan-send-btn             /* Send button */
```

**Color scheme:**
- Primary: `#9b59b6` (purple)
- Secondary: `#2d1b4e` (dark purple)
- Accent: `#ff6b35` (orange)
- Success: `#27ae60` (green)

---

## Testing Checklist

- [ ] Jan's profile button appears in header
- [ ] Profile image displays correctly (circular)
- [ ] Clicking button opens chat overlay
- [ ] Chat overlay has smooth animation
- [ ] Messages can be sent via input
- [ ] Enter key sends messages
- [ ] Quick action buttons work
- [ ] AI responses appear after delay
- [ ] Clicking outside closes overlay
- [ ] Close button (X) works
- [ ] Mobile responsive (test on phone)
- [ ] Scrolling works with many messages

---

## Troubleshooting

**Profile image not showing:**
- Check file path: `public/jan-profile.png`
- Verify image exists and is accessible
- Check browser console for 404 errors

**Chat not opening:**
- Check browser console for JavaScript errors
- Verify `jan-chat.js` is loaded
- Check `toggleJanChat()` function exists

**Styling issues:**
- Clear browser cache
- Check CSS file is loaded
- Verify no conflicting styles

**Messages not sending:**
- Check `sendJanMessage()` function
- Verify input field has correct ID
- Check console for errors

---

## Future: 3c-desktop-editor Integration

The 3c-desktop-editor will be integrated into 3c-control-center using the same approach:
1. Add Jan's profile button to control center header
2. Create similar overlay chat interface
3. Connect to same API but with different context
4. Use same character profiles and voice system

This creates a consistent Jan experience across all 3C platforms!

---

**Status**: ✅ UI Complete, ⏳ API Integration Pending

Once you add Jan's profile image and test the interface, we can proceed with connecting the actual AI functionality from 3c-content-scheduler!
