"""
Word Bank for Drawing Game
"""
import random

WORD_BANK = {
    "animals": [
        "cat", "dog", "elephant", "giraffe", "lion", "tiger", "bear",
        "rabbit", "fox", "wolf", "monkey", "zebra", "penguin", "dolphin",
        "shark", "whale", "octopus", "butterfly", "eagle", "owl"
    ],
    "objects": [
        "chair", "table", "lamp", "book", "phone", "computer", "guitar",
        "piano", "umbrella", "clock", "mirror", "camera", "bicycle",
        "car", "airplane", "rocket", "house", "castle", "bridge", "key"
    ],
    "food": [
        "pizza", "burger", "apple", "banana", "strawberry", "watermelon",
        "carrot", "broccoli", "bread", "cheese", "ice cream", "cake",
        "donut", "cookie", "sushi", "taco", "pasta", "salad", "coffee", "tea"
    ],
    "sports": [
        "football", "basketball", "tennis", "baseball", "golf", "swimming",
        "running", "cycling", "skiing", "skateboard", "surfing", "boxing",
        "yoga", "volleyball", "hockey", "cricket", "bowling", "archery",
        "wrestling", "karate"
    ],
    "nature": [
        "tree", "flower", "mountain", "river", "ocean", "sun", "moon",
        "star", "cloud", "rainbow", "lightning", "volcano", "island",
        "waterfall", "desert", "forest", "beach", "canyon", "lake", "cave"
    ]
}


def get_random_word(category=None, exclude_words=None):
    """
    Get a random word from a category.
    
    Args:
        category: Word category (or None for random category)
        exclude_words: List of words to exclude (already used in this game)
    
    Returns:
        Tuple of (word, category)
    """
    if exclude_words is None:
        exclude_words = []
    
    # Choose random category if not specified
    if category is None or category not in WORD_BANK:
        category = random.choice(list(WORD_BANK.keys()))
    
    # Filter out excluded words
    available_words = [w for w in WORD_BANK[category] if w not in exclude_words]
    
    # If all words used, reset and use all words
    if not available_words:
        available_words = WORD_BANK[category]
    
    word = random.choice(available_words)
    return word, category


def get_word_hint(word, reveal_count=1):
    """
    Generate a hint by revealing some letters.
    
    Args:
        word: The word to hint
        reveal_count: Number of letters to reveal
    
    Returns:
        String with revealed letters and underscores
    """
    hint = ['_'] * len(word)
    indices = random.sample(range(len(word)), min(reveal_count, len(word)))
    
    for idx in indices:
        hint[idx] = word[idx]
    
    return ' '.join(hint)


def validate_guess(guess, correct_word):
    """
    Check if a guess is correct (case-insensitive, strip whitespace).
    
    Args:
        guess: Player's guess
        correct_word: The correct word
    
    Returns:
        Boolean
    """
    return guess.strip().lower() == correct_word.strip().lower()