/**
 * Socket.IO Client Connection Handler
 * Manages all real-time communication with the server
 */

let socket = null;
let currentRoomCode = null;
let currentUsername = null;
let mySocketId = null;
let isDrawer = false;

// Initialize Socket.IO connection
function initializeSocket() {
    // Get the correct server URL
    let serverUrl;
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Local development
        serverUrl = 'http://localhost:5000';
    } else {
        // Production (Render or any deployed server)
        serverUrl = window.location.origin;
    }
    
    console.log('🔌 Connecting to:', serverUrl);
    
    // Connect to server
    socket = io(serverUrl, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
        timeout: 10000,
        forceNew: true,
        autoConnect: true
    });

    // Connection event handlers
    socket.on('connect', () => {
        console.log('✅ Connected to server');
        showNotification('Connected to server', 'success');
        // If we're on the lobby page and have stored room/username, try to (re)join automatically
        try {
            if (window.location.pathname.includes('lobby.html')) {
                const params = new URLSearchParams(window.location.search);
                const roomParam = params.get('room');
                const storedUsername = localStorage.getItem('username');
                const storedRoom = localStorage.getItem('room_code');

                // Prefer explicit query param, fall back to stored room
                const targetRoom = (roomParam && roomParam.length === 6) ? roomParam.toUpperCase() : (storedRoom || null);

                if (targetRoom && storedUsername) {
                    console.log('🔁 Attempting auto (re)join:', targetRoom, storedUsername);
                    // Update current variables and emit join
                    currentUsername = storedUsername;
                    currentRoomCode = targetRoom;
                    socket.emit('join_room', { room_code: targetRoom, username: storedUsername });
                }
            }
        } catch (e) {
            console.warn('Auto-join failed:', e);
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
        showNotification('Disconnected from server', 'error');
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        showNotification('Connection error. Please refresh.', 'error');
    });

    socket.on('connected', (data) => {
        mySocketId = data.sid;
        console.log('My socket ID:', mySocketId);
    });

    // Room event handlers
    socket.on('room_created', handleRoomCreated);
    socket.on('room_joined', handleRoomJoined);
    socket.on('join_error', handleJoinError);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_left', handlePlayerLeft);

    // Game event handlers
    socket.on('game_started', handleGameStarted);
    socket.on('your_turn_to_draw', handleYourTurnToDraw);
    socket.on('new_turn', handleNewTurn);
    socket.on('timer_update', handleTimerUpdate);
    socket.on('turn_ended', handleTurnEnded);
    socket.on('game_ended', handleGameEnded);

    // Drawing event handlers
    socket.on('draw', handleRemoteDraw);
    socket.on('clear_canvas', handleRemoteClearCanvas);

    // Chat event handlers
    socket.on('chat_message', handleChatMessage);
    socket.on('correct_guess', handleCorrectGuess);
    socket.on('already_guessed', handleAlreadyGuessed);

    // Reaction event handlers
    socket.on('reaction', handleReaction);

    // Error handler
    socket.on('error', handleError);
}

// ==================== EMIT FUNCTIONS ====================

function createRoom(username) {
    currentUsername = username;
    // Persist username for reconnection after page navigation
    try { localStorage.setItem('username', username); } catch (e) {}
    socket.emit('create_room', { username });
}

function joinRoom(roomCode, username) {
    currentUsername = username;
    currentRoomCode = roomCode;
    try { localStorage.setItem('username', username); localStorage.setItem('room_code', roomCode); } catch (e) {}
    socket.emit('join_room', { room_code: roomCode, username });
}

function startGame() {
    socket.emit('start_game', { room_code: currentRoomCode });
}

function sendDrawing(drawData) {
    socket.emit('draw', {
        room_code: currentRoomCode,
        ...drawData
    });
}

function clearCanvas() {
    socket.emit('clear_canvas', { room_code: currentRoomCode });
}

function sendGuess(guess) {
    socket.emit('guess', {
        room_code: currentRoomCode,
        guess: guess
    });
}

function sendChatMessage(message) {
    socket.emit('chat_message', {
        room_code: currentRoomCode,
        message: message
    });
}

function sendReaction(emoji) {
    socket.emit('reaction', {
        room_code: currentRoomCode,
        emoji: emoji,
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10
    });
}

function leaveRoom() {
    if (currentRoomCode) {
        window.location.href = 'index.html';
    }
}

// ==================== EVENT HANDLERS ====================

function handleRoomCreated(data) {
    console.log('✅ Room created:', data);
    console.log('📊 Room details:', data.room);
    console.log('👥 Players in room:', data.room.players);
    console.log('👤 Player count:', data.room.player_count);
    
    if (!data.room_code || !data.room || !data.room.players || data.room.player_count === 0) {
        console.error('❌ ERROR: Invalid room data or player not added!');
        showNotification('Error creating room. Please try again.', 'error');
        return;
    }
    
    currentRoomCode = data.room_code.toUpperCase();
    showNotification('Room created successfully!', 'success');
    
    // Small delay to ensure room is fully created on server
    setTimeout(() => {
        window.location.href = `lobby.html?room=${currentRoomCode}`;
    }, 500);
}

