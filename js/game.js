// Access the canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player object
const player = {
    x: 50,
    y: canvas.height / 2 - 50,
    width: 50,
    height: 50,
    speed: 20
};

let enemies = [];
let coins = [];
let bullets = [];
let lives = 3;
let score = 0;
let gameRunning = true;

// Function to draw the player
function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Player movement (up and down)
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp' && player.y > 0) {
        player.y -= player.speed;  // Move up
    } else if (event.key === 'ArrowDown' && player.y + player.height < canvas.height) {
        player.y += player.speed;  // Move down
    }
});

// Shooting mechanic
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
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
        ctx.fillStyle = 'green';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
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
        speed: 3
    });
}

// Draw coins
function drawCoins() {
    coins.forEach((coin, index) => {
        ctx.fillStyle = 'gold';
        ctx.fillRect(coin.x, coin.y, coin.width, coin.height);
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
        speed: 2
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
        alert('Game Over! Your score: ' + score);
        window.location.reload();
    }
}

// Increase difficulty over time
let difficulty = 1;

function increaseDifficulty() {
    difficulty += 0.1;
    enemies.forEach((enemy) => enemy.speed += 0.1);
    coins.forEach((coin) => coin.speed += 0.05);
}

setInterval(increaseDifficulty, 10000);

// Score and Lives display
function drawScoreAndLives() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 20, 30);
    ctx.fillText('Lives: ' + lives, 20, 60);
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    drawPlayer();
    drawBullets();
    drawEnemies();
    drawCoins();
    checkCollisions();
    checkGameOver();
    drawScoreAndLives();

    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Start the game loop
setInterval(spawnEnemy, 2000);
setInterval(spawnCoin, 3000);
gameLoop();
