import type { Grid } from "./types";
import { DIRECTIONS, getNeighborIndex } from "./grid";

/**
 * 그리드의 각 칸이 받는 총 영향력(S_total)을 계산합니다.
 * @param grid - 현재 세대의 그리드
 * @returns 각 칸의 총 영향력을 담은 배열
 */
export function calculateInfluence(grid: Grid): number[] {
  const { width, height, cells } = grid;
  const influenceGrid: number[] = new Array(width * height).fill(0);

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (!cell.isAlive) {
      continue;
    }

    const [u, d, l, r] = cell.gene;

    // 각 방향에 대한 영향력 값
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

    // 8방향 이웃에 영향력 전파
    for (const key in DIRECTIONS) {
      const directionKey = key as keyof typeof DIRECTIONS;
      const [dx, dy] = DIRECTIONS[directionKey];
      const neighborIndex = getNeighborIndex(i, dx, dy, width, height);
      influenceGrid[neighborIndex] += influences[directionKey];
    }
  }

  // MVP 체크리스트에 따라, 만약 영향력 값에 소수가 포함될 경우
  // 이 단계에서 최종 합산된 S_total에 반올림을 적용할 수 있습니다.
  // 현재 규칙 상으로는 정수 연산만 수행됩니다.
  // return influenceGrid.map(s_total => Math.round(s_total * 10) / 10);

  return influenceGrid;
}
