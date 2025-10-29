"""
Word Bank for Drawing Game
"""
import random

WORD_BANK = {
    "animals": [
        "cat", "dog", "elephant", "giraffe", "lion", "tiger", "bear",
        "rabbit", "fox", "wolf", "monkey", "zebra", "penguin", "dolphin",
        "shark", "whale", "octopus", "butterfly", "eagle", "owl",
        "camel", "cow", "goat", "sheep", "horse", "snake", "frog",
        "parrot", "peacock", "bat", "kangaroo", "panda", "koala",
        "crocodile", "hippopotamus", "rhino", "mouse", "squirrel",
        # New 7
        "chameleon", "deer", "turkey", "seal", "hamster", "bee", "crab"
    ],
    "objects": [
        "chair", "table", "lamp", "book", "phone", "computer", "guitar",
        "piano", "umbrella", "clock", "mirror", "camera", "bicycle",
        "car", "airplane", "rocket", "house", "castle", "bridge", "key",
        "pen", "pencil", "bottle", "bag", "shoe", "ball", "helmet",
        "ladder", "door", "window", "fan", "television", "sofa",
        "bed", "cup", "plate", "toothbrush", "wallet", "watch",
        # New 7
        "remote", "notebook", "scissors", "microphone", "drum", "bucket", "knife"
    ],
    "food": [
        "pizza", "burger", "apple", "banana", "strawberry", "watermelon",
        "carrot", "broccoli", "bread", "cheese", "ice cream", "cake",
        "donut", "cookie", "sushi", "taco", "pasta", "salad", "coffee", "tea",
        "sandwich", "noodles", "chocolate", "egg", "fish", "chicken",
        "rice", "soup", "popcorn", "fries", "mango", "grapes", "pineapple",
        "orange", "milkshake", "hotdog", "pancake",
        # New 7
        "biryani", "dumpling", "cupcake", "steak", "brownie", "omelette", "smoothie"
    ],
    "sports": [
        "football", "basketball", "tennis", "baseball", "golf", "swimming",
        "running", "cycling", "skiing", "skateboard", "surfing", "boxing",
        "yoga", "volleyball", "hockey", "cricket", "bowling", "archery",
        "wrestling", "karate", "badminton", "table tennis", "fencing",
        "rugby", "ice skating", "marathon", "judo", "kabaddi",
        # New 7
        "weightlifting", "rock climbing", "taekwondo", "handball", "snooker", "dart", "polo"
    ],
    "nature": [
        "tree", "flower", "mountain", "river", "ocean", "sun", "moon",
        "star", "cloud", "rainbow", "lightning", "volcano", "island",
        "waterfall", "desert", "forest", "beach", "canyon", "lake", "cave",
        "snow", "leaf", "stone", "sand", "storm", "tornado", "earthquake",
        "hill", "field", "grass", "bush", "sunflower", "rose",
        # New 7
        "mushroom", "cliff", "fog", "pond", "glacier", "coral", "bamboo"
    ],
    "places": [
        "school", "hospital", "park", "mall", "zoo", "airport", "station",
        "library", "museum", "beach", "mountain", "temple", "church",
        "stadium", "market", "bridge", "farm", "restaurant", "theater", "village",
        # New 7
        "hotel", "office", "factory", "harbor", "jungle", "playground", "bus stop"
    ],
    "fantasy": [
        "dragon", "unicorn", "wizard", "fairy", "castle", "magic wand",
        "ghost", "vampire", "zombie", "knight", "witch", "mermaid",
        "phoenix", "giant", "robot", "alien", "monster", "superhero", "spaceship", "treasure",
        # New 7
        "time machine", "portal", "crystal ball", "sorcerer", "goblin", "spell book", "magic carpet"
    ]
}


def get_random_word(category=None, exclude_words=None):
    """
    Get a random word from a category.
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
    """
    hint = ['_'] * len(word)
    indices = random.sample(range(len(word)), min(reveal_count, len(word)))

    for idx in indices:
        hint[idx] = word[idx]

    return ' '.join(hint)


def validate_guess(guess, correct_word):
    """
    Check if a guess is correct (case-insensitive, strip whitespace).
    """
    return guess.strip().lower() == correct_word.strip().lower()
