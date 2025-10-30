"""
Session Management
"""
from datetime import datetime

class GameSession:
    """Manages active game sessions."""
    
    def __init__(self):
        self.active_sessions = {}  # {sid: session_data}
    
    def create_session(self, sid, room_code, username):
        """Create a new session for a player."""
        self.active_sessions[sid] = {
            'room_code': room_code,
            'username': username,
            'connected_at': datetime.now(),
            'is_drawer': False,
            'current_word': None
        }
    
    def update_session(self, sid, **kwargs):
        """Update session data for a player."""
        if sid in self.active_sessions:
            self.active_sessions[sid].update(kwargs)
    
    def get_session(self, sid):
        """Get session data for a player."""
        return self.active_sessions.get(sid)
    
    def remove_session(self, sid):
        """Remove a player's session."""
        if sid in self.active_sessions:
            del self.active_sessions[sid]
    
    def get_room_sessions(self, room_code):
        """Get all sessions for a room."""
        return {sid: data for sid, data in self.active_sessions.items()
                if data['room_code'] == room_code}

# Global session manager
game_sessions = GameSession()