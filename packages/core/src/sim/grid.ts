import type { Grid, Cell } from "./types";

/**
 * 그리드 관련 유틸리티 함수
 */

// 각 방향에 대한 (dx, dy) 변화량
export const DIRECTIONS = {
  UP: [0, -1],
  DOWN: [0, 1],
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  UP_LEFT: [-1, -1],
  UP_RIGHT: [1, -1],
  DOWN_LEFT: [-1, 1],
  DOWN_RIGHT: [1, 1],
};

/**
 * 특정 칸의 이웃 인덱스를 토러스 경계 규칙에 따라 계산합니다.
 * @param index - 현재 칸의 인덱스
 * @param dx - x 방향 변화량
 * @param dy - y 방향 변화량
 * @param width - 그리드 너비
 * @param height - 그리드 높이
 * @returns 이웃 칸의 인덱스
 */
export function getNeighborIndex(index: number, dx: number, dy: number, width: number, height: number): number {
  const x = index % width;
  const y = Math.floor(index / width);

  const nx = (x + dx + width) % width;
  const ny = (y + dy + height) % height;

  return ny * width + nx;
}

/**
 * 특정 칸의 주변 8칸에 살아있는 이웃이 하나라도 있는지 확인합니다.
 * @param grid - 현재 그리드
 * @param index - 확인할 칸의 인덱스
 * @returns 살아있는 이웃이 있으면 true, 아니면 false
 */
export function hasAliveNeighbor(grid: Grid, index: number): boolean {
  return getNeighborIndices(grid, index).some(i => grid.cells[i].isAlive);
}

/**
 * 특정 칸의 주변 8칸 이웃의 인덱스 목록을 반환합니다.
 * @param grid - 현재 그리드
 * @param index - 기준 칸의 인덱스
 * @returns 이웃 인덱스들의 배열
 */
export function getNeighborIndices(grid: Grid, index: number): number[] {
  const { width, height } = grid;
  const indices: number[] = [];
  for (const key in DIRECTIONS) {
    const [dx, dy] = DIRECTIONS[key as keyof typeof DIRECTIONS];
    indices.push(getNeighborIndex(index, dx, dy, width, height));
  }
  return indices;
}

/**
 * 특정 칸의 주변 8칸 이웃 중 살아있는 세포 목록을 반환합니다.
 * @param grid - 현재 그리드
 * @param index - 기준 칸의 인덱스
 * @returns 살아있는 이웃 세포들의 배열
 */
export function getNeighbors(grid: Grid, index: number): Cell[] {
  return getNeighborIndices(grid, index)
    .map(i => grid.cells[i])
    .filter(cell => cell.isAlive);
}
