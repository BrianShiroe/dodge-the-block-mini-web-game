const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player, obstacles, gameOver, score;
let obstacleSpeed = 3;
let spawnRate = 500; // Initial obstacle spawn rate (ms)
let spawnTimeout;
let lastKeyPressed = null; // Track last key pressed
let keys = {}; // Track currently pressed keys
let highScore = localStorage.getItem("highScore") || 0;

const bgMusic = new Audio("assets/retro-music.mp3");
const deathSound = new Audio("assets/retro-death-effect.mp3");
bgMusic.loop = true;

document.getElementById("playButton").addEventListener("click", startGame);
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.getElementById("playButton").style.display !== "none") {
        startGame();
    }
});

function startGame() {
    document.getElementById("playButton").style.display = "none";
    document.getElementById("title").style.display = "none";
    document.getElementById("description").style.display = "none";
    resetGame();
    bgMusic.play();
    requestAnimationFrame(updateGame);
    scheduleNextObstacle();
}

function resetGame() {
    player = { x: canvas.width / 2 - 25, y: canvas.height - 60, width: 50, height: 50, speed: 7, dx: 0 };
    obstacles = [];
    score = 0;
    gameOver = false;
    obstacleSpeed = 3;
    spawnRate = 500;
    bgMusic.currentTime = 0;
    bgMusic.play();
    highScore = localStorage.getItem("highScore") || 0;
}

function handleKeyDown(e) {
    if (gameOver) return;

    keys[e.key] = true; // Mark key as pressed

    if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        lastKeyPressed = "left";
        player.dx = -player.speed;
    }
    if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        lastKeyPressed = "right";
        player.dx = player.speed;
    }

    if (bgMusic.paused) bgMusic.play();
}

function handleKeyUp(e) {
    keys[e.key] = false; // Mark key as released

    if (["ArrowLeft", "a", "A"].includes(e.key) && lastKeyPressed === "left") {
        if (keysStillPressed("right")) {
            lastKeyPressed = "right";
            player.dx = player.speed;
        } else {
            player.dx = 0; // Stop if no other key is pressed
        }
    }
    
    if (["ArrowRight", "d", "D"].includes(e.key) && lastKeyPressed === "right") {
        if (keysStillPressed("left")) {
            lastKeyPressed = "left";
            player.dx = -player.speed;
        } else {
            player.dx = 0; // Stop if no other key is pressed
        }
    }
}

// Helper function to check if a key is still being held
function keysStillPressed(direction) {
    return (direction === "left" && (keys["ArrowLeft"] || keys["a"] || keys["A"])) ||
           (direction === "right" && (keys["ArrowRight"] || keys["d"] || keys["D"]));
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

function createObstacle() {
    obstacles.push({
        x: Math.random() * (canvas.width - 50),
        y: 0,
        width: 50,
        height: 50,
        speed: obstacleSpeed, // New obstacles inherit updated speed
    });
}

function updateGame() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Increase difficulty over time
    obstacleSpeed = 3 + Math.min(score / 1000, 5); // Max speed increase of 5
    spawnRate = Math.max(200, 500 - score * 2); // Min spawn rate of 200ms

    // Update player position
    player.x += player.dx;
    player.x = Math.max(0, Math.min(player.x, canvas.width - player.width));

    // Draw player
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw obstacles
    ctx.fillStyle = "red";
    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacle.speed;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        // Collision detection
        if (
            obstacle.y + obstacle.height > player.y &&
            obstacle.x < player.x + player.width &&
            obstacle.x + obstacle.width > player.x
        ) {
            endGame();
        }

        // Remove obstacles that move out of bounds
        if (obstacle.y > canvas.height) {
            obstacles.splice(index, 1);
            score += 10;
        }
    });

    // Display score and high score
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 10, 30);

    // Only show high score if it exists (> 0)
    if (highScore > 0) {
        ctx.fillText("High Score: " + highScore, 10, 60);
    }

    // Display current obstacle speed
    // ctx.fillText("Speed: " + obstacleSpeed.toFixed(2), 10, 60);

    requestAnimationFrame(updateGame);
}

function scheduleNextObstacle() {
    if (gameOver) return;
    createObstacle();
    clearTimeout(spawnTimeout); // Clear previous timeout to avoid overlap
    spawnTimeout = setTimeout(scheduleNextObstacle, spawnRate); // Adjust dynamically
}

function endGame() {
    gameOver = true;
    bgMusic.pause();
    deathSound.play();
    clearTimeout(spawnTimeout); // Stop new obstacles from spawning

    // Update high score if current score is higher
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }

    setTimeout(() => {
        document.getElementById("playButton").style.display = "block";
        document.getElementById("title").style.display = "block";
        document.getElementById("description").style.display = "block";
    }, 2000);
}
