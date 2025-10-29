/**
 * Main JavaScript Orchestrator
 * Connects all modules and handles page-specific logic
 */

// ==================== GLOBAL STATE ====================
let notificationTimeout = null;

// ==================== INITIALIZE ON PAGE LOAD ====================
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname;
    
    console.log('🚀 Initializing application...');
    
    // Initialize based on current page
    if (currentPage.includes('index.html') || currentPage === '/') {
        initializeHomePage();
    } else if (currentPage.includes('lobby.html')) {
        initializeLobbyPage();
    } else if (currentPage.includes('game.html')) {
        initializeGamePage();
    }
});

// ==================== HOME PAGE ====================
function initializeHomePage() {
    console.log('📄 Initializing home page...');
    
    const createRoomForm = document.getElementById('createRoomForm');
    const joinRoomForm = document.getElementById('joinRoomForm');
    
    if (createRoomForm) {
        createRoomForm.addEventListener('submit', handleCreateRoom);
    }
    
    if (joinRoomForm) {
        joinRoomForm.addEventListener('submit', handleJoinRoom);
    }
    
    console.log('✅ Home page initialized');
}

function handleCreateRoom(e) {
    e.preventDefault();
    
    const username = document.getElementById('createUsername').value.trim();
    
    if (!username) {
        displayNotification('Please enter your name', 'error');
        return;
    }
    
    if (username.length < 2 || username.length > 20) {
        displayNotification('Name must be 2-20 characters', 'error');
        return;
    }
    
    // Create room via socket
    if (window.socketClient) {
        window.socketClient.createRoom(username);
        displayNotification('Creating room...', 'info');
    } else {
        displayNotification('Connection error. Please refresh.', 'error');
    }
}

function handleJoinRoom(e) {
    e.preventDefault();
    
    const username = document.getElementById('joinUsername').value.trim();
    const roomCode = document.getElementById('roomCode').value.trim().toUpperCase();
    
    if (!username) {
        displayNotification('Please enter your name', 'error');
        return;
    }
    
    if (!roomCode || roomCode.length !== 6) {
        displayNotification('Please enter a valid 6-character room code', 'error');
        return;
    }
    
    if (username.length < 2 || username.length > 20) {
        displayNotification('Name must be 2-20 characters', 'error');
        return;
    }
    
    // Join room via socket
    if (window.socketClient) {
        window.socketClient.joinRoom(roomCode, username);
        displayNotification('Joining room...', 'info');
    } else {
        displayNotification('Connection error. Please refresh.', 'error');
    }
}

// ==================== LOBBY PAGE ====================
function initializeLobbyPage() {
    console.log('📄 Initializing lobby page...');
    
    const startGameBtn = document.getElementById('startGameBtn');
    const leaveRoomBtn = document.getElementById('leaveRoomBtn');
    
    if (startGameBtn) {
        startGameBtn.addEventListener('click', handleStartGame);
    }
    
    if (leaveRoomBtn) {
        leaveRoomBtn.addEventListener('click', handleLeaveRoom);
    }
    
    console.log('✅ Lobby page initialized');
}

function updateLobbyPlayers(players) {
    const playersList = document.getElementById('playersList');
    const playerCount = document.getElementById('playerCount');
    const waitingIndicator = document.getElementById('waitingForPlayers');
    
    console.log('📊 Updating player list:', players);
    console.log('👥 Number of players:', players.length);
    
    if (!playersList) {
        console.error('❌ playersList element not found!');
        return;
    }
    
    // Update player count
    if (playerCount) {
        playerCount.textContent = players.length;
    }
    
    // Clear current list
    playersList.innerHTML = '';
    
    if (players.length === 0) {
        console.warn('⚠️ No players in list!');
        playersList.innerHTML = '<p style="color: white; text-align: center;">No players yet...</p>';
    }
    
    // Add players
    players.forEach((player, index) => {
        console.log(`Adding player ${index + 1}:`, player);
        const playerItem = createPlayerItem(player, index);
        playersList.appendChild(playerItem);
    });
    
    // Show/hide waiting indicator
    if (waitingIndicator) {
        if (players.length < 2) {
            waitingIndicator.style.display = 'block';
        } else {
            waitingIndicator.style.display = 'none';
        }
    }
}

