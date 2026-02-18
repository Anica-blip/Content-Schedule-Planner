/**
 * Jan AI Assistant Chat Integration
 * Integrated with 3c-content-scheduler persona system
 */

// Toggle Jan chat overlay
function toggleJanChat() {
    const overlay = document.getElementById('janChatOverlay');
    overlay.classList.toggle('active');
    
    // Initialize form when opening
    if (overlay.classList.contains('active')) {
        initializeJanForm();
        setTimeout(() => {
            document.getElementById('janChatInput').focus();
        }, 300);
    }
}

// Initialize Jan form with defaults
function initializeJanForm() {
    // Set default date to today
    const today = new Date();
    const dateInput = document.getElementById('janScheduleDate');
    if (!dateInput.value) {
        dateInput.value = today.toISOString().split('T')[0];
    }
    
    // Set default time to current time + 1 hour
    const timeInput = document.getElementById('janScheduleTime');
    if (!timeInput.value) {
        const oneHourLater = new Date(today.getTime() + 60 * 60 * 1000);
        timeInput.value = oneHourLater.toTimeString().slice(0,5);
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

// Get Jan form data
function getJanFormData() {
    return {
        character: document.querySelector('input[name="janCharacter"]:checked')?.value || '',
        templateLabel: document.getElementById('janTemplateLabel').value,
        prompt: document.getElementById('janPrompt').value,
        scheduleDate: document.getElementById('janScheduleDate').value,
        scheduleTime: document.getElementById('janScheduleTime').value,
        timestamp: new Date().toISOString()
    };
}

// Add message to chat
function addJanMessage(text, sender) {
    const chatMessages = document.getElementById('janChatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `jan-message jan-${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'jan-message-content';
    
    if (sender === 'ai') {
        contentDiv.innerHTML = `<strong>Jan:</strong> ${text}`;
    } else {
        contentDiv.innerHTML = `<strong>You:</strong> ${text}`;
    }
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Quick action: Request Clarification
function janRequestClarification() {
    const formData = getJanFormData();
    const clarificationMsg = `I need clarification on this content request: Character: ${formData.character || 'Not selected'}, Template: ${formData.templateLabel || 'Not selected'}, scheduled for ${formData.scheduleDate || 'Not set'}.`;
    
    addJanMessage('I need clarification on this content request', 'user');
    setTimeout(() => {
        addJanMessage('I\'ve reviewed your content request. Could you provide more details about the target audience and the specific goals for this content? This will help me create more targeted and effective content.', 'ai');
    }, 1000);
}

// Quick action: Reschedule Content
function janRescheduleContent() {
    addJanMessage('I want to reschedule this content', 'user');
    setTimeout(() => {
        addJanMessage('I can help you reschedule. What new date and time would work better for you? I\'ll also check for any conflicts with your existing content calendar.', 'ai');
    }, 1000);
}

// Quick action: Repurpose Content
function janRepurposeContent() {
    addJanMessage('I want to repurpose this content', 'user');
    setTimeout(() => {
        addJanMessage('Great idea! I can help repurpose this content into different formats. Would you like me to create versions for social media, email newsletter, or blog posts? Each format will be optimized for its specific platform.', 'ai');
    }, 1000);
}

// Quick action: Review Content
function janReviewContent() {
    addJanMessage('Please review the changes I requested', 'user');
    setTimeout(() => {
        addJanMessage('I\'ve reviewed your requested changes. The modifications look good and align with your content strategy. Would you like me to proceed with implementing these changes?', 'ai');
    }, 1000);
}


// Generate Jan's response based on persona and context
function generateJanResponse(userMessage) {
    const formData = getJanFormData();
    const lowerMessage = userMessage.toLowerCase();
    const character = formData.character;
    
    // Persona-specific greetings and responses
    const personaGreetings = {
        'Anica': 'Hello Legends!',
        'Caelum': 'Hey, Creative Captains!',
        'Aurion': 'Hey, Champs!'
    };
    
    const greeting = personaGreetings[character] || 'Hello!';
    
    // Character-specific context
    if (character && (lowerMessage.includes('persona') || lowerMessage.includes('character') || lowerMessage.includes('who'))) {
        const personaInfo = {
            'Anica': `${greeting} I'm speaking as Anica - warm, encouraging, and mentor-like. I focus on brand content writing, brand voice consistency, and training course creation. I use the ATA (Activate Thinking Approach) methodology to help you think metacognitively about your content.`,
            'Caelum': `${greeting} I'm speaking as Caelum - creative, innovative, and visionary. I help you brainstorm unique content ideas and think outside the box. Let's create something amazing together!`,
            'Aurion': `${greeting} I'm speaking as Aurion - energetic, motivational, and action-oriented. I'm here to help you take action and get things done. Let's make it happen!`
        };
        return personaInfo[character] || `I'm Jan, your AI content assistant. Select a character profile above to get started!`;
    }
    
    // Content ideas
    if (lowerMessage.includes('content') && (lowerMessage.includes('idea') || lowerMessage.includes('brainstorm'))) {
        return `${greeting} Let's brainstorm content ideas! Based on ${character ? character + '\'s perspective' : 'the ATA methodology'}, here are some suggestions:

1. **Educational Posts**: Share expertise and teach your audience
2. **Behind-the-scenes**: Show your creative process
3. **Success Stories**: Highlight achievements and milestones
4. **Interactive Content**: Polls, Q&A sessions, challenges
5. **Value-driven**: Problem-solving content

Which type resonates with your goals?`;
    }
    
    // Schedule timing
    if (lowerMessage.includes('schedule') || lowerMessage.includes('time') || lowerMessage.includes('when')) {
        return `For optimal engagement:

📱 **Instagram**: 11am-1pm, 7pm-9pm
📘 **Facebook**: 1pm-3pm weekdays
💼 **LinkedIn**: 7am-9am, 5pm-6pm
🐦 **Twitter**: 8am-10am, 6pm-9pm

Test different times and track analytics for YOUR audience!`;
    }
    
    // Default response
    return `${greeting} I'm here to help with:

📝 **Content Creation**: Brainstorm and write posts
📅 **Scheduling**: Find best posting times
✨ **Review**: Provide feedback
🎯 **Brand Voice**: Ensure 3C consistency

Fill out the form above and let's create great content together!`;
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
