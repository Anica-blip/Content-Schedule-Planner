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

// Extract title from chat message
function extractTitleFromMessage(message) {
    // Pattern 1: "title: Something" or "Title: Something"
    const titlePattern1 = /title:\s*(.+?)(?:\n|$)/i;
    const match1 = message.match(titlePattern1);
    if (match1) return match1[1].trim();

    // Pattern 2: "Issue #X - Title" or "**Issue #X - Title**"
    const issuePattern = /\*?\*?Issue\s*#?\d+\s*[-–—]\s*(.+?)(?:\*\*|\n|$)/i;
    const match2 = message.match(issuePattern);
    if (match2) return match2[0].replace(/\*\*/g, '').trim();

    // Pattern 3: Text in quotes "Title Here"
    const quotePattern = /"([^"]+)"/;
    const match3 = message.match(quotePattern);
    if (match3) return match3[1].trim();

    // Pattern 4: Text in **bold**
    const boldPattern = /\*\*([^*]+)\*\*/;
    const match4 = message.match(boldPattern);
    if (match4) return match4[1].trim();

    return null;
}

// Send message to Jan
function sendJanMessage() {
    const input = document.getElementById('janChatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addJanMessage(message, 'user');
    
    // Extract title from message if present
    const extractedTitle = extractTitleFromMessage(message);
    const titleField = document.getElementById('janTitle');
    if (extractedTitle && !titleField.value) {
        titleField.value = extractedTitle;
        // Trigger hashtag generation
        autoGenerateHashtags();
    }
    
    // Clear input
    input.value = '';
    
    // Generate content and auto-fill fields
    setTimeout(() => {
        const response = generateJanResponse(message, extractedTitle);
        addJanMessage(response, 'ai');
        
        // Auto-fill social media fields if request is for content creation
        if (message.toLowerCase().includes('create') || message.toLowerCase().includes('description') || message.toLowerCase().includes('post')) {
            generateSocialMediaContent();
        }
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
        themeLabel: document.getElementById('janThemeLabel').value,
        brandVoice: document.getElementById('janBrandVoice').value,
        targetAudience: document.getElementById('janTargetAudience').value,
        templateType: document.getElementById('janTemplateType').value,
        platform: document.getElementById('janPlatform').value,
        prompt: document.getElementById('janPrompt').value,
        title: document.getElementById('janTitle').value,
        description: document.getElementById('janDescription').value,
        hashtags: document.getElementById('janHashtags').value,
        seoKeywords: document.getElementById('janSEOKeywords').value,
        cta: document.getElementById('janCTA').value,
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
    const clarificationMsg = `I need clarification on this content request: Character: ${formData.character || 'Not selected'}, Theme: ${formData.themeLabel || 'Not selected'}, Platform: ${formData.platform || 'Not selected'}, scheduled for ${formData.scheduleDate || 'Not set'}.`;
    
    addJanMessage('I need clarification on this content request', 'user');
    setTimeout(() => {
        const formData = getJanFormData();
        let response = 'I\'ve reviewed your content request. ';
        
        if (!formData.platform) {
            response += 'Please select a platform so I can optimize the description length. ';
        }
        if (!formData.targetAudience) {
            response += 'Who is the target audience? ';
        }
        if (!formData.brandVoice) {
            response += 'What brand voice should I use? ';
        }
        
        response += 'This will help me create more targeted and effective content.';
        addJanMessage(response, 'ai');
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
function generateJanResponse(userMessage, extractedTitle = null) {
    const formData = getJanFormData();
    const lowerMessage = userMessage.toLowerCase();
    
    // Jan always addresses Anica/Chef (British English, London timezone)
    const greeting = 'Hello Chef!';
    
    // Title acknowledgment
    const titleNote = extractedTitle ? `\n\n✅ I've added the title: "${extractedTitle}"` : '';
    
    // Check if request is for content creation/description
    if (lowerMessage.includes('create') || lowerMessage.includes('description') || lowerMessage.includes('post')) {
        // Generate content based on form data
        if (!formData.character) {
            return `${greeting} Please select a character profile first (Anica, Caelum, or Aurion) so I know which voice to write in.${titleNote}`;
        }
        
        if (!formData.title) {
            return `${greeting} I need a title to work with. Please add a title in the field above.${titleNote}`;
        }
        
        // Acknowledge the request and what Jan will do
        let response = `${greeting} I've read your request. Creating content for **${formData.character}** voice:${titleNote}\n\n`;
        response += `📝 **Title**: ${formData.title}\n`;
        response += `🎯 **Platform**: ${formData.platform || 'Not selected'}\n`;
        response += `👥 **Audience**: ${formData.targetAudience || 'Not selected'}\n`;
        response += `🎨 **Theme**: ${formData.themeLabel || 'Not selected'}\n\n`;
        response += `I'm generating the description, SEO keywords, and CTA now. Check the fields below!`;
        
        return response;
    }
    
    // Help with form fields
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
        return `${greeting} Here's how to use this:\n\n1. Select character profile (Anica/Caelum/Aurion)\n2. Fill in dropdowns (Theme, Voice, Audience, etc.)\n3. Add your title and content prompt (or include title in your message to me)\n4. Ask me to "create description" or "generate post"\n5. I'll fill in Description, SEO Keywords, and CTA for you!\n\nReady when you are!${titleNote}`;
    }
    
    // Schedule timing (London timezone)
    if (lowerMessage.includes('schedule') || lowerMessage.includes('time') || lowerMessage.includes('when')) {
        return `For optimal engagement (London time):\n\n📱 **Instagram**: 11:00-13:00, 19:00-21:00\n📘 **Facebook**: 13:00-15:00 weekdays\n💼 **LinkedIn**: 07:00-09:00, 17:00-18:00\n🐦 **Twitter**: 08:00-10:00, 18:00-21:00\n\nTest different times and track analytics for YOUR audience!${titleNote}`;
    }
    
    // Default response
    return `${greeting} I'm here to help you create content! Fill out the form above (character, title, prompt) and ask me to "create a description" or "generate post content". I'll handle the rest!${titleNote}`;
}

// Platform character limits
const platformLimits = {
    'Instagram': 2200,
    'Facebook': 63206,
    'LinkedIn': 3000,
    'Twitter/X': 280,
    'YouTube': 5000,
    'TikTok': 2200,
    'Telegram': 4096,
    'Pinterest': 500,
    'WhatsApp Business': 1024,
    'Discord': 2000,
    'Forum': 10000
};

// Generate and auto-fill social media content fields
function generateSocialMediaContent() {
    const formData = getJanFormData();
    
    // Only generate if we have minimum required data
    if (!formData.character || !formData.title) {
        return;
    }
    
    // Persona-specific greetings for the PUBLIC content (not Jan's voice)
    const personaGreetings = {
        'Anica': 'Hello Legends!',
        'Caelum': 'Hey, Creative Captains!',
        'Aurion': 'Hey, Champs!'
    };
    
    const greeting = personaGreetings[formData.character] || 'Hello!';
    
    // Generate description based on title, prompt, and character voice
    let description = `${greeting}\n`;
    
    // Add content from prompt if available
    if (formData.prompt) {
        description += `${formData.prompt}\n\n`;
    } else {
        description += `This is content from ${formData.character}.\n\n`;
    }
    
    // Add standard elements based on template type
    if (formData.templateType === 'Anica Chat') {
        description += `📥 Download. And if it sparks a thought… share it out.\n\n`;
        description += `💛 One sip at a time.\n\n`;
        description += `CLICK THIS BUTTON [⏹️](https://3c-public-library.org/library) FOR FLIPBOOK\n\n`;
    }
    
    // Add signature
    description += `⚡️ **"Think it. Do it. OWN it!"** ⚡️\n\n`;
    description += `🌐 [www.3c-innergrowth.com](http://www.3c-innergrowth.com/)\n\n`;
    description += `☝🏻 [Conscious Confident Choices](https://t.me/+9nzVQANylDY5Y2Y0) ☝🏻`;
    
    // Auto-fill description field
    document.getElementById('janDescription').value = description;
    updateDescriptionCharCount();
    
    // Generate SEO Keywords from title and theme
    let seoKeywords = [];
    if (formData.title) {
        // Extract key words from title
        const titleWords = formData.title.toLowerCase().split(' ').filter(word => word.length > 3);
        seoKeywords = titleWords.slice(0, 3);
    }
    if (formData.themeLabel) {
        seoKeywords.push(formData.themeLabel.toLowerCase());
    }
    document.getElementById('janSEOKeywords').value = seoKeywords.join(', ');
    
    // Generate CTA based on template type
    let cta = 'enjoy the read';
    if (formData.templateType === 'Anica Chat') {
        cta = 'enjoy the read';
    } else if (formData.themeLabel.includes('Quiz')) {
        cta = 'take the quiz';
    } else if (formData.themeLabel.includes('Game')) {
        cta = 'play the game';
    } else if (formData.themeLabel.includes('Challenge')) {
        cta = 'join the challenge';
    } else if (formData.templateType === 'Video Message') {
        cta = 'watch now';
    }
    document.getElementById('janCTA').value = cta;
    
    // Hashtags are already auto-generated by existing event listeners
}

// Generate hashtags based on content
function generateHashtags(title, templateType, themeLabel) {
    // Standard hashtags
    const standardHashtags = ['#ThinkItDoItOwnIt', '#WeRiseAsOne'];
    
    // Content-specific hashtag logic
    let contentHashtag = '';
    
    // Check template type first
    if (templateType === 'Anica Chat') {
        contentHashtag = '#AnicaChats';
    } else if (themeLabel.includes('Quiz')) {
        contentHashtag = '#3CQuiz';
    } else if (themeLabel.includes('Game')) {
        contentHashtag = '#3CGame';
    } else if (themeLabel.includes('Puzzle')) {
        contentHashtag = '#3CPuzzle';
    } else if (themeLabel.includes('Challenge')) {
        contentHashtag = '#3CChallenge';
    } else if (themeLabel === 'News' || themeLabel === 'News Alert') {
        contentHashtag = '#3CNews';
    } else if (themeLabel === 'Tutorial Guide') {
        contentHashtag = '#3CGuide';
    } else if (themeLabel === 'Course, Tool') {
        contentHashtag = '#3CMiniCourse';
    } else if (templateType === 'Blog Posts') {
        contentHashtag = '#3CBlog';
    } else if (title && title.toLowerCase().includes('goal')) {
        contentHashtag = '#GoalSetting';
    } else {
        // Default based on template type
        contentHashtag = '#3CContent';
    }
    
    // Special case: Aurion mascot content (motivational/prompts)
    const character = document.querySelector('input[name="janCharacter"]:checked')?.value;
    if (character === 'Aurion' && (themeLabel === 'Promotion' || themeLabel === 'Standard Post')) {
        contentHashtag = '#3CMascot';
    }
    
    return [...standardHashtags, contentHashtag].join(' ');
}

// Update character count for description
function updateDescriptionCharCount() {
    const description = document.getElementById('janDescription').value;
    const platform = document.getElementById('janPlatform').value;
    const charCount = description.length;
    const charCountEl = document.getElementById('janDescCharCount');
    
    if (platform && platformLimits[platform]) {
        const limit = platformLimits[platform];
        const remaining = limit - charCount;
        const percentage = (charCount / limit) * 100;
        
        let color = '#718096'; // gray
        if (percentage > 90) color = '#e53e3e'; // red
        else if (percentage > 75) color = '#ed8936'; // orange
        else if (percentage > 50) color = '#ecc94b'; // yellow
        
        charCountEl.textContent = `${charCount} / ${limit} characters (${remaining} remaining)`;
        charCountEl.style.color = color;
    } else {
        charCountEl.textContent = `${charCount} characters`;
        charCountEl.style.color = '#718096';
    }
}

// Auto-generate hashtags when relevant fields change
function autoGenerateHashtags() {
    const title = document.getElementById('janTitle').value;
    const templateType = document.getElementById('janTemplateType').value;
    const themeLabel = document.getElementById('janThemeLabel').value;
    
    if (title || templateType || themeLabel) {
        const hashtags = generateHashtags(title, templateType, themeLabel);
        document.getElementById('janHashtags').value = hashtags;
    }
}

// Initialize Jan chat when page loads
window.addEventListener('load', () => {
    console.log('✨ Jan AI Assistant ready');
    
    // Add event listeners for auto-generation
    document.getElementById('janTitle')?.addEventListener('input', autoGenerateHashtags);
    document.getElementById('janTemplateType')?.addEventListener('change', autoGenerateHashtags);
    document.getElementById('janThemeLabel')?.addEventListener('change', autoGenerateHashtags);
    document.getElementById('janDescription')?.addEventListener('input', updateDescriptionCharCount);
    document.getElementById('janPlatform')?.addEventListener('change', updateDescriptionCharCount);
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
