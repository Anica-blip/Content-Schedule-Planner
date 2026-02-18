/**
 * Jan AI Assistant Chat Integration
 * Connects Content Schedule Planner with 3c-content-scheduler
 */

// Toggle Jan chat overlay
function toggleJanChat() {
    const overlay = document.getElementById('janChatOverlay');
    overlay.classList.toggle('active');
    
    // Focus input when opening
    if (overlay.classList.contains('active')) {
        setTimeout(() => {
            document.getElementById('janChatInput').focus();
        }, 300);
    }
}

// Send message to Jan
function sendJanMessage() {
    const input = document.getElementById('janChatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addJanMessage(message, 'user');
    
    // Clear input
    input.value = '';
    
    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
        const response = generateJanResponse(message);
        addJanMessage(response, 'ai');
    }, 1000);
}

// Handle Enter key in chat input
function handleJanEnter(event) {
    if (event.key === 'Enter') {
        sendJanMessage();
    }
}

// Add message to chat
function addJanMessage(text, sender) {
    const chatBody = document.getElementById('janChatBody');
    const messageDiv = document.createElement('div');
    messageDiv.className = `jan-message jan-${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'jan-message-content';
    
    if (sender === 'ai') {
        contentDiv.innerHTML = `<strong>Jan:</strong> ${text}`;
    } else {
        contentDiv.textContent = text;
    }
    
    messageDiv.appendChild(contentDiv);
    chatBody.appendChild(messageDiv);
    
    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Quick action buttons
function janQuickAction(action) {
    let message = '';
    
    switch(action) {
        case 'help':
            message = 'Can you help me brainstorm content ideas for this week?';
            break;
        case 'schedule':
            message = 'What\'s the best time to schedule posts for maximum engagement?';
            break;
        case 'review':
            message = 'Can you review my scheduled content and suggest improvements?';
            break;
        case 'tips':
            message = 'Give me some tips for creating engaging social media content.';
            break;
    }
    
    document.getElementById('janChatInput').value = message;
    sendJanMessage();
}

// Generate Jan's response (placeholder - will be replaced with actual AI integration)
function generateJanResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Content ideas
    if (lowerMessage.includes('content') && (lowerMessage.includes('idea') || lowerMessage.includes('brainstorm'))) {
        return `Great! Let's brainstorm some content ideas. Based on your brand voice and the ATA methodology, here are some suggestions:

1. **Educational Posts**: Share tips about your expertise area
2. **Behind-the-scenes**: Show your creative process
3. **Success Stories**: Highlight achievements and milestones
4. **Interactive Content**: Polls, Q&A sessions, challenges
5. **Value-driven**: Problem-solving content for your audience

Which type resonates most with your current goals?`;
    }
    
    // Schedule timing
    if (lowerMessage.includes('schedule') || lowerMessage.includes('time') || lowerMessage.includes('when')) {
        return `For optimal engagement, here are the best posting times:

📱 **Instagram**: 11am-1pm, 7pm-9pm
📘 **Facebook**: 1pm-3pm weekdays
💼 **LinkedIn**: 7am-9am, 5pm-6pm
🐦 **Twitter**: 8am-10am, 6pm-9pm
📺 **YouTube**: 2pm-4pm weekends

These are general guidelines. I recommend testing different times and tracking your analytics to find what works best for YOUR audience!`;
    }
    
    // Review content
    if (lowerMessage.includes('review') || lowerMessage.includes('improve') || lowerMessage.includes('feedback')) {
        return `I'd be happy to review your content! Here's what I look for:

✅ **Clear Message**: Is the main point obvious?
✅ **Engaging Hook**: Does it grab attention in the first 3 seconds?
✅ **Call-to-Action**: What do you want readers to do?
✅ **Brand Voice**: Does it match your 3C personality?
✅ **Visual Appeal**: Are images/formatting optimized?

Share a specific post you'd like me to review, and I'll provide detailed feedback!`;
    }
    
    // Tips
    if (lowerMessage.includes('tip') || lowerMessage.includes('advice') || lowerMessage.includes('help')) {
        return `Here are my top tips for creating engaging content:

💡 **Know Your Audience**: Speak directly to their needs and pain points
🎯 **Be Authentic**: Your unique voice is your superpower
📊 **Use Data**: Track what works and do more of it
🖼️ **Visual First**: Eye-catching images stop the scroll
💬 **Engage Back**: Reply to comments and build community
📅 **Consistency**: Regular posting builds trust and habit
✨ **Value Over Promotion**: 80% value, 20% selling

Which area would you like to dive deeper into?`;
    }
    
    // Default response
    return `I'm here to help! I can assist you with:

📝 **Content Creation**: Brainstorm ideas and write engaging posts
📅 **Scheduling Strategy**: Find the best times to post
✨ **Content Review**: Provide feedback and suggestions
💡 **Best Practices**: Share tips for social media success
🎯 **Brand Voice**: Ensure consistency with 3C values

What would you like to work on today?`;
}

// Initialize Jan chat when page loads
window.addEventListener('load', () => {
    console.log('✨ Jan AI Assistant ready');
});

// Close overlay when clicking outside
document.addEventListener('click', (event) => {
    const overlay = document.getElementById('janChatOverlay');
    const chatContainer = document.querySelector('.jan-chat-container');
    const janBtn = document.getElementById('jan-assistant-btn');
    
    if (overlay && overlay.classList.contains('active')) {
        if (event.target === overlay && !chatContainer.contains(event.target)) {
            toggleJanChat();
        }
    }
});
