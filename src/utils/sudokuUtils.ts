export const GS = 9; // kích thước bảng
export const E = Array.from({ length: GS }, () => Array(GS).fill(""));

// Kiểm tra (hàng, cột 3x3)
const IP = (g: number[][], r: number, c: number, n: number) => {
  for (let i = 0; i < GS; i++) {
    if (g[r][i] === n || g[i][c] === n) return false;
  }
  const sr = Math.floor(r / 3) * 3;
  const sc = Math.floor(c / 3) * 3;
  for (let rr = 0; rr < 3; rr++) {
    for (let cc = 0; cc < 3; cc++) {
      if (g[sr + rr][sc + cc] === n) return false;
    }
  }
  return true;
};

// Kiểm tra bảng, đánh dấu vị trí sai
export function V(
  ig: (string | number)[][]
): { valid: boolean; invalidPositions: boolean[][] } {
  const g = ig.map(r => r.map(v => Number(v) || 0));
  const iv = Array(GS).fill(null).map(() => Array(GS).fill(false));
  let valid = true;

  for (let r = 0; r < GS; r++) {
    for (let c = 0; c < GS; c++) {
      const v = g[r][c];
      if (v !== 0) {
        g[r][c] = 0;
        if (!IP(g, r, c, v)) {
          iv[r][c] = true;
          valid = false;
        }
        g[r][c] = v;
      }
    }
  }
  return { valid, invalidPositions: iv };
}

// Helper: lấy các giá trị hợp lệ cho ô (r, c)
function getCandidates(g: number[][], r: number, c: number): number[] {
  if (g[r][c] !== 0) return [];
  const candidates: number[] = [];
  for (let n = 1; n <= GS; n++) {
    if (IP(g, r, c, n)) candidates.push(n);
  }
  return candidates;
}

// Heuristic: Hidden Singles
function applyHiddenSingles(g: number[][]): boolean {
  let changed = false;
  // Kiểm tra từng hàng
  for (let r = 0; r < GS; r++) {
    for (let n = 1; n <= GS; n++) {
      let count = 0, pos = -1;
      for (let c = 0; c < GS; c++) {
        if (g[r][c] === 0 && IP(g, r, c, n)) {
          count++;
          pos = c;
        }
      }
      if (count === 1 && g[r][pos] === 0) {
        g[r][pos] = n;
        changed = true;
      }
    }
  }
  // Kiểm tra từng cột
  for (let c = 0; c < GS; c++) {
    for (let n = 1; n <= GS; n++) {
      let count = 0, pos = -1;
      for (let r = 0; r < GS; r++) {
        if (g[r][c] === 0 && IP(g, r, c, n)) {
          count++;
          pos = r;
        }
      }
      if (count === 1 && g[pos][c] === 0) {
        g[pos][c] = n;
        changed = true;
      }
    }
  }
  // Kiểm tra từng vùng 3x3
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      for (let n = 1; n <= GS; n++) {
        let count = 0, pos: [number, number] = [-1, -1];
        for (let rr = 0; rr < 3; rr++) {
          for (let cc = 0; cc < 3; cc++) {
            const r = br * 3 + rr, c = bc * 3 + cc;
            if (g[r][c] === 0 && IP(g, r, c, n)) {
              count++;
              pos = [r, c];
            }
          }
        }
        if (count === 1 && g[pos[0]][pos[1]] === 0) {
          g[pos[0]][pos[1]] = n;
          changed = true;
        }
      }
    }
  }
  return changed;
}

let shouldStop = false;
export function stopSolving() {
  shouldStop = true;
}

// thuật toan quay lui + Stop
export function S(ig: (string | number)[][]) {
  shouldStop = false;
  const steps: { grid: number[][]; solved: boolean }[] = [];
  const g: number[][] = ig.map(r => r.map(v => Number(v) || 0));

  function solve(): boolean {
    if (shouldStop) return false;
    // Áp dụng Hidden Singles cho đến khi không còn thay đổi
    while (applyHiddenSingles(g)) {
      steps.push({ grid: g.map(rr => [...rr]), solved: false });
      if (shouldStop) return false;
    }

    // Tìm ô trống với số lượng giá trị hợp lệ ít nhất (MRV)
    // Heuristic: MRV (Minimum Remaining Values)
    let minCandidates = 10, minR = -1, minC = -1, candidates: number[] = [];
    for (let r = 0; r < GS; r++) {
      for (let c = 0; c < GS; c++) {
        if (g[r][c] === 0) {
          const cand = getCandidates(g, r, c);
          if (cand.length < minCandidates) {
            minCandidates = cand.length;
            minR = r;
            minC = c;
            candidates = cand;
            if (minCandidates === 0) return false; // dead end
            if (minCandidates === 1) break; // ưu tiên ô chỉ có 1 lựa chọn
          }
        }
      }
      if (minCandidates === 1) break;
    }
  //quay lui
    if (minR === -1) {
      steps.push({ grid: g.map(rr => [...rr]), solved: true });
      return true; // solved
    }

    for (const n of candidates) {
      if (shouldStop) return false;
      g[minR][minC] = n;
      steps.push({ grid: g.map(rr => [...rr]), solved: false });
      if (solve()) return true;// 1
      g[minR][minC] = 0;
      steps.push({ grid: g.map(rr => [...rr]), solved: false });
    }
    return false;
  }

  const success = solve();
  if (!success && !shouldStop) {
    steps.push({ grid: g.map(rr => [...rr]), solved: false });
  }
  return { steps, stopSolving };
}

// Trộn mảng để ngẫu nhiên số
function sh(arr: number[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Tạo bảng 
export function GC(): number[][] {
  const g: number[][] = Array.from({ length: GS }, () => Array(GS).fill(0));

  function fill(): boolean {
    for (let r = 0; r < GS; r++) {
      for (let c = 0; c < GS; c++) {
        if (g[r][c] === 0) {
          const nums = sh([...Array(GS).keys()].map(x => x + 1));
          for (const n of nums) {
            if (IP(g, r, c, n)) {
              g[r][c] = n;
              if (fill()) return true;
              g[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fill();
  return g;
}

// xóa n ô random khỏi bảng 
export function RC(g: number[][], n: number): (string | number)[][] {
  const p: (number | string)[][] = g.map(r => r.slice());
  let toRemove = n;

  while (toRemove > 0) {
    const r = Math.floor(Math.random() * GS);
    const c = Math.floor(Math.random() * GS);
    if (p[r][c] !== "") {
      p[r][c] = "";
      toRemove--;
    }
  }
  return p;
}

//Thuật toán quay lui và các kỹ thuật khác (tạo, kiểm tra, giải)
