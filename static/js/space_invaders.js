// static/js/space_invaders.js

window.addEventListener('load', function() {
    const canvas = document.getElementById('space-invaders-canvas');
    const ctx = canvas.getContext('2d');

    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    // Spaceship properties
    const shipWidth = 40;
    const shipHeight = 20;
    let shipX = (WIDTH - shipWidth) / 2;
    const shipY = HEIGHT - shipHeight - 10;
    const shipSpeed = 5;

    // Bullet properties
    const bulletWidth = 4;
    const bulletHeight = 10;
    const bulletSpeed = 7;
    let bullets = []; // Array of bullets: { x, y }

    // Alien properties
    const alienRows = 5;
    const alienColumns = 10;
    const alienWidth = 30;
    const alienHeight = 20;
    const alienPadding = 10;
    const alienOffsetTop = 50;
    const alienOffsetLeft = 50;
    let aliens = [];
    let alienDirection = 1; // 1 means moving right; -1 means moving left
    const alienSpeed = 1;
    const alienDescend = 20;

    let score = 0;

    // Create aliens grid
    function initAliens() {
        aliens = [];
        for (let r = 0; r < alienRows; r++) {
            for (let c = 0; c < alienColumns; c++) {
                let alienX = alienOffsetLeft + c * (alienWidth + alienPadding);
                let alienY = alienOffsetTop + r * (alienHeight + alienPadding);
                aliens.push({ x: alienX, y: alienY, width: alienWidth, height: alienHeight, alive: true });
            }
        }
    }
    initAliens();

    let keys = {};
    window.addEventListener('keydown', function(e) {
        keys[e.key] = true;
        if (e.key === " ") {
            // Fire bullet from the center of the ship
            bullets.push({ x: shipX + shipWidth / 2 - bulletWidth / 2, y: shipY });
        }
    });
    window.addEventListener('keyup', function(e) {
        keys[e.key] = false;
    });

    function update() {
        // Move ship
        if (keys['ArrowLeft']) {
            shipX -= shipSpeed;
        }
        if (keys['ArrowRight']) {
            shipX += shipSpeed;
        }
        if (shipX < 0) shipX = 0;
        if (shipX > WIDTH - shipWidth) shipX = WIDTH - shipWidth;

        // Update bullets
        for (let i = 0; i < bullets.length; i++) {
            bullets[i].y -= bulletSpeed;
        }
        // Remove off-screen bullets
        bullets = bullets.filter(b => b.y + bulletHeight > 0);

        // Update aliens position
        let hitEdge = false;
        aliens.forEach(alien => {
            if (!alien.alive) return;
            alien.x += alienSpeed * alienDirection;
            if (alien.x + alien.width > WIDTH || alien.x < 0) {
                hitEdge = true;
            }
        });
        if (hitEdge) {
            alienDirection *= -1;
            aliens.forEach(alien => {
                if (alien.alive) alien.y += alienDescend;
            });
        }

        // Check bullet-alien collisions
        for (let i = 0; i < bullets.length; i++) {
            let bullet = bullets[i];
            for (let j = 0; j < aliens.length; j++) {
                let alien = aliens[j];
                if (!alien.alive) continue;
                if (
                    bullet.x < alien.x + alien.width &&
                    bullet.x + bulletWidth > alien.x &&
                    bullet.y < alien.y + alien.height &&
                    bullet.y + bulletHeight > alien.y
                ) {
                    alien.alive = false;
                    score += 10;
                    bullets.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
    }

    function draw() {
        // Clear canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Draw spaceship
        ctx.fillStyle = 'white';
        ctx.fillRect(shipX, shipY, shipWidth, shipHeight);

        // Draw bullets
        ctx.fillStyle = 'yellow';
        bullets.forEach(bullet => {
            ctx.fillRect(bullet.x, bullet.y, bulletWidth, bulletHeight);
        });

        // Draw aliens
        ctx.fillStyle = 'green';
        aliens.forEach(alien => {
            if (alien.alive) {
                ctx.fillRect(alien.x, alien.y, alien.width, alien.height);
            }
        });

        // Draw score
        ctx.fillStyle = 'white';
        ctx.font = "20px Arial";
        ctx.fillText("Score: " + score, 10, 30);
    }

    function gameLoop() {
        update();
        draw();

        // Check win condition
        if (aliens.every(a => !a.alive)) {
            ctx.fillStyle = 'white';
            ctx.font = "40px Arial";
            let msg = "You Win!";
            let textWidth = ctx.measureText(msg).width;
            ctx.fillText(msg, (WIDTH - textWidth) / 2, HEIGHT / 2);
            return; // Stop the game loop
        }

        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});