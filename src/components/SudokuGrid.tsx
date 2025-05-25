// components/SudokuGrid.tsx
import React from "react";

type SudokuGridProps = {
  grid: (string | number)[][];
  onCellChange: (row: number, col: number, value: string) => void;
  disabled?: boolean;
};

const SudokuGrid: React.FC<SudokuGridProps> = ({
  grid,
  onCellChange,
  disabled,
}) => (
  <table className="sudoku-grid">
    <tbody>
      {grid.map((row, r) => (
        <tr key={r}>
          {row.map((cell, c) => (
            <td
              key={c}
              className={
                (r % 3 === 2 ? " border-bottom" : "") +
                (c % 3 === 2 ? " border-right" : "")
              }
            >
              <input
                type="text"
                maxLength={1}
                value={cell === 0 ? "" : cell}
                disabled={disabled}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^1-9]/g, "");
                  onCellChange(r, c, val);
                }}
                className="cell-input"
                aria-label={`cell-${r}-${c}`}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default SudokuGrid;
