"""
Game Configuration Settings
"""

# Game Rules
TOTAL_ROUNDS = 3
TURN_DURATION = 60  # seconds per turn
MAX_PLAYERS = 8
MIN_PLAYERS = 2

# Scoring System
POINTS_PER_CORRECT_GUESS = 10
DRAWER_POINTS_PER_GUESS = 5
SPEED_BONUS_THRESHOLD = 30  # seconds - bonus if guessed within this time
SPEED_BONUS_POINTS = 5

# Room Settings
ROOM_CODE_LENGTH = 6
ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # Excluding confusing chars (I, O, 0, 1)

# Timer Settings
LOBBY_WAIT_TIME = 10  # seconds before auto-start if min players reached
ROUND_TRANSITION_TIME = 5  # seconds to show scores between rounds
GAME_END_DISPLAY_TIME = 10  # seconds to show final results

# Canvas Settings
CANVAS_WIDTH = 800
CANVAS_HEIGHT = 600

# Word Categories
WORD_CATEGORIES = ["animals", "objects", "food", "sports", "nature"]
DEFAULT_CATEGORY = "animals"