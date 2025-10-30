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
        
        // Load initial state from localStorage if available
        try {
            const savedState = localStorage.getItem('gameState');
            if (savedState) {
                const state = JSON.parse(savedState);
                if (state.drawerUsername) {
                    document.getElementById('currentDrawerName').textContent = state.drawerUsername;
                    if (state.isDrawer) {
                        enableDrawing();
                    } else {
                        disableDrawing();
                    }
                }
            }
        } catch (e) {
            console.error('Error loading saved game state:', e);
        }
        
        // Request current game state
        socket.emit('get_game_state', { room_code: roomCode });
    } else {
        window.location.href = 'index.html';
    }
});

// Handle game state response
socket.on('game_state_update', (data) => {
    console.log('Received game state:', data);
    
    // Update drawer information
    if (data.current_drawer) {
        document.getElementById('currentDrawerName').textContent = data.current_drawer;
        
        if (data.drawer_sid === mySocketId) {
            isDrawer = true;
            document.getElementById('currentWord').textContent = data.word || 'Waiting for word...';
            enableDrawing();
            // Show drawing tools
            const drawingTools = document.getElementById('drawingTools');
            if (drawingTools) {
                drawingTools.style.display = 'flex';
            }
        } else {
            isDrawer = false;
            document.getElementById('currentWord').textContent = data.word ? '_ '.repeat(data.word.length).trim() : 'Waiting for turn...';
            disableDrawing();
            // Hide drawing tools
            const drawingTools = document.getElementById('drawingTools');
            if (drawingTools) {
                drawingTools.style.display = 'none';
            }
        }
    }
    
    // Update category and round information
    document.getElementById('currentCategory').textContent = data.category || '-';
    document.getElementById('currentRound').textContent = data.current_round || '1';
    
    // Show appropriate status message
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        if (isDrawer) {
            statusMessage.textContent = "It's your turn to draw!";
            statusMessage.style.display = 'block';
        } else if (data.current_drawer) {
            statusMessage.textContent = `${data.current_drawer} is drawing...`;
            statusMessage.style.display = 'block';
        } else {
            statusMessage.style.display = 'none';
        }
    }
});