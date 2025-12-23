import type { Grid, Cell, Gene, TerrainType } from "./types";
import type { RngLike } from "../lib/rng";

const GENE_DOMAIN = [2, 4, 6, 8, 10];

/**
 * Create a random form gene.
 */
function createRandomGene(rng: RngLike): Gene {
  const getRandomGeneValue = () => GENE_DOMAIN[Math.floor(rng() * GENE_DOMAIN.length)];
  return [
    getRandomGeneValue(),
    getRandomGeneValue(),
    getRandomGeneValue(),
    getRandomGeneValue(),
  ];
}

/**
 * Create a random terrain type.
 * (90% normal, 5% double, 5% half)
 */
function createRandomTerrain(rng: RngLike): TerrainType {
  const rand = rng();
  if (rand < 0.05) {
    return "double";
  }
  if (rand < 0.1) {
    return "half";
  }
  return "normal";
}

/**
 * Initialize a grid with random cells and terrain.
 * @param width - grid width
 * @param height - grid height
 * @param initialDensity - initial alive density (default 0.25)
 * @param rng - random generator
 */
export function createGrid(
  width: number,
  height: number,
  initialDensity = 0.25,
  rng: RngLike = Math.random
): Grid {
  const cells: Cell[] = [];
  const terrain: TerrainType[] = [];
  const totalCells = width * height;

  for (let i = 0; i < totalCells; i++) {
    const isAlive = rng() < initialDensity;
    cells.push({
      isAlive,
      gene: isAlive ? createRandomGene(rng) : [0, 0, 0, 0], // Dead cells use a zero gene.
      age: isAlive ? 1 : 0,
    });
    terrain.push(createRandomTerrain(rng));
  }

  return {
    width,
    height,
    cells,
    terrain,
  };
}
