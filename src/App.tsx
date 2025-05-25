import React, { useState } from "react";
import "./App.css";
import SudokuGrid from "./components/SudokuGrid";
import {
  solveSudoku,
  EMPTY_GRID,
  generateCompleteGrid,
  removeCells,
} from "./utils/sudokuUtils";

const App: React.FC = () => {
  const [grid, setGrid] = useState<(string | number)[][]>(
    JSON.parse(JSON.stringify(EMPTY_GRID))
  );
  const [history, setHistory] = useState<(string | number)[][][]>([]);
  const [solved, setSolved] = useState<number[][] | null>(null);
  const [error, setError] = useState("");

  const handleCellChange = (row: number, col: number, value: string) => {
    setSolved(null);
    setError("");
    setHistory((h) => [...h, JSON.parse(JSON.stringify(grid))]);
    const newGrid = grid.map((r) => [...r]);
    newGrid[row][col] = value;
    setGrid(newGrid);
  };

  // Giữ nguyên nút Tự Giải để giải lưới hiện tại
  const handleSolve = () => {
    setSolved(null);
    setError("");
    const result = solveSudoku(grid);
    if (result) {
      setSolved(result);
      setGrid(result.map((row) => row.map((v) => v || "")));
    } else {
      setError("Không thể giải Sudoku này.");
    }
  };

  // Nút tạo đề Sudoku mới
  const handleGeneratePuzzle = () => {
    setSolved(null);
    setError("");
    const completeGrid = generateCompleteGrid();
    // Xóa 40 ô làm đề (có thể điều chỉnh số ô trống để tăng giảm độ khó)
    const puzzle = removeCells(completeGrid, 40);
    setGrid(puzzle);
    setHistory([]);
  };

  const handleClear = () => {
    setSolved(null);
    setError("");
    setHistory((h) => [...h, JSON.parse(JSON.stringify(grid))]);
    setGrid(JSON.parse(JSON.stringify(EMPTY_GRID)));
  };

  const handleUndo = () => {
    setError("");
    setSolved(null);
    setHistory((h) => {
      if (h.length === 0) return h;
      const last = h[h.length - 1];
      setGrid(JSON.parse(JSON.stringify(last)));
      return h.slice(0, h.length - 1);
    });
  };

  return (
    <div className="app-container">
      <header className="header">Sudoku Solver</header>
      <div className="main-content">
        <SudokuGrid grid={grid} onCellChange={handleCellChange} />
        <div className="controls">
          <button onClick={handleSolve}>Tự Giải</button>
          <button onClick={handleGeneratePuzzle}>Tạo Đề Mới</button>
          <button onClick={handleClear}>Xóa Hết</button>
          <button onClick={handleUndo} disabled={history.length === 0}>
            Hoàn Tác
          </button>
          {error && <div className="error-msg">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default App;
