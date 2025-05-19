(() => {
  const canvas = document.getElementById("mazeCanvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  const rows = 30;
  const cols = 30;
  const cellSize = width / cols;

  let grid = [];
  let stack = [];

  function Cell(row, col) {
    this.row = row;
    this.col = col;
    this.walls = [true, true, true, true];
    this.visited = false;
    this.inPath = false;

    this.highlight = function (color) {
      ctx.fillStyle = color;
      ctx.fillRect(
        this.col * cellSize,
        this.row * cellSize,
        cellSize,
        cellSize
      );
    };

    this.show = function () {
      const x = this.col * cellSize;
      const y = this.row * cellSize;
      ctx.strokeStyle = "#64ffda";
      ctx.lineWidth = 2;

      if (this.walls[0]) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
        ctx.stroke();
      }
      if (this.walls[1]) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (this.walls[2]) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y + cellSize);
        ctx.lineTo(x, y + cellSize);
        ctx.stroke();
      }
      if (this.walls[3]) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      if (this.visited) {
        ctx.fillStyle = "#253040";
        ctx.fillRect(x, y, cellSize, cellSize);
      }

      if (this.inPath) {
        ctx.fillStyle = "#64ffda88";
        ctx.fillRect(x, y, cellSize, cellSize);
      }
    };

    this.getNeighbors = function () {
      const neighbors = [];

      const top = grid[index(this.row - 1, this.col)];
      const right = grid[index(this.row, this.col + 1)];
      const bottom = grid[index(this.row + 1, this.col)];
      const left = grid[index(this.row, this.col - 1)];

      if (top && !top.visited) neighbors.push(top);
      if (right && !right.visited) neighbors.push(right);
      if (bottom && !bottom.visited) neighbors.push(bottom);
      if (left && !left.visited) neighbors.push(left);

      return neighbors;
    };
  }

  function index(row, col) {
    if (row < 0 || col < 0 || row >= rows || col >= cols) return -1;
    return row * cols + col;
  }

  function generateMaze() {
    grid = [];
    stack = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        grid.push(new Cell(r, c));
      }
    }

    let current = grid[0];
    current.visited = true;
    stack.push(current);

    while (stack.length > 0) {
      current = stack[stack.length - 1];
      const neighbors = current.getNeighbors();

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        removeWalls(current, next);
        next.visited = true;
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    // Add extra random connections to create loops (multiple paths)
    const extraConnections = Math.floor(rows * cols * 0.15); // 15% of cells
    for (let i = 0; i < extraConnections; i++) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      const cell = grid[index(r, c)];
      const directions = [
        { dr: -1, dc: 0, wall: 0, opp: 2 }, // top
        { dr: 0, dc: 1, wall: 1, opp: 3 },  // right
        { dr: 1, dc: 0, wall: 2, opp: 0 },  // bottom
        { dr: 0, dc: -1, wall: 3, opp: 1 }  // left
      ];
      const dir = directions[Math.floor(Math.random() * 4)];
      const nr = r + dir.dr;
      const nc = c + dir.dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        const neighbor = grid[index(nr, nc)];
        // Only remove wall if there is still a wall between them
        if (cell.walls[dir.wall] && neighbor.walls[dir.opp]) {
          cell.walls[dir.wall] = false;
          neighbor.walls[dir.opp] = false;
        }
      }
    }
    // Reset visited for next generation/solving
    for (let i = 0; i < grid.length; i++) {
      grid[i].visited = false;
    }
  }

  function removeWalls(a, b) {
    const x = a.col - b.col;
    const y = a.row - b.row;

    if (x === 1) {
      a.walls[3] = false;
      b.walls[1] = false;
    } else if (x === -1) {
      a.walls[1] = false;
      b.walls[3] = false;
    }

    if (y === 1) {
      a.walls[0] = false;
      b.walls[2] = false;
    } else if (y === -1) {
      a.walls[2] = false;
      b.walls[0] = false;
    }
  }

  function drawMaze() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < grid.length; i++) {
      grid[i].show();
    }
    let start = grid[0];
    let end = grid[grid.length - 1];
    ctx.fillStyle = "#ff6f61";
    ctx.fillRect(
      start.col * cellSize + cellSize / 4,
      start.row * cellSize + cellSize / 4,
      cellSize / 2,
      cellSize / 2
    );
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(
      end.col * cellSize + cellSize / 4,
      end.row * cellSize + cellSize / 4,
      cellSize / 2,
      cellSize / 2
    );
  }

  function solveMazeDFS() {
    for (let i = 0; i < grid.length; i++) {
      grid[i].inPath = false;
    }
    const start = grid[0];
    const end = grid[grid.length - 1];
    let found = false;

    const visited = new Set();
    const path = [];

    function dfs(cell) {
      if (found) return;

      path.push(cell);
      visited.add(cell);

      if (cell === end) {
        found = true;
        return;
      }

      const neighbors = getAccessibleNeighbors(cell);

      for (let n of neighbors) {
        if (!visited.has(n)) {
          dfs(n);
          if (found) return;
        }
      }

      if (!found) path.pop();
    }

    function animatePath(i) {
      if (i >= path.length) return;
      const cell = path[i];
      cell.inPath = true;
      drawMaze();
      setTimeout(() => animatePath(i + 1), 30);
    }

    dfs(start);
    animatePath(0);
  }

  function solveMazeBFS() {
    for (let i = 0; i < grid.length; i++) {
      grid[i].inPath = false;
    }
    const start = grid[0];
    const end = grid[grid.length - 1];
    const visited = new Set();
    const parent = new Map();
    const queue = [start];
    visited.add(start);
    let found = false;

    while (queue.length > 0) {
      const cell = queue.shift();
      if (cell === end) {
        found = true;
        break;
      }
      const neighbors = getAccessibleNeighbors(cell);
      for (let n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          parent.set(n, cell);
          queue.push(n);
        }
      }
    }

    // Reconstruct path
    let path = [];
    if (found) {
      let curr = end;
      while (curr !== start) {
        path.push(curr);
        curr = parent.get(curr);
      }
      path.push(start);
      path.reverse();
    }

    function animatePath(i) {
      if (i >= path.length) return;
      const cell = path[i];
      cell.inPath = true;
      drawMaze();
      setTimeout(() => animatePath(i + 1), 30);
    }
    animatePath(0);
  }

  function getAccessibleNeighbors(cell) {
    const neighbors = [];
    const row = cell.row;
    const col = cell.col;

    if (!cell.walls[0]) {
      neighbors.push(grid[index(row - 1, col)]);
    }
    if (!cell.walls[1]) {
      neighbors.push(grid[index(row, col + 1)]);
    }
    if (!cell.walls[2]) {
      neighbors.push(grid[index(row + 1, col)]);
    }
    if (!cell.walls[3]) {
      neighbors.push(grid[index(row, col - 1)]);
    }

    return neighbors;
  }

  document.getElementById("generateBtn").addEventListener("click", () => {
    generateMaze();
    drawMaze();
    document.getElementById("info").textContent =
      'Maze generated. Click "Solve Maze (DFS)" to watch the solution.';
  });

  document.getElementById("solveBtn").addEventListener("click", () => {
    document.getElementById("info").textContent = "Solving maze with DFS...";
    solveMazeDFS();
  });

  document.getElementById("solveBFSBtn").addEventListener("click", () => {
    document.getElementById("info").textContent = "Solving maze with BFS...";
    solveMazeBFS();
  });

  generateMaze();
  drawMaze();
  document.getElementById("info").textContent =
    'Maze generated. Click "Solve Maze (DFS)" to watch the solution.';
})();
