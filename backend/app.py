"""
Main Flask Server with Socket.IO
"""
from flask import Flask, send_from_directory, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import threading
import time

from .rooms import create_room, get_room, join_room as join_room_logic, leave_room as leave_room_logic, get_player_room
from .game_logic import get_game_state, delete_game_state
from .scoring import calculate_guesser_points, calculate_drawer_points, get_leaderboard, get_winner, reset_round_scores
from .words import validate_guess, get_word_hint
from .config import MIN_PLAYERS, TURN_DURATION

app = Flask(__name__, static_folder='../frontend', template_folder='../frontend')
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")


# ===== SERVE STATIC FILES =====
@app.route('/')
def index():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)


# ===== SOCKET.IO EVENTS =====

@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    print(f"Client connected: {request.sid}")
    emit('connected', {'sid': request.sid})


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    sid = request.sid
    print(f"Client disconnected: {sid}")
    
    room = get_player_room(sid)
    if room:
        room_code = room.room_code
        player = room.get_player(sid)
        username = player.username if player else "Unknown"
        
        game_state = get_game_state(room_code)
        was_drawer = game_state.is_drawer(sid)
        
        leave_room_logic(room_code, sid)
        leave_room(room_code)
        
        if room.get_player_count() > 0:
            emit('player_left', {
                'username': username,
                'players': room.get_players_list()
            }, room=room_code)
            
            if was_drawer and game_state.game_active:
                handle_turn_end(room_code)
        else:
            delete_game_state(room_code)


@socketio.on('create_room')
def handle_create_room(data):
    """Create a new room."""
    username = data.get('username', 'Player')
    sid = request.sid
    
    room = create_room(sid, username)
    join_room(room.room_code)
    
    emit('room_created', {
        'room_code': room.room_code,
        'room': room.to_dict()
    })


@socketio.on('join_room')
def handle_join_room(data):
    """Join an existing room."""
    room_code = data.get('room_code', '').upper()
    username = data.get('username', 'Player')
    sid = request.sid
    
    room, message = join_room_logic(room_code, sid, username)
    
    if not room:
        emit('join_error', {'message': message})
        return
    
    join_room(room_code)
    
    emit('room_joined', {
        'room_code': room_code,
        'room': room.to_dict()
    })
    
    emit('player_joined', {
        'username': username,
        'players': room.get_players_list()
    }, room=room_code)


@socketio.on('start_game')
def handle_start_game(data):
    """Start the game."""
    room_code = data.get('room_code')
    sid = request.sid
    
    room = get_room(room_code)
    if not room:
        emit('error', {'message': 'Room not found'})
        return
    
    if room.host_sid != sid:
        emit('error', {'message': 'Only host can start game'})
        return
    
    if room.get_player_count() < MIN_PLAYERS:
        emit('error', {'message': f'Need at least {MIN_PLAYERS} players'})
        return
    
    room.game_started = True
    game_state = get_game_state(room_code)
    player_sids = list(room.players.keys())
    game_state.start_game(player_sids)
    game_state.start_turn()
    reset_round_scores(room.players)
    
    emit('game_started', {
        'game_state': game_state.to_dict(),
        'drawer_sid': game_state.drawer_sid
    }, room=room_code)
    
    emit('your_turn_to_draw', {
        'word': game_state.current_word,
        'category': game_state.word_category
    }, room=game_state.drawer_sid)
    
    start_turn_timer(room_code)


@socketio.on('draw')
def handle_draw(data):
    """Broadcast drawing data."""
    room_code = data.get('room_code')
    game_state = get_game_state(room_code)
    
    if not game_state.is_drawer(request.sid):
        return
    
    emit('draw', data, room=room_code, include_self=False)


@socketio.on('clear_canvas')
def handle_clear_canvas(data):
    """Clear canvas for all players."""
    room_code = data.get('room_code')
    game_state = get_game_state(room_code)
    
    if not game_state.is_drawer(request.sid):
        return
    
    emit('clear_canvas', {}, room=room_code, include_self=False)


