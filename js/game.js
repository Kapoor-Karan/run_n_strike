// Access the canvas element and its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5,
    color: 'blue',
};

let enemies = [];
let coins = [];
let lives = 3;
let score = 0;
let gameRunning = true;

// Function to draw the player
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw player
    drawPlayer();
    
    // Add logic to spawn enemies and coins, handle collisions, etc.

    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
