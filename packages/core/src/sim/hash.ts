import type { Grid, TerrainType } from "./types";

function terrainCode(terrain: TerrainType): number {
  switch (terrain) {
    case "double":
      return 1;
    case "half":
      return 2;
    case "normal":
    default:
      return 0;
  }
}

// FNV-1a 32-bit hash for deterministic grid comparison.
export function hashGrid(grid: Grid): string {
  let hash = 2166136261;
  const add = (value: number) => {
    hash ^= value;
    hash = Math.imul(hash, 16777619);
  };

  add(grid.width);
  add(grid.height);

  for (let i = 0; i < grid.cells.length; i++) {
    const cell = grid.cells[i];
    add(cell.isAlive ? 1 : 0);
    add(cell.age);
    add(cell.gene[0]);
    add(cell.gene[1]);
    add(cell.gene[2]);
    add(cell.gene[3]);
    add(terrainCode(grid.terrain[i]));
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}
