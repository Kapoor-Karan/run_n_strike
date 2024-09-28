// Access the canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images for player, enemies, coins, and power-ups
const playerImg = new Image();
playerImg.src = './assets/player.png';

const enemyImg = new Image();
enemyImg.src = './assets/enemy.png';

const coinImg = new Image();
coinImg.src = './assets/coin.png';

const invincibilityImg = new Image();
invincibilityImg.src = './assets/invincibility.png'; // Add your invincibility power-up image

const speedBoostImg = new Image();
speedBoostImg.src = './assets/speedBoost.png'; // Add your speed boost power-up image

// Player object
const player = {
    x: 50,
    y: canvas.height / 2 - 50,
    width: 50,
    height: 50,
    speed: 8
};

let gameDuration = null;
let playerName = '';
let enemies = [];
let coins = [];
let bullets = [];
let powerUps = [];
let lives = 3;
let score = 0;
let gameRunning = false;
let moveUp = false;
let moveDown = false;
let isPaused = false;
let enemySpawnInterval = 1500;
let coinSpawnInterval = 1000;
let lastEnemySpawnTime = 0;
let lastCoinSpawnTime = 0;

let isInvincible = false;
let isSpeedBoosted = false;
let invincibilityTimer = 0;
let speedBoostTimer = 0;

const leaderboardKeys = {
    '60000': 'leaderboard1Minute',
    '300000': 'leaderboard5Minutes',
    '600000': 'leaderboard10Minutes',
    'infinite': 'leaderboardInfinite'
};


const INVINCIBILITY_DURATION = 5000; // 5 seconds
const SPEED_BOOST_DURATION = 10000; // 10 seconds
const INVINCIBILITY_RESPAWN_TIME = 60000; // 60 seconds
const SPEED_BOOST_RESPAWN_TIME = 30000; // 30 seconds
let lastInvincibilitySpawnTime = 0;
let lastSpeedBoostSpawnTime = 0;

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
    function isMobileDevice() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }

    if (isMobileDevice()) {
        alert("This game is not supported on mobile devices. Please use a desktop or laptop.");
        window.location.href = 'index.html';
    } else {
        // Show pre-game screen
        document.getElementById('instructionScreen').style.display = 'block';
        
        // Add event listener to the "Continue" button
        document.getElementById('continueButton').addEventListener('click', function() {
            document.getElementById('instructionScreen').style.display = 'none'; // Hide pre-game screen
            playerName = getPlayerName();
            if (playerName) {
                localStorage.setItem('playerName', playerName);
                document.getElementById('timeSelection').style.display = 'flex'; // Show time selection buttons
                addTimeSelectionListeners();
            }
        });
    }
};

function addTimeSelectionListeners() {
    document.getElementById('oneMinute').addEventListener('click', () => handleTimeSelection(1 * 60 * 1000));  // 1 minute
    document.getElementById('fiveMinutes').addEventListener('click', () => handleTimeSelection(5 * 60 * 1000)); // 5 minutes
    document.getElementById('tenMinutes').addEventListener('click', () => handleTimeSelection(10 * 60 * 1000)); // 10 minutes
    document.getElementById('infinite').addEventListener('click', () => handleTimeSelection('infinite'));  // Infinite time
}

function handleTimeSelection(duration) {
    gameDuration = duration;
    document.getElementById('timeSelection').style.display = 'none';  // Hide time selection buttons
    gameRunning = true;  // Start the game

    // If a finite duration is selected, set a timeout to end the game
    if (gameDuration !== 'infinite') {
        setTimeout(() => {
            lives = 0;  // End the game by setting lives to 0
            checkGameOver();
        }, gameDuration);
    }

    // Start spawning enemies and coins and increasing difficulty over time
    setInterval(spawnEnemy, 3000);
    setInterval(spawnCoin, 2000);
    setInterval(increaseDifficulty, 10000);
    gameLoop();  // Start the game loop
}

document.getElementById('restartButton').addEventListener('click', () => {
    location.reload();  // Reload the page to restart the game
});


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
            x: player.x + player.width, 
            y: player.y + player.height / 2 - 2, 
            width: 10,
            height: 5,
            speed: 8
        });
    }
});

