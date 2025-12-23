import type { Grid, Cell } from "./types";

/**
 * Grid-related utilities.
 */

// (dx, dy) offsets for each direction.
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
 * Compute a neighbor index using torus wrap-around.
 * @param index - current cell index
 * @param dx - x offset
 * @param dy - y offset
 * @param width - grid width
 * @param height - grid height
 * @returns neighbor cell index
 */
export function getNeighborIndex(index: number, dx: number, dy: number, width: number, height: number): number {
  const x = index % width;
  const y = Math.floor(index / width);

  const nx = (x + dx + width) % width;
  const ny = (y + dy + height) % height;

  return ny * width + nx;
}

/**
 * Check whether any of the 8 neighbors is alive.
 * @param grid - current grid
 * @param index - target cell index
 * @returns true if any neighbor is alive, otherwise false
 */
export function hasAliveNeighbor(grid: Grid, index: number): boolean {
  return getNeighborIndices(grid, index).some(i => grid.cells[i].isAlive);
}

/**
 * Return indices of the 8 neighboring cells.
 * @param grid - current grid
 * @param index - base cell index
 * @returns array of neighbor indices
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
 * Return alive neighboring cells among the 8 neighbors.
 * @param grid - current grid
 * @param index - base cell index
 * @returns array of alive neighbor cells
 */
export function getNeighbors(grid: Grid, index: number): Cell[] {
  return getNeighborIndices(grid, index)
    .map(i => grid.cells[i])
    .filter(cell => cell.isAlive);
}
