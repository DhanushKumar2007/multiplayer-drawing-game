def register_game_state_handlers(socketio, get_room_fn, get_game_state_fn, game_sessions):
    """Register game-state related socket handlers.

    This function is called from `app.py` after the `socketio` instance is created
    to avoid import-time decorator evaluation problems.
    """
    from flask import request
    from flask_socketio import emit

    @socketio.on('get_game_state')
    def handle_get_game_state(data):
        room_code = data.get('room_code')
        sid = request.sid

        if not room_code:
            return

        room = get_room_fn(room_code)
        if not room:
            return

        game_state = get_game_state_fn(room_code)
        if not game_state:
            return

        # Ensure a session exists for this SID
        session_data = game_sessions.get_session(sid)
        if not session_data:
            player = room.get_player(sid)
            if player:
                game_sessions.create_session(sid, room_code, player.username)
                session_data = game_sessions.get_session(sid)

        # Determine drawer username (for display) and whether caller is drawer
        drawer = room.get_player(game_state.drawer_sid) if game_state.drawer_sid else None
        drawer_username = drawer.username if drawer else None
        is_drawer = (game_state.drawer_sid == sid)

        # Update session with current state
        if session_data:
            game_sessions.update_session(
                sid,
                is_drawer=is_drawer,
                current_word=game_state.current_word if is_drawer else None
            )

        # Send game state update - only include the secret word for the drawer
        emit('game_state_update', {
            'current_drawer': drawer_username,
            'drawer_sid': game_state.drawer_sid,
            'word': game_state.current_word if is_drawer else None,
            'category': game_state.word_category,
            'current_round': game_state.current_round,
            'is_drawer': is_drawer,
            'game_active': game_state.game_active,
            'time_remaining': game_state.get_time_remaining()
        })