// Draw bullets
function drawBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.speed;
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
        enemy.x -= enemy.speed; 

        // Remove enemy if it goes off-screen and reduce lives
        if (enemy.x + enemy.width < 0) {
            enemies.splice(index, 1);
            if (!isInvincible) {
                lives--;  // Decrease lives if enemy passes the player and not invincible
            }
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
        coin.x -= coin.speed;

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

// Spawning Power-Ups
function spawnPowerUp() {
    const currentTime = Date.now(); // Get the current time in milliseconds

    // Spawn invincibility power-up if at least 60 seconds have passed since the last spawn
    if (currentTime - lastInvincibilitySpawnTime >= INVINCIBILITY_RESPAWN_TIME && Math.random() < 0.01) {
        powerUps.push({
            type: 'invincibility',
            x: canvas.width,
            y: Math.random() * (canvas.height - 20),
            width: 20,
            height: 20,
            speed: 2
        });
        lastInvincibilitySpawnTime = currentTime; // Update the last spawn time
    }

    // Spawn speed boost power-up if at least 30 seconds have passed since the last spawn
    if (currentTime - lastSpeedBoostSpawnTime >= SPEED_BOOST_RESPAWN_TIME && Math.random() < 0.02) {
        powerUps.push({
            type: 'speedBoost',
            x: canvas.width,
            y: Math.random() * (canvas.height - 20),
            width: 20,
            height: 20,
            speed: 2
        });
        lastSpeedBoostSpawnTime = currentTime; // Update the last spawn time
    }
}

// Draw power-ups
function drawPowerUps() {
    powerUps.forEach((powerUp, index) => {
        if (powerUp.type === 'invincibility') {
            ctx.drawImage(invincibilityImg, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        } else if (powerUp.type === 'speedBoost') {
            ctx.drawImage(speedBoostImg, powerUp.x, powerUp.y, powerUp.width, powerUp.height);
        }
        powerUp.x -= powerUp.speed;

        // Remove power-up if it goes off-screen
        if (powerUp.x + powerUp.width < 0) {
            powerUps.splice(index, 1);
        }
    });
}

// Check for power-up collisions
function checkPowerUpCollisions() {
    powerUps.forEach((powerUp, index) => {
        if (player.x < powerUp.x + powerUp.width && player.x + player.width > powerUp.x &&
            player.y < powerUp.y + powerUp.height && player.y + player.height > powerUp.y) {
            if (powerUp.type === 'invincibility') {
                isInvincible = true;
                invincibilityTimer = INVINCIBILITY_DURATION;
            } else if (powerUp.type === 'speedBoost') {
                isSpeedBoosted = true;
                speedBoostTimer = SPEED_BOOST_DURATION;
                player.speed *= 2; // Double the player's speed
            }
            powerUps.splice(index, 1); // Remove the collected power-up
        }
    });
}

// Update power-up effects
function updatePowerUpEffects() {
    if (isInvincible) {
        invincibilityTimer -= 1000 / 60; // Decrease timer by 1/60th of a second
        if (invincibilityTimer <= 0) {
            isInvincible = false; // End invincibility
        }
    }

    if (isSpeedBoosted) {
        speedBoostTimer -= 1000 / 60; // Decrease timer by 1/60th of a second
        if (speedBoostTimer <= 0) {
            isSpeedBoosted = false; // End speed boost
            player.speed /= 2; // Reset the player's speed
        }
    }
}

// Check for collisions between the player and enemies
function checkCollisions() {
    enemies.forEach((enemy, index) => {
        if (player.x < enemy.x + enemy.width && player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height && player.y + player.height > enemy.y) {
            if (!isInvincible) {
                lives--; // Decrease lives if not invincible
            }
            enemies.splice(index, 1); // Remove the enemy after collision
        }
    });

    // Check for collisions between bullets and enemies
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                score += 10;  // Increase score when an enemy is hit
                bullets.splice(bIndex, 1); // Remove the bullet
                enemies.splice(eIndex, 1); // Remove the enemy
            }
        });
    });

    // Check for collisions between the player and coins
    coins.forEach((coin, index) => {
        if (player.x < coin.x + coin.width && player.x + player.width > coin.x &&
            player.y < coin.y + coin.height && player.y + player.height > coin.y) {
            score += 5;  // Increase score when a coin is collected
            coins.splice(index, 1);  // Remove the coin after collection
        }
    });
}

// Draw the current score and remaining lives on the screen
function drawScoreAndLives() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white'; // Change this to a light color
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Lives: ${lives}`, 10, 60);
}

// Increase difficulty over time
let difficulty = 0;
function increaseDifficulty() {
    difficulty += 0.005;
}

// Pause or resume the game when the 'P' key is pressed
document.addEventListener('keydown', (event) => {
    if (event.key === 'p') {
        isPaused = !isPaused;
        if (!isPaused && gameRunning) {
            gameLoop();  // Resume the game loop
        }
    }
});


// Restart the game when the restart button is clicked
document.getElementById('restartButton').addEventListener('click', () => {
    location.reload();  // Reload the page to restart the game
});

function saveScoreToLeaderboard() {
    if (score > 0) {
        let leaderboardKey;
        if (gameDuration === 'infinite') {
            leaderboardKey = leaderboardKeys['infinite'];
        } else {
            leaderboardKey = leaderboardKeys[gameDuration];
        }

        let leaderboard = JSON.parse(localStorage.getItem(leaderboardKey)) || [];

        // Add the new score
        leaderboard.push({ name: playerName, score: score });

        // Sort the leaderboard by score in descending order
        leaderboard.sort((a, b) => b.score - a.score);

        // Keep only the top 10 scores
        if (leaderboard.length > 10) {
            leaderboard = leaderboard.slice(0, 10);
        }

        // Save the updated leaderboard
        localStorage.setItem(leaderboardKey, JSON.stringify(leaderboard));
    }
}

// Check if the game is over
function checkGameOver() {
    if (lives <= 0) {
        gameRunning = false;
        isPaused = true;

        // Show the restart button when the game is over
        document.getElementById('restartButton').style.display = 'block';

        // Save the score and name to the leaderboard
        saveScoreToLeaderboard();
    }
}



// Game loop
function gameLoop() {
    if (gameRunning && !isPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawPlayer();
        updatePlayerPosition();
        drawEnemies();
        drawCoins();
        drawBullets();
        drawPowerUps();
        spawnPowerUp();
        checkCollisions();
        checkPowerUpCollisions();
        updatePowerUpEffects();
        drawScoreAndLives();
        checkGameOver();

        requestAnimationFrame(gameLoop);
    }
}


