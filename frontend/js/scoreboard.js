/**
 * Scoreboard Handler
 * Manages player scores and leaderboard display
 */

let scoreboardList = null;
let currentDrawerSid = null;

// Initialize scoreboard
function initializeScoreboard() {
    scoreboardList = document.getElementById('scoreboardList');
    
    if (!scoreboardList) {
        console.error('Scoreboard element not found');
        return;
    }
    
    console.log('✅ Scoreboard initialized');
}

// ==================== SCOREBOARD FUNCTIONS ====================

function updateScoreboard(leaderboard) {
    if (!scoreboardList) return;
    
    // Clear existing scores
    scoreboardList.innerHTML = '';
    
    // Sort by score (descending)
    const sortedPlayers = [...leaderboard].sort((a, b) => b.score - a.score);
    
    // Create score items
    sortedPlayers.forEach((player, index) => {
        const scoreItem = createScoreItem(player, index);
        scoreboardList.appendChild(scoreItem);
    });
}

function createScoreItem(player, rank) {
    const div = document.createElement('div');
    div.className = 'score-item';
    div.dataset.sid = player.sid;
    
    // Add special classes
    if (player.sid === currentDrawerSid) {
        div.classList.add('current-drawer');
    }
    
    if (player.has_guessed) {
        div.classList.add('has-guessed');
    }
    
    // Rank medals
    const medals = ['🥇', '🥈', '🥉'];
    const rankDisplay = rank < 3 ? medals[rank] : `${rank + 1}.`;
    
    div.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.5rem;">${rankDisplay}</span>
            <span class="score-name">${escapeHtml(player.username)}</span>
        </div>
        <span class="score-points">${player.score}</span>
    `;
    
    // Add entrance animation with delay
    div.style.animationDelay = `${rank * 0.1}s`;
    
    return div;
}

function setCurrentDrawer(drawerSid) {
    currentDrawerSid = drawerSid;
    
    // Update visual indicator
    const allItems = scoreboardList.querySelectorAll('.score-item');
    allItems.forEach(item => {
        item.classList.remove('current-drawer');
        if (item.dataset.sid === drawerSid) {
            item.classList.add('current-drawer');
        }
    });
}

function markPlayerGuessed(playerSid) {
    const scoreItem = scoreboardList.querySelector(`[data-sid="${playerSid}"]`);
    if (scoreItem) {
        scoreItem.classList.add('has-guessed');
        
        // Add celebration animation
        scoreItem.style.animation = 'none';
        setTimeout(() => {
            scoreItem.style.animation = 'correctGuess 0.5s ease';
        }, 10);
    }
}

function clearGuessedStatus() {
    const allItems = scoreboardList.querySelectorAll('.score-item');
    allItems.forEach(item => {
        item.classList.remove('has-guessed');
    });
}

function animateScoreChange(playerSid, newScore) {
    const scoreItem = scoreboardList.querySelector(`[data-sid="${playerSid}"]`);
    if (scoreItem) {
        const scorePoints = scoreItem.querySelector('.score-points');
        if (scorePoints) {
            // Animate score change
            scorePoints.style.animation = 'pointsPop 0.5s ease';
            scorePoints.textContent = newScore;
            
            // Reset animation
            setTimeout(() => {
                scorePoints.style.animation = '';
            }, 500);
        }
    }
}

// Helper function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize scoreboard when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScoreboard);
} else {
    initializeScoreboard();
}