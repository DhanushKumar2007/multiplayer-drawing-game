"""
Room and Player Management
"""
import random
import string
from datetime import datetime
from .config import ROOM_CODE_LENGTH, ROOM_CODE_CHARS, MAX_PLAYERS

# Global storage for rooms (in production, use Redis or database)
rooms = {}


def generate_room_code():
    """Generate a unique room code."""
    while True:
        code = ''.join(random.choices(ROOM_CODE_CHARS, k=ROOM_CODE_LENGTH))
        if code not in rooms:
            return code


class Player:
    """Represents a player in the game."""
    def __init__(self, sid, username):
        self.sid = sid  # Socket ID
        self.username = username
        self.score = 0
        self.has_guessed = False
        self.joined_at = datetime.now()
    
    def to_dict(self):
        return {
            'sid': self.sid,
            'username': self.username,
            'score': self.score,
            'has_guessed': self.has_guessed
        }


class Room:
    """Represents a game room."""
    def __init__(self, room_code, host_sid, host_username):
        if not room_code or not host_sid or not host_username:
            raise ValueError("Room code, host SID, and host username are required")
            
        self.room_code = room_code.upper()  # Ensure uppercase
        self.host_sid = host_sid
        self.players = {}  # {sid: Player}
        self.game_started = False
        self.created_at = datetime.now()
        
        # Add host as first player
        try:
            player = Player(host_sid, host_username)
            self.players[host_sid] = player
            print(f"🏠 Room initialized - Code: {room_code}, Host: {host_username}, Player count: {len(self.players)}")
            
            if host_sid not in self.players:
                raise Exception("Failed to add host to players list")
                
        except Exception as e:
            print(f"❌ Error initializing room: {str(e)}")
            raise
    
    def add_player(self, sid, username):
        """Add a player to the room."""
        if len(self.players) >= MAX_PLAYERS:
            return False, "Room is full"
        
        if sid in self.players:
            return False, "Already in room"
        
        # Check for duplicate username
        if any(p.username == username for p in self.players.values()):
            return False, "Username already taken"
        
        self.players[sid] = Player(sid, username)
        print(f"✅ Player added - Room: {self.room_code}, User: {username}, Total players: {len(self.players)}")
        return True, "Joined successfully"
    
    def remove_player(self, sid):
        """Remove a player from the room."""
        if sid in self.players:
            del self.players[sid]
            
            # If host leaves, assign new host
            if sid == self.host_sid and self.players:
                self.host_sid = list(self.players.keys())[0]
            
            return True
        return False
    
    def get_player(self, sid):
        """Get a player by socket ID."""
        return self.players.get(sid)
    
    def get_players_list(self):
        """Get list of all players."""
        return [p.to_dict() for p in self.players.values()]
    
    def get_player_count(self):
        """Get current player count."""
        return len(self.players)
    
    def to_dict(self):
        """Convert room to dictionary."""
        return {
            'room_code': self.room_code,
            'host_sid': self.host_sid,
            'players': self.get_players_list(),
            'player_count': self.get_player_count(),
            'game_started': self.game_started
        }


def create_room(host_sid, host_username):
    """Create a new room."""
    if not host_sid or not host_username:
        raise ValueError("Host SID and username are required to create a room")
        
    try:
        room_code = generate_room_code()
        room = Room(room_code, host_sid, host_username)
        
        # Verify room was created successfully
        if not room or room.get_player_count() == 0:
            raise Exception("Room creation failed - no players added")
            
        # Store room in global rooms dictionary
        rooms[room_code] = room
        
        print(f"🎨 Room created successfully:")
        print(f"   - Code: {room_code}")
        print(f"   - Host: {host_username} (SID: {host_sid})")
        print(f"   - Players: {room.get_player_count()}")
        print(f"   - Total rooms: {len(rooms)}")
        
        return room
        
    except Exception as e:
        print(f"❌ Failed to create room: {str(e)}")
        raise


def get_room(room_code):
    """Get a room by code."""
    return rooms.get(room_code.upper())


def join_room(room_code, sid, username):
    """Join an existing room."""
    if not room_code:
        print("❌ No room code provided")
        return None, "Room code is required"
        
    # Convert room code to uppercase for consistency
    room_code = room_code.upper()
    room = get_room(room_code)
    
    if not room:
        print(f"❌ Room not found: {room_code}")
        print(f"Available rooms: {list(rooms.keys())}")
        return None, "Room not found"
    
    if room.game_started:
        return None, "Game already in progress"
    
    # Log room state before adding player
    print(f"📊 Room state before adding player - Code: {room_code}, Players: {room.get_player_count()}")
    
    success, message = room.add_player(sid, username)
    
    if success:
        # Log successful join
        print(f"✅ Player joined successfully - Room: {room_code}, User: {username}, Total players: {room.get_player_count()}")
        return room, message
    else:
        print(f"❌ Failed to add player: {message}")
        return None, message


def leave_room(room_code, sid):
    """Leave a room."""
    room = get_room(room_code)
    
    if not room:
        return False
    
    room.remove_player(sid)
    
    # Delete room if empty
    if room.get_player_count() == 0:
        del rooms[room_code]
    
    return True


def get_player_room(sid):
    """Find which room a player is in."""
    for room in rooms.values():
        if sid in room.players:
            return room
    return None