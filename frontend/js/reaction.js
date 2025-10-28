/**
 * Emoji Reactions Handler
 * Manages emoji reactions on canvas
 */

let reactionsContainer = null;
let emojiButtons = [];

// Initialize reactions
function initializeReactions() {
    reactionsContainer = document.getElementById('reactions');
    emojiButtons = document.querySelectorAll('.emoji-btn');
    
    if (!reactionsContainer) {
        console.error('Reactions container not found');
        return;
    }
    
    // Setup event listeners for emoji buttons
    emojiButtons.forEach(btn => {
        btn.addEventListener('click', handleEmojiClick);
    });
    
    console.log('✅ Reactions initialized');
}

// ==================== REACTION FUNCTIONS ====================

function handleEmojiClick(e) {
    const emoji = e.currentTarget.dataset.emoji;
    
    if (!emoji) return;
    
    // Send reaction to server
    if (window.socketClient) {
        window.socketClient.sendReaction(emoji);
    }
    
    // Show local reaction immediately
    const x = Math.random() * 80 + 10;
    const y = Math.random() * 80 + 10;
    showReactionOnCanvas(emoji, x, y);
    
    // Add button animation
    e.currentTarget.style.animation = 'none';
    setTimeout(() => {
        e.currentTarget.style.animation = '';
    }, 10);
}

function showReactionOnCanvas(emoji, x, y) {
    if (!reactionsContainer) return;
    
    const reactionEl = document.createElement('div');
    reactionEl.className = 'reaction-emoji';
    reactionEl.textContent = emoji;
    reactionEl.style.left = `${x}%`;
    reactionEl.style.top = `${y}%`;
    
    reactionsContainer.appendChild(reactionEl);
    
    // Remove after animation completes
    setTimeout(() => {
        reactionEl.remove();
    }, 3000);
}

// Initialize reactions when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReactions);
} else {
    initializeReactions();
}