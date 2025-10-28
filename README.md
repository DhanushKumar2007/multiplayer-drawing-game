# 🎨 Multiplayer Drawing Game

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)](https://flask.palletsprojects.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-5.3.5-orange.svg)](https://socket.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A real-time multiplayer drawing and guessing game built with Flask, Socket.IO, and HTML5 Canvas. Created as part of my student developer portfolio.

![Game Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=Add+Your+Screenshot+Here)

## ✨ Features

- 🎮 **Real-time Multiplayer**: Play with 2-8 players simultaneously
- 🎨 **Interactive Canvas**: Smooth drawing with customizable colors and brush sizes
- 💬 **Live Chat System**: Instant messaging and guessing
- 😂 **Animated Emoji Reactions**: Express yourself with floating emojis
- ⏱️ **Smart Timer System**: 60-second turns with visual warnings
- 🏆 **Dynamic Scoring**: Points with speed bonuses for quick guesses
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile
- ✨ **Modern UI**: Glassmorphism design with smooth animations

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Modern web browser

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/YOUR_USERNAME/multiplayer-drawing-game.git
   cd multiplayer-drawing-game
```

2. **Create virtual environment**
```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Mac/Linux
   source venv/bin/activate
```

3. **Install dependencies**
```bash
   cd backend
   pip install -r requirements.txt
```

4. **Run the application**
```bash
   python app.py
```

5. **Open your browser**
```
   http://localhost:5000
```

## 🎮 How to Play

1. **Create/Join Room** - Enter your name and create a room or join with a 6-digit code
2. **Wait for Players** - Share room code with friends (minimum 2 players)
3. **Start Game** - Host starts when ready
4. **Draw** - Take turns drawing the secret word
5. **Guess** - Type guesses in chat for points
6. **Win** - Most points after 3 rounds wins! 🏆

## 🎯 Game Rules

| Rule | Value |
|------|-------|
| Players | 2-8 per room |
| Rounds | 3 total |
| Turn Time | 60 seconds |
| Correct Guess | 10 points |
| Speed Bonus | +5 points (under 30s) |
| Drawer Bonus | 5 points per guess |

## 🛠️ Technology Stack

### Backend
- **Flask** - Python web framework
- **Flask-SocketIO** - WebSocket support for real-time communication
- **Python-SocketIO** - Socket.IO server
- **Eventlet** - Concurrent networking library

### Frontend
- **HTML5 Canvas API** - Drawing functionality
- **Socket.IO Client** - Real-time bidirectional communication
- **Vanilla JavaScript** - No frameworks, pure JS
- **CSS3** - Modern animations with glassmorphism

## 📁 Project Structure
```
multiplayer-drawing-game/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── config.py           # Game configuration
│   ├── game_logic.py       # Game state management
│   ├── rooms.py            # Room & player management
│   ├── scoring.py          # Score calculation
│   ├── words.py            # Word bank
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html          # Landing page
│   ├── lobby.html          # Waiting room
│   ├── game.html           # Main game interface
│   ├── results.html        # Final scores
│   ├── css/                # Stylesheets
│   └── js/                 # Client-side logic
└── README.md
```

## 🎨 Screenshots

> Add screenshots of your game here when deployed

## 🚀 Deployment

### Deploy to Render (Free)

1. Fork this repository
2. Sign up at [render.com](https://render.com)
3. Create new Web Service
4. Connect your GitHub repository
5. Use these settings:
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && python app.py`

### Deploy to Railway (Free)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] User authentication system
- [ ] Custom word lists
- [ ] Private rooms with passwords
- [ ] Game replay feature
- [ ] Leaderboard system
- [ ] Mobile app (React Native)

## 📧 Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter) - your.email@example.com

Project Link: [https://github.com/YOUR_USERNAME/multiplayer-drawing-game](https://github.com/YOUR_USERNAME/multiplayer-drawing-game)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Skribbl.io and Pictionary
- Built as part of [Your University] student developer portfolio
- Created for [Student Ambassador Program Name] application

---

⭐ **If you found this project helpful, please give it a star!** ⭐