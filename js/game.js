// Access the canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images for player, enemies, and coins
const playerImg = new Image();
playerImg.src = '../assets/player.png';

const enemyImg = new Image();
enemyImg.src = '../assets/enemy.png';

const coinImg = new Image();
coinImg.src = '../assets/coin.png';

// Player object
const player = {
    x: 50,
    y: canvas.height / 2 - 50,
    width: 50,
    height: 50,
    speed: 8
};

let playerName = '';
let enemies = [];
let coins = [];
let bullets = [];
let lives = 3;
let score = 0;
let gameRunning = false;  // Game starts only after a valid name is entered
let moveUp = false;
let moveDown = false;
let isPaused = false;

// Function to prompt for the player's name and ensure it's valid
function getPlayerName() {
    let name = '';
    while (!name || name.trim() === '') {
        name = prompt('Enter your name:');
        if (!name || name.trim() === '') {
            alert('Please enter a valid name to start the game.');
        }
    }
    return name.trim();
}

window.onload = function() {
    playerName = getPlayerName();
    if (playerName) {
        localStorage.setItem('playerName', playerName); // Save name if needed later
        gameRunning = true; // Start the game if a valid name is entered
        gameLoop();  // Start the game loop
    }
};

// Draw player
function drawPlayer() {
    ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

// Update player position based on movement state
function updatePlayerPosition() {
    if (!isPaused) { // Only update position if not paused
        if (moveUp && player.y > 0) {
            player.y -= player.speed;
        } 
        if (moveDown && player.y + player.height < canvas.height) {
            player.y += player.speed;
        }
    }
}

// Listen for keydown and keyup events for continuous movement
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
        moveUp = true;
    } else if (event.key === 'ArrowDown') {
        moveDown = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowUp') {
        moveUp = false;
    } else if (event.key === 'ArrowDown') {
        moveDown = false;
    }
});

// Shooting mechanic
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !isPaused && gameRunning) {
        // Add a bullet when the spacebar is pressed
        bullets.push({
            x: player.x + player.width,  // Start at the right side of the player
            y: player.y + player.height / 2 - 2,  // Centered vertically
            width: 10,
            height: 5,
            speed: 8
        });
    }
});

// Draw bullets
function drawBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.speed;  // Move bullet to the right
        ctx.fillStyle = 'red';
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Remove bullet if it goes off-screen
        if (bullet.x > canvas.width) {
            bullets.splice(index, 1);
        }
    });
}

// Draw enemies
function drawEnemies() {
    enemies.forEach((enemy, index) => {
        ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.width, enemy.height);
        enemy.x -= enemy.speed;  // Move enemy leftward

        // Remove enemy if it goes off-screen and reduce lives
        if (enemy.x + enemy.width < 0) {
            enemies.splice(index, 1);
            lives--;  // Decrease lives if enemy passes the player
        }
    });
}

// Spawning enemies
function spawnEnemy() {
    enemies.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 50),
        width: 50,
        height: 50,
        speed: 3 + difficulty
    });
}

// Draw coins
function drawCoins() {
    coins.forEach((coin, index) => {
        ctx.drawImage(coinImg, coin.x, coin.y, coin.width, coin.height);
        coin.x -= coin.speed;  // Move coin leftward

        // Remove coin if it goes off-screen
        if (coin.x + coin.width < 0) {
            coins.splice(index, 1);
        }
    });
}

// Spawning Coins
function spawnCoin() {
    coins.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 20),
        width: 20,
        height: 20,
        speed: 2 + difficulty
    });
}

// Collision detection for enemies and coins
function checkCollisions() {
    // Bullets vs Enemies
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                bullets.splice(bulletIndex, 1);  // Remove bullet
                enemies.splice(enemyIndex, 1);  // Remove enemy
                score += 10;
            }
        });
    });

    // Player vs Enemies
    enemies.forEach((enemy, index) => {
        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
            enemies.splice(index, 1);  // Remove enemy
            lives--;  // Decrease lives
        }
    });

    // Player vs Coins
    coins.forEach((coin, index) => {
        if (player.x < coin.x + coin.width && player.x + player.width > coin.x &&
            player.y < coin.y + coin.height && player.y + player.height > coin.y) {
            coins.splice(index, 1);  // Remove coin
            score += 5;
        }
    });
}

// Game over check
function checkGameOver() {
    if (lives <= 0) {
        gameRunning = false;
        displayGameOverScreen();
    }
}

// Increase difficulty over time
let difficulty = 1;

function increaseDifficulty() {
    difficulty += 0.1;
}

setInterval(increaseDifficulty, 10000);

// Score and Lives display
function drawScoreAndLives() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';  // Reset text alignment
    ctx.fillText('Score: ' + score, 20, 30);
    ctx.fillText('Lives: ' + lives, 20, 60);
}

// Pause functionality
document.addEventListener('keydown', (event) => {
    if (event.key === 'p' || event.key === 'P') {
        isPaused = !isPaused;  // Toggle pause
    }
});

function displayGameOverScreen() {
    // Clear the canvas and display the Game Over message
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '30px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over! Your score: ' + score, canvas.width / 2, canvas.height / 2 - 50);

    // Store the score only if it's above 0
    if (score > 0) {
        let scores = JSON.parse(localStorage.getItem('scores')) || [];
        scores.push({ name: playerName, score: score });
        
        // Sort by score in descending order and keep only the top 10
        scores.sort((a, b) => b.score - a.score);
        scores = scores.slice(0, 10);

        localStorage.setItem('scores', JSON.stringify(scores));
    }

    // Create a restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart Game';
    restartButton.style.position = 'absolute';
    restartButton.style.left = '50%';
    restartButton.style.top = '60%';
    restartButton.style.transform = 'translate(-50%, -50%)';
    restartButton.style.padding = '10px 20px';
    restartButton.style.fontSize = '20px';

    // Append button to the body or a container
    document.body.appendChild(restartButton);

    // Add an event listener to the button to reload the page and ask for the player's name again
    restartButton.addEventListener('click', () => {
        document.body.removeChild(restartButton); // Remove the button from the DOM
        playerName = getPlayerName();  // Get a new player name
        if (playerName) {
            resetGame(); // Reset the game state and start
        }
    });
}

function resetGame() {
    // Reset all game variables
    enemies = [];
    coins = [];
    bullets = [];
    lives = 3;
    score = 0;
    gameRunning = true; // Start the game

    // Start the game loop again
    gameLoop();
}

// Main game loop
function gameLoop() {
    if (gameRunning) {
        if (!isPaused) {
            // Game logic when not paused
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updatePlayerPosition();  // Ensure player movement happens here
            drawPlayer();
            drawBullets();
            drawEnemies();
            drawCoins();
            checkCollisions();
            checkGameOver();
            drawScoreAndLives();
        } else {
            // Draw paused message
            ctx.font = '30px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.fillText('Game Paused', canvas.width / 2, canvas.height / 2);
        }
        requestAnimationFrame(gameLoop);
    }
}

// Start enemy and coin spawning
setInterval(spawnEnemy, 2000);
setInterval(spawnCoin, 3000);
