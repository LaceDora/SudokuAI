import React, { useState, useRef } from "react";
import "./App.css";
import G from "./components/SudokuGrid";
import { S, E, GC, RC, V } from "./utils/sudokuUtils";

const A: React.FC = () => {
  const [g, setG] = useState<(string | number)[][]>(JSON.parse(JSON.stringify(E)));
  const [h, setH] = useState<(string | number)[][][]>([]);
  const [err, setErr] = useState("");
  const [solv, setSolv] = useState(false);
  const [iv, setIV] = useState<boolean[][]>(Array(9).fill(null).map(() => Array(9).fill(false)));
  const [stopFunc, setStopFunc] = useState<(() => void) | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [showOptions, setShowOptions] = useState(false);
  const [statusType, setStatusType] = useState<"" | "success" | "stop">("");
  const [autoSolvedCells, setAutoSolvedCells] = useState<boolean[][]>(Array(9).fill(null).map(() => Array(9).fill(false)));
  const solvingRef = useRef<{ stopped: boolean }>({ stopped: false });
  const [solution, setSolution] = useState<number[][] | null>(null);

  const ch = (r: number, c: number, v: string) => {
  setErr("");
  setSolv(false);
  setH(hh => [...hh, JSON.parse(JSON.stringify(g))]);
  const ng = g.map(row => [...row]);
  ng[r][c] = v;

  // Kiểm tra trùng số theo quy tắc Sudoku
  const num = Number(v);
if (v !== "" && num >= 1 && num <= 9) {
  const iv = Array(9).fill(null).map(() => Array(9).fill(false));
  let hasDuplicate = false;

  // Kiểm tra hàng và cột
  for (let i = 0; i < 9; i++) {
    if (i !== c && ng[r][i] === num) {
      iv[r][i] = true;
      hasDuplicate = true;
    }
    if (i !== r && ng[i][c] === num) {
      iv[i][c] = true;
      hasDuplicate = true;
    }
  }
  // Kiểm tra khối 3x3
  const sr = Math.floor(r / 3) * 3, sc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 9; i++) {
    const rr = sr + Math.floor(i / 3);
    const cc = sc + (i % 3);
    if ((rr !== r || cc !== c) && ng[rr][cc] === num) {
      iv[rr][cc] = true;
      hasDuplicate = true;
    }
  }
  if (hasDuplicate) {
    iv[r][c] = true;
    setIV(iv);
    setG(ng);
    return;
  }
}
  setG(ng);
  setAutoSolvedCells(Array(9).fill(null).map(() => Array(9).fill(false))); // clear auto-solved highlight

  // Kiểm tra đúng/sai với solution (nếu có)
  if (
  solution &&
  solution[r] &&
  g[r][c] === "" &&
  v !== "" &&
  Number(v) !== solution[r][c]
) {
  const ivNew = Array(9).fill(null).map(() => Array(9).fill(false));
  ivNew[r][c] = true;
  setIV(ivNew);
  setErr("Nhập sai!");
  return;
}


  // Nếu đúng thì kiểm tra hợp lệ bình thường
  const { valid, invalidPositions } = V(ng);
  setIV(invalidPositions);
};
//chế độ tự giải
  const solveStep = async () => {
    const { valid } = V(g);
    if (!valid) {
      setErr("Có số không hợp lệ !");
      setStatusType("");
      return;
    }
    setErr("");
    setStatusType("");
    setSolv(true);

    solvingRef.current.stopped = false;
    const { steps, stopSolving } = S(g.map(r => [...r]));
    setStopFunc(() => () => {
      solvingRef.current.stopped = true;
      stopSolving();
    });

    let prevGrid = g.map(row => row.map(v => v));
    for (const step of steps) {
      if (solvingRef.current.stopped) break;
      await animateStepChange(prevGrid, step.grid);
      prevGrid = step.grid.map(row => [...row]);
    }

    if (solvingRef.current.stopped) {
      setErr("Đã dừng giải!");
      setStatusType("stop");
    } else if (steps.length === 0 || !steps[steps.length - 1].solved) {
      setErr("Không thể giải Sudoku này.");
      setStatusType("");
    } else {
      setErr("Đã được giải xong!");
      setStatusType("success");
      // Đánh dấu các ô auto-solved
      const lastStep = steps[steps.length - 1].grid;
      const before = g.map(row => row.map(v => Number(v) || 0));
      const auto = Array(9).fill(null).map(() => Array(9).fill(false));
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (before[r][c] === 0 && lastStep[r][c] !== 0) {
            auto[r][c] = true;
          }
        }
      }
      setAutoSolvedCells(auto);
      setG(lastStep.map(row => row.map(v => (v === 0 ? "" : v))));
    }
    setSolv(false);
    setStopFunc(null);
    solvingRef.current.stopped = false;
  };

  // Hiển thị từng số một khi giải tự động
  const animateStepChange = async (prevGrid: (string | number)[][], nextGrid: number[][]) => {
  const prev = prevGrid.map(row => row.map(v => Number(v) || 0));
  const next = nextGrid;
  let changed = false;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (solvingRef.current.stopped) return;
      if (prev[r][c] !== next[r][c]) {
        changed = true;
        await new Promise(res => setTimeout(res, 200));
        if (solvingRef.current.stopped) return; 
        setG(gPrev => {
          const gNew = gPrev.map(row => [...row]);
          gNew[r][c] = next[r][c] === 0 ? "" : next[r][c];
          return gNew;
        });
      }
    }
  }

  if (!changed) {
    setG(next.map(row => row.map(v => (v === 0 ? "" : v))));
  }
};

