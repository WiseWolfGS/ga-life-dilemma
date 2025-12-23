import type { Grid } from "./types";
import { DIRECTIONS, getNeighborIndex } from "./grid";

/**
 * Calculate total influence (S_total) received by each cell.
 * @param grid - current generation grid
 * @returns array of total influence values per cell
 */
export function calculateInfluence(grid: Grid): number[] {
  const { width, height, cells, terrain } = grid;
  const influenceGrid: number[] = new Array(width * height).fill(0);

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    if (!cell.isAlive) {
      continue;
    }

    // 1. Determine terrain-based multiplier for this cell.
    const terrainType = terrain[i];
    let multiplier = 1;
    if (terrainType === "double") {
      multiplier = 2;
    } else if (terrainType === "half") {
      multiplier = 0.5;
    }

    // 2. Base influence derived from the gene.
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

    // 3. Propagate influence to 8 neighbors with terrain multiplier applied.
    for (const key in DIRECTIONS) {
      const directionKey = key as keyof typeof DIRECTIONS;
      const [dx, dy] = DIRECTIONS[directionKey];
      const neighborIndex = getNeighborIndex(i, dx, dy, width, height);
      
      const finalInfluence = influences[directionKey] * multiplier;
      influenceGrid[neighborIndex] += finalInfluence;
    }
  }

  // Apply rounding to final S_total values.
  return influenceGrid.map(s_total => Math.round(s_total * 10) / 10);
}
