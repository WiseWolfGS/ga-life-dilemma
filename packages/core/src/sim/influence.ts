import type { Grid } from "./types";
import { DIRECTIONS, getNeighborIndex } from "./grid";

/**
 * 그리드의 각 칸이 받는 총 영향력(S_total)을 계산합니다.
 * @param grid - 현재 세대의 그리드
 * @returns 각 칸의 총 영향력을 담은 배열
 */
export function calculateInfluence(grid: Grid): number[] {
  const { width, height, cells, terrain } = grid;
  const influenceGrid: number[] = new Array(width * height).fill(0);

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (!cell.isAlive) {
      continue;
    }

    // 1. 현재 칸의 지형에 따른 영향력 배율 결정
    const terrainType = terrain[i];
    let multiplier = 1;
    if (terrainType === "double") {
      multiplier = 2;
    } else if (terrainType === "half") {
      multiplier = 0.5;
    }

    // 2. 세포의 유전자에 기반한 기본 영향력 계산
    const [u, d, l, r] = cell.gene;
    const influences = {
      UP: u,
      DOWN: d,
      LEFT: l,
      RIGHT: r,
      UP_LEFT: (u + l) / 2 - 1,
      UP_RIGHT: (u + r) / 2 - 1,
      DOWN_LEFT: (d + l) / 2 - 1,
      DOWN_RIGHT: (d + r) / 2 - 1,
    };

    // 3. 8방향 이웃에 지형 배율이 적용된 영향력 전파
    for (const key in DIRECTIONS) {
      const directionKey = key as keyof typeof DIRECTIONS;
      const [dx, dy] = DIRECTIONS[directionKey];
      const neighborIndex = getNeighborIndex(i, dx, dy, width, height);
      
      const finalInfluence = influences[directionKey] * multiplier;
      influenceGrid[neighborIndex] += finalInfluence;
    }
  }

  // 최종 합산된 S_total에 반올림을 적용합니다.
  return influenceGrid.map(s_total => Math.round(s_total * 10) / 10);
}