//stop
  const stopSolvingHandler = () => {
    if (stopFunc) stopFunc();
    setStopFunc(null);
    setSolv(false);
    setErr("Đã dừng giải!");
    setStatusType("stop");
  };

  // Số ô bỏ trống theo mức độ
  const getRemoveCount = (level: "easy" | "medium" | "hard") => {
    if (level === "easy") return 40;
    if (level === "medium") return 50;
    return 60;
  };


const genPuzzle = (level = difficulty) => {
  setErr("");
  setSolv(false);
  const complete = GC();
  setSolution(complete.map(row => [...row])); // Lưu solution
  const puzzle = RC(complete, getRemoveCount(level));
  setG(puzzle);
  setIV(Array(9).fill(null).map(() => Array(9).fill(false)));
  setH([]);
  setAutoSolvedCells(Array(9).fill(null).map(() => Array(9).fill(false)));
};

//xóa
  const clear = () => {
    setErr("");
    setSolv(false);
    setH(hh => [...hh, JSON.parse(JSON.stringify(g))]);
    setG(JSON.parse(JSON.stringify(E)));
    setIV(Array(9).fill(null).map(() => Array(9).fill(false)));
    setAutoSolvedCells(Array(9).fill(null).map(() => Array(9).fill(false)));
  };
// lưu lịch sử
  const undo = () => {
    setErr("");
    setSolv(false);
    setH(hh => {
      if (hh.length === 0) return hh;
      const last = hh[hh.length - 1];
      setG(JSON.parse(JSON.stringify(last)));
      setAutoSolvedCells(Array(9).fill(null).map(() => Array(9).fill(false)));
      return hh.slice(0, hh.length - 1);
    });
  };

  // Gợi ý: điền một ô hợp lệ ngẫu nhiên còn trống
  const suggest = () => {
  setErr("");
  setSolv(false);

  // Nếu chưa có solution, tạo mới
  let solvedGrid = solution;
  if (!solvedGrid) {
    const { steps } = S(g.map(row => [...row]));
    if (!steps.length || !steps[steps.length - 1].solved) {
      setErr("Không thể gợi ý cho Sudoku này.");
      setStatusType("");
      return;
    }
    solvedGrid = steps[steps.length - 1].grid;
    setSolution(solvedGrid.map(row => [...row])); // lưu lại lời giải
  }

  // Tìm các ô trống
  const emptyCells: { r: number, c: number }[] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!g[r][c] || g[r][c] === "") {
        emptyCells.push({ r, c });
      }
    }
  }
  if (emptyCells.length === 0) {
    setErr("Không còn ô trống để gợi ý.");
    setStatusType("");
    return;
  }

  // Chọn ngẫu nhiên một ô trống
  const idx = Math.floor(Math.random() * emptyCells.length);
  const { r, c } = emptyCells[idx];
  setH(hh => [...hh, JSON.parse(JSON.stringify(g))]);
  const ng = g.map(row => [...row]);
  ng[r][c] = solvedGrid[r][c];
  setG(ng);

  // Đánh dấu ô vừa gợi ý là auto-solved
  const auto = Array(9).fill(null).map(() => Array(9).fill(false));
  auto[r][c] = true;
  setAutoSolvedCells(auto);

  // Kiểm tra lại tính hợp lệ
  const { valid, invalidPositions } = V(ng);
  setIV(invalidPositions);
};


  return (
    <div className="app-container">
      <header className="header">
       <p className="main-title">Trí tuệ Nhân tạo</p>
       <p className="sub-title"> AI Sudoku - Nhóm 7</p>
      </header>
      <div className="main-content">
  <div className="sudoku-section">
    <G grid={g} onCellChange={ch} disabled={solv} invalidCells={iv} autoSolvedCells={autoSolvedCells}/>
  </div>

  <div className="controls">
    <button onClick={solveStep} disabled={solv || !!err}>Chế độ tự giải</button>
    <button onClick={stopSolvingHandler} disabled={!solv}>Stop</button>
    <button onClick={() => genPuzzle()}>Random</button>
    <button onClick={clear}>Reset</button>
    <button onClick={undo} disabled={h.length === 0}>Quay Lại</button>
    <button onClick={suggest} disabled={solv || !!err}>Gợi ý</button>

    <div style={{ gridColumn: "span 2" }}>
      <button onClick={() => setShowOptions(v => !v)} style={{ width: "100%" }}> Tùy chọn chế độ </button>

      {showOptions && (
        <div className="controls-options" style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8,}}>
          <button onClick={() => {setDifficulty("easy"); genPuzzle("easy"); setShowOptions(false);}} disabled={difficulty === "easy"}>
            Dễ
          </button>
          <button onClick={() => {setDifficulty("medium"); genPuzzle("medium"); setShowOptions(false);}} disabled={difficulty === "medium"}>
            Trung bình
          </button>
          <button onClick={() => {setDifficulty("hard"); genPuzzle("hard"); setShowOptions(false);}} disabled={difficulty === "hard"}>
            Khó
          </button>
        </div>
      )}
    </div>

    {/* Thông báo lỗi / trạng thái */}
    {err && (
      <div className={"error-msg" + (statusType === "success" ? " status-success": statusType === "stop" ? " status-stop": "")} style={{ gridColumn: "span 2" }}> {err} </div> )}
  </div>
</div>
    </div>
  );
};

export default A;