@socketio.on('guess')
def handle_guess(data):
    """Handle player guess."""
    room_code = data.get('room_code')
    guess = data.get('guess', '')
    sid = request.sid
    
    room = get_room(room_code)
    game_state = get_game_state(room_code)
    
    if not room or not game_state.game_active:
        return
    
    player = room.get_player(sid)
    if not player:
        return
    
    if game_state.is_drawer(sid):
        return
    
    if game_state.has_player_guessed(sid):
        emit('already_guessed', {'message': 'You already guessed correctly!'})
        return
    
    if validate_guess(guess, game_state.current_word):
        game_state.mark_player_guessed(sid)
        
        time_elapsed = game_state.get_time_elapsed()
        guesser_points = calculate_guesser_points(time_elapsed)
        drawer_points = calculate_drawer_points()
        
        player.score += guesser_points
        player.has_guessed = True
        
        drawer = room.get_player(game_state.drawer_sid)
        if drawer:
            drawer.score += drawer_points
        
        emit('correct_guess', {
            'username': player.username,
            'points': guesser_points,
            'time_elapsed': time_elapsed,
            'leaderboard': get_leaderboard(room.players)
        }, room=room_code)
        
        non_drawers = [p for p in room.players.keys() if p != game_state.drawer_sid]
        if len(game_state.guessed_players) >= len(non_drawers):
            handle_turn_end(room_code)
    else:
        emit('chat_message', {
            'username': player.username,
            'message': guess,
            'is_system': False
        }, room=room_code)


@socketio.on('chat_message')
def handle_chat_message(data):
    """Handle chat messages (non-guess messages)."""
    room_code = data.get('room_code')
    message = data.get('message', '')
    sid = request.sid
    
    room = get_room(room_code)
    if not room:
        return
    
    player = room.get_player(sid)
    if not player:
        return
    
    emit('chat_message', {
        'username': player.username,
        'message': message,
        'is_system': False
    }, room=room_code)


@socketio.on('reaction')
def handle_reaction(data):
    """Handle emoji reactions."""
    room_code = data.get('room_code')
    emoji = data.get('emoji')
    sid = request.sid
    
    room = get_room(room_code)
    if not room:
        return
    
    player = room.get_player(sid)
    if not player:
        return
    
    emit('reaction', {
        'username': player.username,
        'emoji': emoji,
        'x': data.get('x', 50),
        'y': data.get('y', 50)
    }, room=room_code)


# ===== HELPER FUNCTIONS =====

def start_turn_timer(room_code):
    """Start background timer for turn."""
    def timer():
        time.sleep(TURN_DURATION)
        game_state = get_game_state(room_code)
        
        if game_state.timer_active and game_state.is_turn_expired():
            handle_turn_end(room_code)
    
    thread = threading.Thread(target=timer, daemon=True)
    thread.start()


def handle_turn_end(room_code):
    """Handle end of turn."""
    room = get_room(room_code)
    game_state = get_game_state(room_code)
    
    if not room or not game_state.game_active:
        return
    
    socketio.emit('turn_ended', {
        'word': game_state.current_word,
        'leaderboard': get_leaderboard(room.players)
    }, room=room_code)
    
    reset_round_scores(room.players)
    game_ended = game_state.end_turn()
    
    if game_ended:
        winners = get_winner(room.players)
        socketio.emit('game_ended', {
            'final_leaderboard': get_leaderboard(room.players),
            'winners': winners
        }, room=room_code)
        
        game_state.game_active = False
    else:
        time.sleep(3)
        game_state.start_turn()
        
        socketio.emit('new_turn', {
            'game_state': game_state.to_dict(),
            'drawer_sid': game_state.drawer_sid
        }, room=room_code)
        
        socketio.emit('your_turn_to_draw', {
            'word': game_state.current_word,
            'category': game_state.word_category
        }, room=game_state.drawer_sid)
        
        start_turn_timer(room_code)


if __name__ == '__main__':
    import os
    
    # Get port from environment (Render provides this)
    port = int(os.environ.get('PORT', 5000))
    
    # Check if running on Render (production)
    is_production = os.environ.get('RENDER') is not None
    
    if is_production:
        # Production settings for Render
        socketio.run(
            app, 
            host='0.0.0.0', 
            port=port, 
            debug=False,
            allow_unsafe_werkzeug=True  # Required for Render deployment
        )
    else:
        # Development settings for local testing
        socketio.run(app, host='0.0.0.0', port=5000, debug=True)