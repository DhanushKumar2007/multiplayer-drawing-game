"""
Scoring Logic for Drawing Game
"""
from .config import (
    POINTS_PER_CORRECT_GUESS,
    DRAWER_POINTS_PER_GUESS,
    SPEED_BONUS_THRESHOLD,
    SPEED_BONUS_POINTS
)


def calculate_guesser_points(time_elapsed):
    """
    Calculate points for a correct guess.
    
    Args:
        time_elapsed: Time taken to guess (in seconds)
    
    Returns:
        Points earned
    """
    base_points = POINTS_PER_CORRECT_GUESS
    
    # Speed bonus for quick guesses
    if time_elapsed <= SPEED_BONUS_THRESHOLD:
        return base_points + SPEED_BONUS_POINTS
    
    return base_points


def calculate_drawer_points():
    """
    Calculate points for the drawer when someone guesses correctly.
    
    Returns:
        Points earned
    """
    return DRAWER_POINTS_PER_GUESS


def get_leaderboard(players):
    """
    Generate leaderboard sorted by score.
    
    Args:
        players: Dictionary of Player objects {sid: Player}
    
    Returns:
        List of player dictionaries sorted by score (descending)
    """
    leaderboard = []
    
    for player in players.values():
        leaderboard.append({
            'username': player.username,
            'score': player.score,
            'sid': player.sid
        })
    
    # Sort by score (descending), then by username (ascending)
    leaderboard.sort(key=lambda x: (-x['score'], x['username']))
    
    return leaderboard


def get_winner(players):
    """
    Determine the winner(s) of the game.
    
    Args:
        players: Dictionary of Player objects
    
    Returns:
        List of winning player dictionaries (can be multiple in case of tie)
    """
    if not players:
        return []
    
    leaderboard = get_leaderboard(players)
    
    if not leaderboard:
        return []
    
    # Get highest score
    highest_score = leaderboard[0]['score']
    
    # Get all players with highest score (handles ties)
    winners = [p for p in leaderboard if p['score'] == highest_score]
    
    return winners


def reset_round_scores(players):
    """
    Reset has_guessed flag for all players at start of new turn.
    
    Args:
        players: Dictionary of Player objects
    """
    for player in players.values():
        player.has_guessed = False