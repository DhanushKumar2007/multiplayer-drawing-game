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
    // Connect to server (adjust URL for production)
    socket = io(window.location.origin, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
    });

    // Connection event handlers
    socket.on('connect', () => {
        console.log('✅ Connected to server');
        showNotification('Connected to server', 'success');
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
    socket.emit('create_room', { username });
}

function joinRoom(roomCode, username) {
    currentUsername = username;
    currentRoomCode = roomCode;
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
    
    currentRoomCode = data.room_code;
    
    // Verify player was added
    if (data.room.player_count === 0) {
        console.error('❌ ERROR: Player count is 0! Creator was not added to room!');
    }
    
    window.location.href = `lobby.html?room=${data.room_code}`;
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
    
    if (isDrawer) {
        showNotification("It's your turn to draw!", 'info');
    } else {
        showNotification("New turn started!", 'info');
        hideDrawingInterface();
    }
    
    updateGameState(data.game_state);
    clearDrawingCanvas();
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