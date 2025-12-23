/**
 * Form gene for influence strengths.
 * [Up, Down, Left, Right] values, constrained to {2, 4, 6, 8, 10}.
 */
export type Gene = [number, number, number, number];

/**
 * Terrain type for a cell.
 * - normal: default terrain
 * - double: influence x2
 * - half: influence x0.5
 */
export type TerrainType = "normal" | "double" | "half";

/**
 * Core simulation unit: a cell.
 */
export type Cell = {
  isAlive: boolean;
  gene: Gene;
  age: number;
};

/**
 * Simulation grid container.
 */
export type Grid = {
  width: number;
  height: number;
  cells: Cell[];
  terrain: TerrainType[];
};
