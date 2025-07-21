import React from "react";

type P = {
  grid: (string | number)[][];
  onCellChange: (r: number, c: number, v: string) => void;
  disabled?: boolean;
  invalidCells?: boolean[][];
  autoSolvedCells?: boolean[][];
};

const G: React.FC<P> = ({grid, onCellChange, disabled = false, invalidCells = [], autoSolvedCells = [], }) => {
  return (
    <table className="sudoku-grid">
      <tbody>
        {grid.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => {
              const val = cell === 0 ? "" : cell;
              const isInvalid = invalidCells[r]?.[c];
              const isAuto = autoSolvedCells[r]?.[c];

              // Tạo class cho ô <td>
              let tdClass = "";
              if (r % 3 === 2 && r !== 8) tdClass += " border-bottom";
              if (c % 3 === 2 && c !== 8) tdClass += " border-right";

              // Tạo class cho input
              let inputClass = "cell-input";
              if (isInvalid) inputClass += " cell-error";
              if (isAuto) inputClass += " auto-solved";

              return (
                <td key={c} className={tdClass.trim()}>
                  <input
                    type="text"
                    maxLength={1}
                    value={val}
                    disabled={disabled}
                    onChange={(e) => {
                      const filtered = e.target.value.replace(/[^1-9]/g, "");
                      onCellChange(r, c, filtered);
                    }}
                    className={inputClass.trim()}
                    aria-label={`cell-${r}-${c}`}
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default G;
