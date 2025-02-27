// static/js/pong.js
window.addEventListener('load', function() {
    const canvas = document.getElementById('pong-canvas');
    const ctx = canvas.getContext('2d');

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    // Paddle dimensions and speeds
    const PADDLE_WIDTH = 10;
    const PADDLE_HEIGHT = 100;
    const PLAYER_SPEED = 6;
    const CPU_SPEED = 4;

    // Ball properties and base speeds
    const BALL_RADIUS = 8;
    const BASE_BALL_SPEED_X = 5;
    const BASE_BALL_SPEED_Y = 3;
    let ballX = WIDTH / 2;
    let ballY = HEIGHT / 2;
    let ballSpeedX = BASE_BALL_SPEED_X;
    let ballSpeedY = BASE_BALL_SPEED_Y;

    // Paddles
    let playerY = (HEIGHT - PADDLE_HEIGHT) / 2;
    let cpuY = (HEIGHT - PADDLE_HEIGHT) / 2;

    // Game state: score, CPU score, and player lives
    let playerScore = 0;
    let cpuScore = 0;
    let playerLives = 3;

    let keys = {};

    window.addEventListener('keydown', function(e) {
        keys[e.key] = true;
    });
    window.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });

    // Flag to freeze movement on game over
    let isGameOver = false;

    // Resets the ball position and speed to base values
    function resetBall() {
        ballX = WIDTH / 2;
        ballY = HEIGHT / 2;
        // Serve ball towards the player side by reversing X direction
        ballSpeedX = -BASE_BALL_SPEED_X;
        ballSpeedY = BASE_BALL_SPEED_Y;
    }

    // Draws the dashed net in the middle of the canvas
    function drawNet() {
        ctx.strokeStyle = 'white';
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(WIDTH / 2, 0);
        ctx.lineTo(WIDTH / 2, HEIGHT);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // Handles game over: freezes movement, submits final score, shows message, and resets after 3 seconds
    function gameOver() {
        // Display "Game Over" message
        ctx.fillStyle = 'red';
        ctx.font = "40px Arial";
        const msg = "Game Over!";
        ctx.fillText(msg, WIDTH / 2 - ctx.measureText(msg).width / 2, HEIGHT / 2);
        
        // Submit final score for the current user
        submitFinalScore(playerScore);
        
        // Schedule full game restart after 3 seconds
        setTimeout(function(){
            // Reset game state
            playerScore = 0;
            cpuScore = 0;
            playerLives = 3;
            isGameOver = false;
            resetBall();
            // Reset paddles
            playerY = (HEIGHT - PADDLE_HEIGHT) / 2;
            cpuY = (HEIGHT - PADDLE_HEIGHT) / 2;
        }, 3000);
    }

    // Main update function
    function update() {
        if (isGameOver) return; // Freeze updates if game is over

        // Update player's paddle based on arrow keys
        if (keys['ArrowUp']) {
            playerY -= PLAYER_SPEED;
        }
        if (keys['ArrowDown']) {
            playerY += PLAYER_SPEED;
        }
        if (playerY < 0) playerY = 0;
        if (playerY > HEIGHT - PADDLE_HEIGHT) playerY = HEIGHT - PADDLE_HEIGHT;

        // Simple CPU paddle AI: follow the ball's vertical position
        if (cpuY + PADDLE_HEIGHT / 2 < ballY) {
            cpuY += CPU_SPEED;
        } else {
            cpuY -= CPU_SPEED;
        }
        if (cpuY < 0) cpuY = 0;
        if (cpuY > HEIGHT - PADDLE_HEIGHT) cpuY = HEIGHT - PADDLE_HEIGHT;

        // Update ball position
        ballX += ballSpeedX;
        ballY += ballSpeedY;

        // Bounce off top and bottom walls
        if (ballY - BALL_RADIUS < 0 || ballY + BALL_RADIUS > HEIGHT) {
            ballSpeedY = -ballSpeedY;
        }

        // Handle collision with player's side (left)
        if (ballX - BALL_RADIUS < PADDLE_WIDTH) {
            // If the ball is within the player's paddle vertical range, bounce and accelerate
            if (ballY > playerY && ballY < playerY + PADDLE_HEIGHT) {
                ballSpeedX = -ballSpeedX * 1.05;
                ballSpeedY = ballSpeedY * 1.05;
            } else {
                // Player missed the ball: lose one life
                playerLives--;
                if (playerLives <= 0) {
                    isGameOver = true;
                    gameOver();
                    return;
                } else {
                    resetBall();
                }
            }
        }

        // Handle collision with CPU's side (right)
        if (ballX + BALL_RADIUS > WIDTH - PADDLE_WIDTH) {
            // If the ball is within the CPU's paddle vertical range, bounce and accelerate
            if (ballY > cpuY && ballY < cpuY + PADDLE_HEIGHT) {
                ballSpeedX = -ballSpeedX * 1.05;
                ballSpeedY = ballSpeedY * 1.05;
            } else {
                // Ball missed by CPU: player scores a point
                playerScore++;
                resetBall();
            }
        }
    }

    // Draws all game elements
    function draw() {
        // Clear the canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Draw paddles
        ctx.fillStyle = 'white';
        ctx.fillRect(0, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillRect(WIDTH - PADDLE_WIDTH, cpuY, PADDLE_WIDTH, PADDLE_HEIGHT);

        // Draw ball
        ctx.beginPath();
        ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Draw net, scores, and lives
        drawNet();
        ctx.font = "24px Arial";
        ctx.fillText("Score: " + playerScore, WIDTH / 4, 30);
        ctx.fillText("Lives: " + playerLives, WIDTH / 2 - 50, 30);
        ctx.fillText("CPU: " + cpuScore, (3 * WIDTH) / 4, 30);

        // If game over, overlay the "Game Over" message
        if (isGameOver) {
            ctx.fillStyle = 'red';
            ctx.font = "40px Arial";
            const msg = "Game Over!";
            ctx.fillText(msg, WIDTH / 2 - ctx.measureText(msg).width / 2, HEIGHT / 2);
        }
    }

    // Main game loop using requestAnimationFrame
    function gameLoop() {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Start the game loop
    gameLoop();
});
