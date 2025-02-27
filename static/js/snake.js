// static/js/snake.js
window.addEventListener('load', function () {
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas dimensions and game parameters
  const canvasSize = 600;
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const cellSize = 20;
  const cols = canvas.width / cellSize;
  const rows = canvas.height / cellSize;

  let snake, direction, food, score;
  let paused = false; // When true, snake movement is stopped (game over)

  const speed = 150; // Milliseconds per frame
  let gameInterval;

  // Reset the game state (without stopping the game loop)
  function startGame() {
      snake = [{ x: 10, y: 10 }];
      direction = { x: 1, y: 0 };
      food = randomFood();
      score = 0;
      paused = false;
  }

  // Initialize the game loop once
  function initGameLoop() {
      if (gameInterval) clearInterval(gameInterval);
      gameInterval = setInterval(gameLoop, speed);
  }

  // Generate a random food position within bounds
  function randomFood() {
      return {
          x: Math.floor(Math.random() * cols),
          y: Math.floor(Math.random() * rows)
      };
  }

  // When a collision occurs, set paused to true and show "Game Over"
  function gameOver() {
      if (paused) return; // Already in game over state
      paused = true;
      // Submit final score for the current user
      submitFinalScore(score);
      // Schedule a game restart after 3 seconds
      setTimeout(startGame, 3000);
  }

  // Update game state (only updates snake movement when not paused)
  function update() {
      if (paused) return; // Freeze movement on game over

      // Compute new head position
      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

      // Check collision with walls
      if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
          gameOver();
          return;
      }
      // Check collision with itself
      for (let segment of snake) {
          if (head.x === segment.x && head.y === segment.y) {
              gameOver();
              return;
          }
      }

      snake.unshift(head);
      // If food is eaten, increase score and generate new food; otherwise, remove tail
      if (head.x === food.x && head.y === food.y) {
          score += 10;
          food = randomFood();
      } else {
          snake.pop();
      }
  }

  // Draw the current state of the game
  function draw() {
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw snake
      ctx.fillStyle = '#0f0';
      for (let segment of snake) {
          ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
      }

      // Draw food
      ctx.fillStyle = '#f00';
      ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);

      // Draw score
      ctx.fillStyle = '#0ff';
      ctx.font = "20px Arial";
      ctx.fillText("Score: " + score, 10, 20);

      // If paused (game over), overlay the Game Over message
      if (paused) {
          ctx.fillStyle = 'red';
          ctx.font = "40px Arial";
          const msg = "Game Over!";
          ctx.fillText(msg, canvas.width / 2 - ctx.measureText(msg).width / 2, canvas.height / 2);
      }
  }

  // Main game loop: update state then draw
  function gameLoop() {
      update();
      draw();
  }

  // Handle arrow key presses to change snake direction
  window.addEventListener('keydown', function (e) {
      if (paused) return; // Ignore input if game over
      if (e.key === 'ArrowUp' && direction.y !== 1) {
          direction = { x: 0, y: -1 };
      } else if (e.key === 'ArrowDown' && direction.y !== -1) {
          direction = { x: 0, y: 1 };
      } else if (e.key === 'ArrowLeft' && direction.x !== 1) {
          direction = { x: -1, y: 0 };
      } else if (e.key === 'ArrowRight' && direction.x !== -1) {
          direction = { x: 1, y: 0 };
      }
  });

  // Initialize game state and start the game loop
  startGame();
  initGameLoop();
});
