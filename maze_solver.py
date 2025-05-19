import random
import sys

sys.setrecursionlimit(10000)

class Maze:
    def __init__(self, rows=30, cols=30):
        self.rows = rows
        self.cols = cols
        self.grid = [[{'walls': [True, True, True, True], 'visited': False} for _ in range(cols)] for _ in range(rows)]

    def index_valid(self, r, c):
        return 0 <= r < self.rows and 0 <= c < self.cols

    def neighbors_unvisited(self, r, c):
        neighbors = []
        directions = [(-1,0), (0,1), (1,0), (0,-1)]
        for i, (dr, dc) in enumerate(directions):
            nr, nc = r + dr, c + dc
            if self.index_valid(nr, nc) and not self.grid[nr][nc]['visited']:
                neighbors.append((nr, nc, i))
        return neighbors

    def remove_walls(self, r1, c1, r2, c2):
        # 0=top, 1=right, 2=bottom, 3=left
        dx = c1 - c2
        dy = r1 - r2
        if dx == 1:
            self.grid[r1][c1]['walls'][3] = False
            self.grid[r2][c2]['walls'][1] = False
        elif dx == -1:
            self.grid[r1][c1]['walls'][1] = False
            self.grid[r2][c2]['walls'][3] = False
        if dy == 1:
            self.grid[r1][c1]['walls'][0] = False
            self.grid[r2][c2]['walls'][2] = False
        elif dy == -1:
            self.grid[r1][c1]['walls'][2] = False
            self.grid[r2][c2]['walls'][0] = False

    def generate_maze(self):
        stack = []
        r, c = 0, 0
        self.grid[r][c]['visited'] = True
        stack.append((r, c))

        while stack:
            r, c = stack[-1]
            neighbors = self.neighbors_unvisited(r, c)
            if neighbors:
                nr, nc, _ = random.choice(neighbors)
                self.remove_walls(r, c, nr, nc)
                self.grid[nr][nc]['visited'] = True
                stack.append((nr, nc))
            else:
                stack.pop()

    def print_maze(self, path=set()):
        # Print top border
        print(" " + "_" * (self.cols * 2 -1))
        for r in range(self.rows):
            line = "|"
            for c in range(self.cols):
                cell = self.grid[r][c]
                # bottom wall:
                bottom = "_" if cell['walls'][2] else " "
                # right wall:
                right = "|" if cell['walls'][1] else " "
                if (r,c) in path:
                    bottom = '*'
                line += bottom + right
            print(line)

    def get_accessible_neighbors(self, r, c):
        neighbors = []
        directions = [(-1,0), (0,1), (1,0), (0,-1)]
        for i, (dr, dc) in enumerate(directions):
            nr, nc = r + dr, c + dc
            if self.index_valid(nr, nc) and not self.grid[r][c]['walls'][i]:
                neighbors.append((nr, nc))
        return neighbors

    def solve_dfs(self):
        start = (0,0)
        end = (self.rows-1, self.cols-1)
        visited = set()
        path = []

        def dfs(r,c):
            if (r,c) == end:
                path.append((r,c))
                return True
            visited.add((r,c))
            for nr,nc in self.get_accessible_neighbors(r,c):
                if (nr,nc) not in visited:
                    if dfs(nr,nc):
                        path.append((r,c))
                        return True
            return False
        
        dfs(*start)
        path.reverse()
        return path

if __name__ == "__main__":
    maze = Maze()
    maze.generate_maze()
    print("Generated maze (bottom walls '_' and right walls '|'), '*' marks solution path:")
    solution_path = set(maze.solve_dfs())
    maze.print_maze(solution_path)
