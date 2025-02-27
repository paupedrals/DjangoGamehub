// static/js/tetris.js
window.addEventListener('load', function() {
    const canvas = document.getElementById('tetris-canvas');
    const ctx = canvas.getContext('2d');
  
    // Set board dimensions and block size
    const COLS = 10;
    const ROWS = 20;
    const BLOCK_SIZE = 30;
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
  
    // Define Tetromino shapes and colors
    const tetrominoes = {
      I: {
        shape: [
          [0, 0, 0, 0],
          [1, 1, 1, 1],
          [0, 0, 0, 0],
          [0, 0, 0, 0]
        ],
        color: '#0ff'
      },
      J: {
        shape: [
          [1, 0, 0],
          [1, 1, 1],
          [0, 0, 0]
        ],
        color: '#00f'
      },
      L: {
        shape: [
          [0, 0, 1],
          [1, 1, 1],
          [0, 0, 0]
        ],
        color: '#ff7f00'
      },
      O: {
        shape: [
          [1, 1],
          [1, 1]
        ],
        color: '#ff0'
      },
      S: {
        shape: [
          [0, 1, 1],
          [1, 1, 0],
          [0, 0, 0]
        ],
        color: '#0f0'
      },
      T: {
        shape: [
          [0, 1, 0],
          [1, 1, 1],
          [0, 0, 0]
        ],
        color: '#f0f'
      },
      Z: {
        shape: [
          [1, 1, 0],
          [0, 1, 1],
          [0, 0, 0]
        ],
        color: '#f00'
      }
    };
  
    // Initialize board
    let board = [];
    function initBoard() {
      board = [];
      for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
          board[r][c] = 0;
        }
      }
    }
    initBoard();
  
    // Game state variables
    let currentPiece = null;
    let currentX = 0;
    let currentY = 0;
    let dropCounter = 0;
    let dropInterval = 1000; // in milliseconds
    let lastTime = 0;
    let score = 0;
  
    // Return a random tetromino
    function randomTetromino() {
      const keys = Object.keys(tetrominoes);
      const randKey = keys[Math.floor(Math.random() * keys.length)];
      const tetro = tetrominoes[randKey];
      return {
        shape: tetro.shape.map(row => row.slice()),
        color: tetro.color
      };
    }
  
    // Rotate a matrix 90° clockwise
    function rotate(matrix) {
      const N = matrix.length;
      let result = [];
      for (let r = 0; r < N; r++) {
        result[r] = [];
        for (let c = 0; c < N; c++) {
          result[r][c] = matrix[N - c - 1][r];
        }
      }
      return result;
    }
  
    // Check collision for piece at (x, y)
    function collision(x, y, piece) {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            let newX = x + c;
            let newY = y + r;
            if (newX < 0 || newX >= COLS || newY >= ROWS) {
              return true;
            }
            if (newY >= 0 && board[newY][newX] !== 0) {
              return true;
            }
          }
        }
      }
      return false;
    }
  
    // Merge current piece into board
    function merge(piece, x, y) {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            board[y + r][x + c] = piece.color;
          }
        }
      }
    }
  
    // Clear full rows and update score
    function clearLines() {
      let lines = 0;
      for (let r = ROWS - 1; r >= 0; r--) {
        let full = true;
        for (let c = 0; c < COLS; c++) {
          if (board[r][c] === 0) {
            full = false;
            break;
          }
        }
        if (full) {
          board.splice(r, 1);
          board.unshift(new Array(COLS).fill(0));
          lines++;
          r++; // recheck the same row index
        }
      }
      score += lines * 10;
    }
  
    // Draw the board grid
    function drawBoard() {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (board[r][c] !== 0) {
            ctx.fillStyle = board[r][c];
            ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          } else {
            ctx.fillStyle = '#111';
            ctx.fillRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            ctx.strokeStyle = '#222';
            ctx.strokeRect(c * BLOCK_SIZE, r * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          }
        }
      }
    }
  
    // Draw the current tetromino piece
    function drawPiece(piece, x, y) {
      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (piece.shape[r][c]) {
            ctx.fillStyle = piece.color;
            ctx.fillRect((x + c) * BLOCK_SIZE, (y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
            ctx.strokeStyle = '#000';
            ctx.strokeRect((x + c) * BLOCK_SIZE, (y + r) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
          }
        }
      }
    }
  
    // Draw the current score
    function drawScore() {
      ctx.fillStyle = 'white';
      ctx.font = "20px Arial";
      ctx.fillText("Score: " + score, 10, 25);
    }
  
    // Main update loop using requestAnimationFrame
    function update(time = 0) {
      const deltaTime = time - lastTime;
      lastTime = time;
      dropCounter += deltaTime;
      if (dropCounter > dropInterval) {
        drop();
        dropCounter = 0;
      }
      draw();
      requestAnimationFrame(update);
    }
  
    // Drop the current piece by one row or merge if collision occurs
    function drop() {
      if (!collision(currentX, currentY + 1, currentPiece)) {
        currentY++;
      } else {
        merge(currentPiece, currentX, currentY);
        clearLines();
        currentPiece = randomTetromino();
        currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
        currentY = 0;
        if (collision(currentX, currentY, currentPiece)) {
          // Game over: reset board and score
          submitFinalScore(score);
          initBoard();
          score = 0;
        }
      }
    }
  
    // Draw the entire game scene
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBoard();
      drawPiece(currentPiece, currentX, currentY);
      drawScore();
    }
  
    // Handle keyboard input for movement and rotation
    document.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') {
        if (!collision(currentX - 1, currentY, currentPiece)) {
          currentX--;
        }
      } else if (event.key === 'ArrowRight') {
        if (!collision(currentX + 1, currentY, currentPiece)) {
          currentX++;
        }
      } else if (event.key === 'ArrowDown') {
        drop();
      } else if (event.key === 'ArrowUp') {
        const rotated = rotate(currentPiece.shape);
        const oldShape = currentPiece.shape;
        currentPiece.shape = rotated;
        if (collision(currentX, currentY, currentPiece)) {
          currentPiece.shape = oldShape;
        }
      }
    });
  
    // Start the game
    currentPiece = randomTetromino();
    currentX = Math.floor(COLS / 2) - Math.floor(currentPiece.shape[0].length / 2);
    currentY = 0;
    update();
  });
  