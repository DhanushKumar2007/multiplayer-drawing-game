/**
 * Game State Initialization
 * Handles initial game state setup and updates
 */

// Initialize game state when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Get room code from URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    
    if (roomCode) {
        document.getElementById('gameRoomCode').textContent = roomCode;
        // Request current game state
        socket.emit('get_game_state', { room_code: roomCode });
    } else {
        window.location.href = 'index.html';
    }
});

// Handle game state response
socket.on('game_state_update', (data) => {
    console.log('Received game state:', data);
    if (data.current_drawer) {
        document.getElementById('currentDrawerName').textContent = data.current_drawer;
        
        if (data.drawer_sid === mySocketId) {
            isDrawer = true;
            document.getElementById('currentWord').textContent = data.word || 'Waiting for turn...';
            enableDrawing();
        } else {
            isDrawer = false;
            document.getElementById('currentWord').textContent = data.word ? '_ '.repeat(data.word.length).trim() : 'Waiting for turn...';
            disableDrawing();
        }
    }
    
    document.getElementById('currentCategory').textContent = data.category || '-';
    document.getElementById('currentRound').textContent = data.current_round || '1';
});