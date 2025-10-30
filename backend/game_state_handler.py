@socketio.on('get_game_state')
def handle_get_game_state(data):
    """Handle request for current game state."""
    room_code = data.get('room_code')
    if not room_code:
        return
    
    room = get_room(room_code)
    if not room:
        return
    
    game_state = get_game_state(room_code)
    if not game_state:
        return
    
    # Get current drawer information
    current_drawer = None
    drawer_username = None
    if game_state.drawer_sid:
        drawer = room.get_player(game_state.drawer_sid)
        if drawer:
            drawer_username = drawer.username
    
    # Send game state update
    emit('game_state_update', {
        'current_drawer': drawer_username,
        'drawer_sid': game_state.drawer_sid,
        'word': game_state.current_word if game_state.drawer_sid == request.sid else None,
        'category': game_state.word_category,
        'current_round': game_state.current_round
    })