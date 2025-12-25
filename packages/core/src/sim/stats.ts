import type { Grid } from "./types";

export type SimStats = {
  density: number;
  births: number;
  deaths: number;
  avgAge: number;
};

export function computeGridStats(grid: Grid): Pick<SimStats, "density" | "avgAge"> {
  const total = grid.cells.length;
  if (total === 0) {
    return { density: 0, avgAge: 0 };
  }

  let aliveCount = 0;
  let ageSum = 0;
  for (const cell of grid.cells) {
    if (!cell.isAlive) continue;
    aliveCount += 1;
    ageSum += cell.age;
  }

  return {
    density: aliveCount / total,
    avgAge: aliveCount > 0 ? ageSum / aliveCount : 0,
  };
}
