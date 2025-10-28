"""
Game Logic - Rounds, Turns, and Game State Management
"""
import time
from datetime import datetime
from config import TOTAL_ROUNDS, TURN_DURATION
from words import get_random_word


class GameState:
    """Manages the game state for a room."""
    
    def __init__(self, room_code):
        self.room_code = room_code
        self.current_round = 1
        self.current_drawer_index = 0
        self.drawer_sid = None
        self.current_word = None
        self.word_category = None
        self.used_words = []  # Track used words to avoid repetition
        
        self.turn_start_time = None
        self.turn_end_time = None
        self.timer_active = False
        
        self.players_order = []  # List of SIDs in drawing order
        self.guessed_players = set()  # SIDs of players who guessed correctly
        
        self.game_active = False
        self.game_ended = False
    
    def start_game(self, player_sids):
        """Initialize game with player order."""
        self.players_order = list(player_sids)
        self.game_active = True
        self.current_round = 1
        self.current_drawer_index = 0
        self.used_words = []
    
    def start_turn(self):
        """Start a new turn."""
        if not self.players_order:
            return False
        
        # Set current drawer
        self.drawer_sid = self.players_order[self.current_drawer_index]
        
        # Select a random word
        self.current_word, self.word_category = get_random_word(exclude_words=self.used_words)
        self.used_words.append(self.current_word)
        
        # Start timer
        self.turn_start_time = time.time()
        self.turn_end_time = self.turn_start_time + TURN_DURATION
        self.timer_active = True
        
        # Reset guessed players
        self.guessed_players.clear()
        
        return True
    
    def end_turn(self):
        """End the current turn."""
        self.timer_active = False
        self.turn_start_time = None
        self.turn_end_time = None
        
        # Move to next drawer
        self.current_drawer_index += 1
        
        # Check if round is complete (all players have drawn)
        if self.current_drawer_index >= len(self.players_order):
            return self.end_round()
        
        return False  # Round not complete
    
    def end_round(self):
        """End the current round and check if game is complete."""
        self.current_drawer_index = 0
        self.current_round += 1
        
        # Check if game is complete
        if self.current_round > TOTAL_ROUNDS:
            self.game_ended = True
            self.game_active = False
            return True  # Game complete
        
        return False  # More rounds to play
    
    def mark_player_guessed(self, sid):
        """Mark a player as having guessed correctly."""
        self.guessed_players.add(sid)
    
    def has_player_guessed(self, sid):
        """Check if a player has already guessed."""
        return sid in self.guessed_players
    
    def is_drawer(self, sid):
        """Check if a player is the current drawer."""
        return sid == self.drawer_sid
    
    def get_time_remaining(self):
        """Get remaining time in current turn."""
        if not self.timer_active or not self.turn_end_time:
            return 0
        
        remaining = self.turn_end_time - time.time()
        return max(0, int(remaining))
    
    def get_time_elapsed(self):
        """Get elapsed time in current turn."""
        if not self.turn_start_time:
            return 0
        
        return int(time.time() - self.turn_start_time)
    
    def is_turn_expired(self):
        """Check if current turn time has expired."""
        if not self.timer_active:
            return False
        
        return time.time() >= self.turn_end_time
    
    def remove_player(self, sid):
        """Remove a player from the game (if they disconnect)."""
        if sid in self.players_order:
            # If current drawer leaves, end turn
            if sid == self.drawer_sid:
                return True  # Signal to end turn
            
            self.players_order.remove(sid)
            
            # Adjust drawer index if needed
            if self.current_drawer_index >= len(self.players_order):
                self.current_drawer_index = 0
        
        return False
    
    def to_dict(self):
        """Convert game state to dictionary."""
        return {
            'current_round': self.current_round,
            'total_rounds': TOTAL_ROUNDS,
            'drawer_sid': self.drawer_sid,
            'time_remaining': self.get_time_remaining(),
            'game_active': self.game_active,
            'game_ended': self.game_ended,
            'word_category': self.word_category,
            'guessed_count': len(self.guessed_players)
        }


# Global storage for game states (in production, use Redis or database)
game_states = {}


def get_game_state(room_code):
    """Get or create game state for a room."""
    if room_code not in game_states:
        game_states[room_code] = GameState(room_code)
    return game_states[room_code]


def delete_game_state(room_code):
    """Delete game state for a room."""
    if room_code in game_states:
        del game_states[room_code]