function handleRoomJoined(data) {
    console.log('Room joined:', data);
    currentRoomCode = data.room_code;
    if (window.location.pathname.includes('lobby.html')) {
        updateLobbyPlayers(data.room.players);
        checkHostStatus(data.room.host_sid);
    }
}

function handleJoinError(data) {
    showNotification(data.message, 'error');
}

function handlePlayerJoined(data) {
    console.log('Player joined:', data);
    showNotification(`${data.username} joined the room`, 'info');
    
    if (window.location.pathname.includes('lobby.html')) {
        updateLobbyPlayers(data.players);
    }
}

function handlePlayerLeft(data) {
    console.log('Player left:', data);
    showNotification(`${data.username} left the room`, 'info');
    
    if (window.location.pathname.includes('lobby.html')) {
        updateLobbyPlayers(data.players);
    } else if (window.location.pathname.includes('game.html')) {
        updateScoreboard(data.players);
    }
}

function handleGameStarted(data) {
    console.log('Game started:', data);
    isDrawer = (data.drawer_sid === mySocketId);
    
    // Store initial game state
    localStorage.setItem('gameState', JSON.stringify({
        isDrawer,
        drawerSid: data.drawer_sid,
        drawerUsername: data.drawer_username,
    }));
    
    // Redirect to game page
    window.location.href = `game.html?room=${currentRoomCode}`;
}

function handleYourTurnToDraw(data) {
    console.log('Your turn to draw:', data);
    isDrawer = true;
    showDrawingInterface(data.word, data.category);
}

function handleNewTurn(data) {
    console.log('New turn:', data);
    isDrawer = (data.drawer_sid === mySocketId);
    
    // Update current drawer display
    const currentDrawerName = data.drawer_username || 'Unknown';
    document.getElementById('currentDrawerName').textContent = currentDrawerName;
    
    // Show/hide word based on whether it's your turn
    const wordDisplay = document.getElementById('wordDisplay');
    const currentWord = document.getElementById('currentWord');
    const categoryDisplay = document.getElementById('currentCategory');
    
    if (isDrawer) {
        showNotification("It's your turn to draw!", 'success');
        // Drawer will receive their word via 'your_turn_to_draw' event; show loading until then
        currentWord.textContent = 'Loading...';
        categoryDisplay.textContent = data.category || '-';
        enableDrawing();
    } else {
        showNotification(`${currentDrawerName}'s turn to draw!`, 'info');
        // Use word_length to show blanks instead of revealing the word
        const len = data.word_length || 0;
        currentWord.textContent = len > 0 ? '_ '.repeat(len).trim() : 'Waiting for turn...';
        categoryDisplay.textContent = data.category || '-';
        disableDrawing();
    }
    
    updateGameState(data.game_state);
    clearDrawingCanvas();
}

function handleTimerUpdate(data) {
    // Update timer display directly without restarting local interval
    const time = data && data.time_remaining !== undefined ? data.time_remaining : null;
    const timerEl = document.getElementById('timer');
    if (time !== null && timerEl) {
        const valueEl = timerEl.querySelector('.timer-value');
        if (valueEl) valueEl.textContent = time;
        if (time <= 10) timerEl.classList.add('warning'); else timerEl.classList.remove('warning');
    }
}

function handleTurnEnded(data) {
    console.log('Turn ended:', data);
    showTurnEndModal(data.word, data.leaderboard);
}

function handleGameEnded(data) {
    console.log('Game ended:', data);
    showGameEndModal(data.final_leaderboard, data.winners);
}

function handleRemoteDraw(data) {
    if (!isDrawer) {
        drawOnCanvas(data);
    }
}

function handleRemoteClearCanvas() {
    if (!isDrawer) {
        clearDrawingCanvas();
    }
}

function handleChatMessage(data) {
    addChatMessage(data.username, data.message, false);
}

function handleCorrectGuess(data) {
    showNotification(`${data.username} guessed correctly! +${data.points} points`, 'success');
    addChatMessage('System', `${data.username} guessed the word!`, true, 'correct');
    updateScoreboard(data.leaderboard);
}

function handleAlreadyGuessed(data) {
    showNotification(data.message, 'warning');
}

function handleReaction(data) {
    showReactionOnCanvas(data.emoji, data.x, data.y);
}

function handleError(data) {
    console.error('Server error:', data);
    showNotification(data.message || 'An error occurred', 'error');
}

// ==================== UTILITY FUNCTIONS ====================

function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    if (typeof displayNotification === 'function') {
        displayNotification(message, type);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize socket connection when script loads
if (typeof io !== 'undefined') {
    initializeSocket();
} else {
    console.error('Socket.IO library not loaded');
}

// Export functions for use in other scripts
window.socketClient = {
    createRoom,
    joinRoom,
    startGame,
    sendDrawing,
    clearCanvas,
    sendGuess,
    sendChatMessage,
    sendReaction,
    leaveRoom,
    getSocket: () => socket,
    getRoomCode: () => currentRoomCode,
    getUsername: () => currentUsername,
    isDrawer: () => isDrawer
};