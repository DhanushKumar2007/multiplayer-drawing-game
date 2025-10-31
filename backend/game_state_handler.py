def register_game_state_handlers(socketio, get_room_fn, get_game_state_fn, game_sessions):
    @socketio.on('get_game_state')
    def handle_get_game_state(data):
        room_code = data.get('room_code')
        sid = request.sid  # you can import request from flask inside this function if needed

        if not room_code:
            return

        room = get_room_fn(room_code)
        if not room:
            return

        game_state = get_game_state_fn(room_code)
        if not game_state:
            return

        # ...same logic as before, using room and game_state...
        emit('game_state_update', {
            'current_drawer': drawer_username,
            'drawer_sid': game_state.drawer_sid,
            'word': game_state.current_word if game_state.drawer_sid == sid else None,
            'category': game_state.word_category,
            'current_round': game_state.current_round
        })