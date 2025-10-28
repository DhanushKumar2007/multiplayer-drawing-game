/**
 * Chat and Guessing Handler
 * Manages chat messages and guess submissions
 */

let chatMessages = null;
let chatForm = null;
let chatInput = null;

// Initialize chat
function initializeChat() {
    chatMessages = document.getElementById('chatMessages');
    chatForm = document.getElementById('chatForm');
    chatInput = document.getElementById('chatInput');
    
    if (!chatMessages || !chatForm || !chatInput) {
        console.error('Chat elements not found');
        return;
    }
    
    // Setup event listeners
    chatForm.addEventListener('submit', handleChatSubmit);
    
    // Auto-scroll to bottom on new messages
    const observer = new MutationObserver(() => {
        scrollToBottom();
    });
    
    observer.observe(chatMessages, { childList: true });
    
    console.log('✅ Chat initialized');
}

// ==================== CHAT FUNCTIONS ====================

function handleChatSubmit(e) {
    e.preventDefault();
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Send guess to server
    if (window.socketClient) {
        window.socketClient.sendGuess(message);
    }
    
    // Clear input
    chatInput.value = '';
    chatInput.focus();
}

function addChatMessage(username, message, isSystem = false, type = 'normal') {
    if (!chatMessages) return;
    
    // Remove welcome message if it exists
    const welcomeMsg = chatMessages.querySelector('.chat-welcome');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isSystem ? 'system' : ''} ${type}`;
    
    if (isSystem) {
        messageDiv.innerHTML = `<span class="chat-text">${escapeHtml(message)}</span>`;
    } else {
        messageDiv.innerHTML = `
            <span class="chat-username">${escapeHtml(username)}:</span>
            <span class="chat-text">${escapeHtml(message)}</span>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    
    // Add animation class
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateX(0)';
    }, 10);
}

function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function clearChat() {
    if (chatMessages) {
        chatMessages.innerHTML = `
            <div class="chat-welcome">
                <p>Type your guesses in the chat!</p>
                <p class="chat-hint">⚡ Faster guesses = more points</p>
            </div>
        `;
    }
}

// Helper function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize chat when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChat);
} else {
    initializeChat();
}