export const GRID_SIZE = 9;
export const EMPTY_GRID = Array.from({ length: GRID_SIZE }, () =>
  Array(GRID_SIZE).fill("")
);

// Kiểm tra số num có hợp lệ đặt ở vị trí (row, col)
const isValidPlacement = (
  grid: number[][],
  row: number,
  col: number,
  num: number
) => {
  for (let i = 0; i < GRID_SIZE; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[startRow + r][startCol + c] === num) return false;
    }
  }
  return true;
};

// Thuật toán backtracking giải Sudoku
export function solveSudoku(inputGrid: (string | number)[][]) {
  let grid = inputGrid.map((row) => row.map(Number));
  function solve(): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!grid[r][c]) {
          for (let num = 1; num <= GRID_SIZE; num++) {
            if (isValidPlacement(grid, r, c, num)) {
              grid[r][c] = num;
              if (solve()) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }
  const isSolved = solve();
  return isSolved ? grid.map((row) => row.slice()) : null;
}

// Hàm shuffle mảng (dùng cho tạo số ngẫu nhiên)
function shuffle(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Tạo bảng Sudoku hoàn chỉnh (đã giải)
export function generateCompleteGrid(): number[][] {
  const grid: number[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0)
  );

  function fillGrid(): boolean {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] === 0) {
          const numbers = shuffle(
            [...Array(GRID_SIZE).keys()].map((x) => x + 1)
          );
          for (const num of numbers) {
            if (isValidPlacement(grid, r, c, num)) {
              grid[r][c] = num;
              if (fillGrid()) return true;
              grid[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fillGrid();
  return grid;
}

// Xóa ngẫu nhiên n ô để tạo đề, kiểu hỗn hợp number | string
export function removeCells(
  grid: number[][],
  n: number
): (string | number)[][] {
  const puzzle: (number | string)[][] = grid.map((row) => row.slice());
  let cellsToRemove = n;

  while (cellsToRemove > 0) {
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);

    if (
      puzzle[r][c] !== "" &&
      puzzle[r][c] !== 0 &&
      puzzle[r][c] !== null &&
      puzzle[r][c] !== undefined
    ) {
      puzzle[r][c] = "";
      cellsToRemove--;
    }
  }
  return puzzle;
}