function createPlayerItem(player, index) {
    const div = document.createElement('div');
    div.className = 'player-item';
    div.style.animationDelay = `${index * 0.1}s`;
    
    // Get first letter of username for avatar
    const initial = player.username.charAt(0).toUpperCase();
    
    // Generate random color for avatar
    const colors = [
        'linear-gradient(135deg, #667eea, #764ba2)',
        'linear-gradient(135deg, #f093fb, #f5576c)',
        'linear-gradient(135deg, #4facfe, #00f2fe)',
        'linear-gradient(135deg, #43e97b, #38f9d7)',
        'linear-gradient(135deg, #fa709a, #fee140)'
    ];
    const avatarColor = colors[index % colors.length];
    
    div.innerHTML = `
        <div class="player-avatar" style="background: ${avatarColor};">
            ${initial}
        </div>
        <div class="player-info">
            <span class="player-name">
                ${escapeHtml(player.username)}
                ${player.sid === window.socketClient?.getSocket()?.id ? '<span class="player-badge">YOU</span>' : ''}
            </span>
        </div>
    `;
    
    return div;
}

function checkHostStatus(hostSid) {
    const startGameBtn = document.getElementById('startGameBtn');
    const waitingMessage = document.getElementById('waitingMessage');
    
    const isHost = hostSid === window.socketClient?.getSocket()?.id;
    
    if (startGameBtn) {
        startGameBtn.style.display = isHost ? 'block' : 'none';
    }
    
    if (waitingMessage) {
        waitingMessage.style.display = isHost ? 'none' : 'block';
    }
}

function handleStartGame() {
    if (window.socketClient) {
        window.socketClient.startGame();
        displayNotification('Starting game...', 'info');
    }
}

function handleLeaveRoom() {
    if (confirm('Are you sure you want to leave?')) {
        window.location.href = 'index.html';
    }
}

// ==================== GAME PAGE ====================
function initializeGamePage() {
    console.log('📄 Initializing game page...');
    
    const leaveGameBtn = document.getElementById('leaveGameBtn');
    
    if (leaveGameBtn) {
        leaveGameBtn.addEventListener('click', handleLeaveGame);
    }
    
    // Initialize game components
    if (typeof initializeCanvas === 'function') initializeCanvas();
    if (typeof initializeChat === 'function') initializeChat();
    if (typeof initializeReactions === 'function') initializeReactions();
    if (typeof initializeTimer === 'function') initializeTimer();
    if (typeof initializeScoreboard === 'function') initializeScoreboard();
    
    console.log('✅ Game page initialized');
}

function handleLeaveGame() {
    if (confirm('Are you sure you want to leave the game?')) {
        window.location.href = 'index.html';
    }
}

// ==================== MODAL HANDLERS ====================
function showTurnEndModal(word, leaderboard) {
    const modal = document.getElementById('turnModal');
    const revealedWord = document.getElementById('revealedWord');
    const roundScores = document.getElementById('roundScores');
    const modalTimer = document.getElementById('modalTimer');
    
    if (!modal) return;
    
    // Set revealed word
    if (revealedWord) {
        revealedWord.textContent = word;
    }
    
    // Display scores
    if (roundScores) {
        roundScores.innerHTML = leaderboard.map((player, index) => `
            <div class="final-score-item" style="animation-delay: ${index * 0.1}s;">
                <span>${escapeHtml(player.username)}</span>
                <span style="font-weight: 700;">${player.score} pts</span>
            </div>
        `).join('');
    }
    
    // Show modal
    modal.style.display = 'flex';
    
    // Countdown timer
    let countdown = 3;
    if (modalTimer) {
        modalTimer.textContent = countdown;
    }
    
    const countdownInterval = setInterval(() => {
        countdown--;
        if (modalTimer) {
            modalTimer.textContent = countdown;
        }
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            modal.style.display = 'none';
        }
    }, 1000);
}

