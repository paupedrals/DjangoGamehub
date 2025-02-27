// static/js/arkanoid.js

// Wait for the DOM to load before starting the game
window.addEventListener('load', function() {
    // Get canvas and context
    const canvas = document.getElementById('arkanoid-canvas');
    const ctx = canvas.getContext('2d');

    // Canvas dimensions (should match the canvas element)
    const SCREEN_WIDTH = canvas.width;   // 800
    const SCREEN_HEIGHT = canvas.height; // 600

    // Define Colors
    const BLACK   = "#000000";
    const WHITE   = "#FFFFFF";
    const RED     = "#FF0000";
    const ORANGE  = "#FFA500";
    const YELLOW  = "#FFFF00";
    const GREEN   = "#00FF00";
    const BLUE    = "#0000FF";
    const INDIGO  = "#4B0082";
    const VIOLET  = "#8A2BE2";

    const RAINBOW_COLORS = [RED, ORANGE, YELLOW, GREEN, BLUE, INDIGO, VIOLET];

    // Game parameters
    const PADDLE_WIDTH = 100;
    const PADDLE_HEIGHT = 20;
    const PADDLE_SPEED = 10;

    const BALL_RADIUS = 10;
    const INITIAL_BALL_SPEED_X = 5;
    const INITIAL_BALL_SPEED_Y = -5;
    const BALL_BOUNCE_PADDLE_ANGLE = 5;

    const BRICK_ROWS = RAINBOW_COLORS.length; // 7 rows
    const BRICK_COLUMNS = 14;
    const BRICK_HEIGHT = 20;
    const BRICK_PADDING = 1;
    const BRICK_OFFSET_TOP = 50;
    const BRICK_MARGIN = 50;
    const BRICK_WIDTH = Math.floor((SCREEN_WIDTH - 2 * BRICK_MARGIN - (BRICK_COLUMNS - 1) * BRICK_PADDING) / BRICK_COLUMNS);
    const BRICK_OFFSET_LEFT = BRICK_MARGIN;

    // Game state variables
    let paddle_x, paddle_y;
    let ball_x, ball_y;
    let ball_speed_x, ball_speed_y;
    let score;
    let lives;
    let bricks = [];
    let keysPressed = {};

    // Initialize the game state
    function initGame() {
        paddle_x = (SCREEN_WIDTH - PADDLE_WIDTH) / 2;
        paddle_y = SCREEN_HEIGHT - PADDLE_HEIGHT - 10;
        ball_x = SCREEN_WIDTH / 2;
        ball_y = SCREEN_HEIGHT / 2;
        ball_speed_x = INITIAL_BALL_SPEED_X;
        ball_speed_y = INITIAL_BALL_SPEED_Y;
        score = 0;
        lives = 3;
        bricks = resetBricks();
    }

    // Create and return an array of brick objects
    function resetBricks() {
        let bricksArray = [];
        for (let row = 0; row < BRICK_ROWS; row++) {
            for (let col = 0; col < BRICK_COLUMNS; col++) {
                let brick_x = BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING);
                let brick_y = BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING);
                bricksArray.push({
                    x: brick_x,
                    y: brick_y,
                    width: BRICK_WIDTH,
                    height: BRICK_HEIGHT,
                    color: RAINBOW_COLORS[row % RAINBOW_COLORS.length],
                    visible: true
                });
            }
        }
        return bricksArray;
    }

    // Handle key presses
    window.addEventListener('keydown', function(e) {
        keysPressed[e.key] = true;
        // Reset game on pressing "r" (optional)
        if (e.key === 'r' || e.key === 'R') {
            initGame();
        }
    });
    window.addEventListener('keyup', function(e) {
        keysPressed[e.key] = false;
    });

    // Draw the paddle
    function drawPaddle() {
        ctx.fillStyle = WHITE;
        ctx.fillRect(paddle_x, paddle_y, PADDLE_WIDTH, PADDLE_HEIGHT);
    }

    // Draw the ball
    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball_x, ball_y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = WHITE;
        ctx.fill();
        ctx.closePath();
    }

    // Draw all bricks
    function drawBricks() {
        bricks.forEach(brick => {
            if (brick.visible) {
                ctx.fillStyle = brick.color;
                ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            }
        });
    }

    // Draw score and lives
    function drawScore() {
        ctx.fillStyle = WHITE;
        ctx.font = "20px Arial";
        ctx.fillText("Score: " + score, 10, 30);
    }
    function drawLives() {
        ctx.fillStyle = GREEN;
        ctx.font = "20px Arial";
        ctx.fillText("Lives: " + lives, SCREEN_WIDTH - 100, 30);
    }

    // Display a message (for win or game over)
    function displayMessage(message) {
        ctx.fillStyle = BLACK;
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        ctx.fillStyle = WHITE;
        ctx.font = "36px Arial";
        let textWidth = ctx.measureText(message).width;
        ctx.fillText(message, (SCREEN_WIDTH - textWidth) / 2, SCREEN_HEIGHT / 2);
        ctx.font = "24px Arial";
        let scoreMessage = "Final Score: " + score;
        submitFinalScore(score);
        let scoreWidth = ctx.measureText(scoreMessage).width;
        ctx.fillText(scoreMessage, (SCREEN_WIDTH - scoreWidth) / 2, SCREEN_HEIGHT / 2 + 40);
    }

    // Helper function: detect collision between a circle and a rectangle
    function rectCircleColliding(circle, rect) {
        // circle: { x, y, radius }
        // rect: { x, y, width, height }
        let distX = Math.abs(circle.x - rect.x - rect.width / 2);
        let distY = Math.abs(circle.y - rect.y - rect.height / 2);

        if (distX > (rect.width / 2 + circle.radius)) { return false; }
        if (distY > (rect.height / 2 + circle.radius)) { return false; }

        if (distX <= (rect.width / 2)) { return true; }
        if (distY <= (rect.height / 2)) { return true; }

        let dx = distX - rect.width / 2;
        let dy = distY - rect.height / 2;
        return (dx * dx + dy * dy <= (circle.radius * circle.radius));
    }

    // The main game loop
    function gameLoop() {
        // Clear the canvas
        ctx.fillStyle = BLACK;
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

        // Update paddle position from key presses
        if (keysPressed["ArrowLeft"]) {
            paddle_x -= PADDLE_SPEED;
        }
        if (keysPressed["ArrowRight"]) {
            paddle_x += PADDLE_SPEED;
        }
        // Prevent paddle from going off-screen
        if (paddle_x < 0) paddle_x = 0;
        if (paddle_x > SCREEN_WIDTH - PADDLE_WIDTH) paddle_x = SCREEN_WIDTH - PADDLE_WIDTH;

        // Update ball position
        ball_x += ball_speed_x;
        ball_y += ball_speed_y;

        // Ball collision with walls
        if (ball_x - BALL_RADIUS <= 0 || ball_x + BALL_RADIUS >= SCREEN_WIDTH) {
            ball_speed_x = -ball_speed_x;
        }
        if (ball_y - BALL_RADIUS <= 0) {
            ball_speed_y = -ball_speed_y;
        }

        // Create a circle object for collision detection
        const ballCircle = { x: ball_x, y: ball_y, radius: BALL_RADIUS };

        // Check collision with the paddle
        const paddleRect = { x: paddle_x, y: paddle_y, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
        if (rectCircleColliding(ballCircle, paddleRect)) {
            const paddleCenter = paddle_x + PADDLE_WIDTH / 2;
            const hitPosition = (ball_x - paddleCenter) / (PADDLE_WIDTH / 2);
            ball_speed_x = hitPosition * BALL_BOUNCE_PADDLE_ANGLE;
            ball_speed_y = -Math.max(Math.abs(ball_speed_y), 6);
            // Move ball above the paddle to avoid multiple collisions
            ball_y = paddle_y - BALL_RADIUS;
        }

        // Check collision with bricks
        bricks.forEach(brick => {
            if (brick.visible) {
                const brickRect = { x: brick.x, y: brick.y, width: brick.width, height: brick.height };
                if (rectCircleColliding(ballCircle, brickRect)) {
                    ball_speed_y = -ball_speed_y;
                    brick.visible = false;
                    score += 10;
                }
            }
        });

        // Check for game over (ball falls below the screen)
        if (ball_y - BALL_RADIUS > SCREEN_HEIGHT) {
            lives--;
            if (lives <= 0) {
                displayMessage("Game Over!");
                setTimeout(() => {
                    initGame();
                    requestAnimationFrame(gameLoop);
                }, 3000);
                return;
            } else {
                // Reset ball and paddle positions
                paddle_x = (SCREEN_WIDTH - PADDLE_WIDTH) / 2;
                paddle_y = SCREEN_HEIGHT - PADDLE_HEIGHT - 10;
                ball_x = SCREEN_WIDTH / 2;
                ball_y = SCREEN_HEIGHT / 2;
                ball_speed_x = INITIAL_BALL_SPEED_X;
                ball_speed_y = INITIAL_BALL_SPEED_Y;
            }
        }

        // Check for win condition (all bricks destroyed)
        if (bricks.every(brick => !brick.visible)) {
            displayMessage("You Win!");
            setTimeout(() => {
                initGame();
                requestAnimationFrame(gameLoop);
            }, 3000);
            return;
        }

        // Draw game objects
        drawPaddle();
        drawBall();
        drawBricks();
        drawScore();
        drawLives();

        // Loop the game
        requestAnimationFrame(gameLoop);
    }

    // Start the game
    initGame();
    requestAnimationFrame(gameLoop);
});
