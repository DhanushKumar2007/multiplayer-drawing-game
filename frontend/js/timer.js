/**
 * Timer Handler
 * Manages game timer display and updates
 */

let timerElement = null;
let timerInterval = null;
let currentTime = 60;

// Initialize timer
function initializeTimer() {
    timerElement = document.getElementById('timer');
    
    if (!timerElement) {
        console.error('Timer element not found');
        return;
    }
    
    console.log('✅ Timer initialized');
}

// ==================== TIMER FUNCTIONS ====================

function startTimer(duration) {
    currentTime = duration;
    updateTimerDisplay();
    
    // Clear any existing interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Start countdown
    timerInterval = setInterval(() => {
        currentTime--;
        updateTimerDisplay();
        
        // Warning state when time is low
        if (currentTime <= 10) {
            timerElement.classList.add('warning');
        }
        
        // Stop at 0
        if (currentTime <= 0) {
            stopTimer();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    if (timerElement) {
        timerElement.classList.remove('warning');
    }
}

function updateTimerDisplay() {
    if (timerElement) {
        const valueEl = timerElement.querySelector('.timer-value');
        if (valueEl) {
            valueEl.textContent = currentTime;
            
            // Add flip animation
            valueEl.style.animation = 'none';
            setTimeout(() => {
                valueEl.style.animation = 'numberFlip 0.5s ease';
            }, 10);
        }
    }
}

function resetTimer() {
    stopTimer();
    currentTime = 60;
    updateTimerDisplay();
}

// Update game state (called from socket events)
function updateGameState(gameState) {
    if (gameState && gameState.time_remaining !== undefined) {
        currentTime = gameState.time_remaining;
        updateTimerDisplay();
        
        // Update round display
        const currentRound = document.getElementById('currentRound');
        if (currentRound && gameState.current_round) {
            currentRound.textContent = gameState.current_round;
        }
        
        // Update category
        const categoryValue = document.getElementById('currentCategory');
        if (categoryValue && gameState.word_category) {
            categoryValue.textContent = gameState.word_category;
        }
    }
}

// Initialize timer when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTimer);
} else {
    initializeTimer();
}