function showGameEndModal(leaderboard, winners) {
    const modal = document.getElementById('gameEndModal');
    const winnerAnnouncement = document.getElementById('winnerAnnouncement');
    const finalScores = document.getElementById('finalScores');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const backToHomeBtn = document.getElementById('backToHomeBtn');
    
    if (!modal) return;
    
    // Winner announcement
    if (winnerAnnouncement) {
        if (winners.length === 1) {
            winnerAnnouncement.innerHTML = `
                <div class="winner-trophy">🏆</div>
                <h3>${escapeHtml(winners[0].username)} Wins!</h3>
                <p style="font-size: 1.5rem; font-weight: 700;">${winners[0].score} points</p>
            `;
        } else {
            const winnerNames = winners.map(w => escapeHtml(w.username)).join(', ');
            winnerAnnouncement.innerHTML = `
                <div class="winner-trophy">🏆</div>
                <h3>It's a Tie!</h3>
                <p style="font-size: 1.2rem;">${winnerNames}</p>
                <p style="font-size: 1.5rem; font-weight: 700;">${winners[0].score} points each</p>
            `;
        }
    }
    
    // Final scores
    if (finalScores) {
        finalScores.innerHTML = leaderboard.map((player, index) => `
            <div class="final-score-item ${index === 0 ? 'winner' : ''}" style="animation-delay: ${index * 0.1}s;">
                <span>
                    ${index < 3 ? ['🥇', '🥈', '🥉'][index] : `${index + 1}.`}
                    ${escapeHtml(player.username)}
                </span>
                <span style="font-weight: 700;">${player.score} pts</span>
            </div>
        `).join('');
    }
    
    // Button handlers
    if (playAgainBtn) {
        playAgainBtn.onclick = () => {
            window.location.href = 'index.html';
        };
    }
    
    if (backToHomeBtn) {
        backToHomeBtn.onclick = () => {
            window.location.href = 'index.html';
        };
    }
    
    // Show modal
    modal.style.display = 'flex';
}

// ==================== NOTIFICATION SYSTEM ====================
function displayNotification(message, type = 'info') {
    let notificationEl = document.getElementById('errorMessage');
    
    // If no error message element, try success message
    if (!notificationEl) {
        notificationEl = document.getElementById('successMessage');
    }
    
    // Create notification if doesn't exist
    if (!notificationEl) {
        notificationEl = document.createElement('div');
        notificationEl.id = 'notification';
        notificationEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: 600;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        `;
        document.body.appendChild(notificationEl);
    }
    
    // Set styles based on type
    const styles = {
        success: 'background: linear-gradient(135deg, #4facfe, #00f2fe); color: white;',
        error: 'background: linear-gradient(135deg, #fa709a, #fee140); color: white;',
        info: 'background: linear-gradient(135deg, #667eea, #764ba2); color: white;',
        warning: 'background: linear-gradient(135deg, #ffecd2, #fcb69f); color: #333;'
    };
    
    notificationEl.style.cssText += styles[type] || styles.info;
    notificationEl.textContent = message;
    notificationEl.style.display = 'block';
    
    // Clear previous timeout
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
    }
    
    // Auto-hide after 3 seconds
    notificationTimeout = setTimeout(() => {
        notificationEl.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            notificationEl.style.display = 'none';
        }, 300);
    }, 3000);
}

// ==================== UTILITY FUNCTIONS ====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getRandomColor() {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c',
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#fa709a', '#fee140'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// ==================== KEYBOARD SHORTCUTS ====================
document.addEventListener('keydown', (e) => {
    // ESC to close modals
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        });
    }
    
    // Enter to focus chat input (if on game page)
    if (e.key === 'Enter' && document.activeElement.tagName !== 'INPUT') {
        const chatInput = document.getElementById('chatInput');
        if (chatInput && window.location.pathname.includes('game.html')) {
            chatInput.focus();
        }
    }
});

// ==================== WINDOW UNLOAD WARNING ====================
window.addEventListener('beforeunload', (e) => {
    if (window.location.pathname.includes('game.html') || 
        window.location.pathname.includes('lobby.html')) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? You will be disconnected from the game.';
        return e.returnValue;
    }
});

// ==================== RESPONSIVE CANVAS RESIZE ====================
window.addEventListener('resize', () => {
    const canvas = document.getElementById('drawingCanvas');
    if (canvas) {
        // Maintain aspect ratio
        const container = canvas.parentElement;
        if (container) {
            const maxWidth = container.clientWidth - 30;
            const aspectRatio = canvas.height / canvas.width;
            
            if (canvas.width > maxWidth) {
                canvas.style.width = maxWidth + 'px';
                canvas.style.height = (maxWidth * aspectRatio) + 'px';
            }
        }
    }
});

// ==================== CONSOLE WELCOME MESSAGE ====================
console.log('%c🎨 Multiplayer Drawing Game', 'font-size: 24px; font-weight: bold; color: #667eea;');
console.log('%cBuilt with ❤️ using Socket.IO & Canvas API', 'font-size: 14px; color: #764ba2;');
console.log('%c⚠️ Tip: Open DevTools Network tab to see real-time Socket.IO events!', 'font-size: 12px; color: #f5576c;');