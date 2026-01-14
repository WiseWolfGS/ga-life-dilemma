import type { Grid, Gene, TerrainType } from "./types";
import { getNeighborIndices } from "./grid";

type TerrainStatBlock = {
  density: number;
  avgAge: number;
  geneEntropy: number;
  geneHistogram: GeneHistogram;
  clusterCount: number;
  avgClusterSize: number;
  largestClusterSize: number;
};

export type TerrainStats = TerrainStatBlock & {
  births: number;
  deaths: number;
};

export type SimStats = {
  density: number;
  births: number;
  deaths: number;
  avgAge: number;
  geneEntropy: number;
  geneHistogram: GeneHistogram;
  clusterCount: number;
  avgClusterSize: number;
  largestClusterSize: number;
  terrainBreakdown: Record<TerrainType, TerrainStats>;
};

type GridStats = Omit<SimStats, "births" | "deaths" | "terrainBreakdown"> & {
  terrainBreakdown: Record<TerrainType, TerrainStatBlock>;
};

const GENE_VALUES = [2, 4, 6, 8, 10] as const;
type GeneValue = typeof GENE_VALUES[number];
const TERRAIN_TYPES: TerrainType[] = ["normal", "double", "half"];

export type GeneHistogram = {
  overall: Record<GeneValue, number>;
  up: Record<GeneValue, number>;
  down: Record<GeneValue, number>;
  left: Record<GeneValue, number>;
  right: Record<GeneValue, number>;
};

type GridStats = Omit<SimStats, "births" | "deaths">;

const createValueCounter = (): Record<GeneValue, number> => ({
  2: 0,
  4: 0,
  6: 0,
  8: 0,
  10: 0,
});

const createGeneHistogram = (): GeneHistogram => ({
  overall: createValueCounter(),
  up: createValueCounter(),
  down: createValueCounter(),
  left: createValueCounter(),
  right: createValueCounter(),
});

const incrementCounter = (counter: Record<GeneValue, number>, value: number) => {
  if (counter[value as GeneValue] !== undefined) {
    counter[value as GeneValue] += 1;
  }
};

const computeShannonEntropy = (counter: Record<GeneValue, number>): number => {
  const total = GENE_VALUES.reduce((sum, value) => sum + counter[value], 0);
  if (total === 0) return 0;
  let entropy = 0;
  for (const value of GENE_VALUES) {
    const count = counter[value];
    if (count === 0) continue;
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return entropy;
};

const applyGeneToHistogram = (gene: Gene, histogram: GeneHistogram) => {
  const [u, d, l, r] = gene;
  incrementCounter(histogram.up, u);
  incrementCounter(histogram.down, d);
  incrementCounter(histogram.left, l);
  incrementCounter(histogram.right, r);
  incrementCounter(histogram.overall, u);
  incrementCounter(histogram.overall, d);
  incrementCounter(histogram.overall, l);
  incrementCounter(histogram.overall, r);
};

const computeClusterStats = (grid: Grid, isMember: (index: number) => boolean) => {
  const total = grid.cells.length;
  if (total === 0) {
    return { clusterCount: 0, avgClusterSize: 0, largestClusterSize: 0 };
  }

  const visited = new Array(total).fill(false);
  let clusterCount = 0;
  let totalClusterSize = 0;
  let largestClusterSize = 0;

  for (let i = 0; i < total; i++) {
    if (visited[i]) continue;
    if (!isMember(i)) continue;

    const stack = [i];
    visited[i] = true;
    let size = 0;

    while (stack.length) {
      const index = stack.pop() as number;
      size += 1;
      for (const neighbor of getNeighborIndices(grid, index)) {
        if (visited[neighbor]) continue;
        if (!isMember(neighbor)) continue;
        visited[neighbor] = true;
        stack.push(neighbor);
      }
    }

    clusterCount += 1;
    totalClusterSize += size;
    if (size > largestClusterSize) {
      largestClusterSize = size;
    }
  }

  return {
    clusterCount,
    avgClusterSize: clusterCount > 0 ? totalClusterSize / clusterCount : 0,
    largestClusterSize,
  };
};

const computeSubsetStats = (
  grid: Grid,
  isMember: (index: number) => boolean,
  totalForDensity: number
): TerrainStatBlock => {
  let aliveCount = 0;
  let ageSum = 0;
  const geneHistogram = createGeneHistogram();

  for (let i = 0; i < grid.cells.length; i++) {
    if (!isMember(i)) continue;
    const cell = grid.cells[i];
    aliveCount += 1;
    ageSum += cell.age;
    applyGeneToHistogram(cell.gene, geneHistogram);
  }

  const { clusterCount, avgClusterSize, largestClusterSize } = computeClusterStats(grid, isMember);

  return {
    density: totalForDensity > 0 ? aliveCount / totalForDensity : 0,
    avgAge: aliveCount > 0 ? ageSum / aliveCount : 0,
    geneEntropy: computeShannonEntropy(geneHistogram.overall),
    geneHistogram,
    clusterCount,
    avgClusterSize,
    largestClusterSize,
  };
};

const createEmptyTerrainStats = (): TerrainStatBlock => ({
  density: 0,
  avgAge: 0,
  geneEntropy: 0,
  geneHistogram: createGeneHistogram(),
  clusterCount: 0,
  avgClusterSize: 0,
  largestClusterSize: 0,
});

export function computeGridStats(grid: Grid): GridStats {
  const total = grid.cells.length;
  if (total === 0) {
    const emptyHistogram = createGeneHistogram();
    return {
      density: 0,
      avgAge: 0,
      geneEntropy: 0,
      geneHistogram: emptyHistogram,
      clusterCount: 0,
      avgClusterSize: 0,
      largestClusterSize: 0,
      terrainBreakdown: {
        normal: createEmptyTerrainStats(),
        double: createEmptyTerrainStats(),
        half: createEmptyTerrainStats(),
      },
    };
  }

  const terrainTotals: Record<TerrainType, number> = {
    normal: 0,
    double: 0,
    half: 0,
  };

  for (const terrainType of grid.terrain) {
    terrainTotals[terrainType] += 1;
  }

  const overallStats = computeSubsetStats(
    grid,
    (index) => grid.cells[index].isAlive,
    total
  );

  const terrainBreakdown = TERRAIN_TYPES.reduce(
    (acc, terrainType) => {
      const stats = computeSubsetStats(
        grid,
        (index) => grid.cells[index].isAlive && grid.terrain[index] === terrainType,
        terrainTotals[terrainType]
      );
      acc[terrainType] = stats;
      return acc;
    },
    {} as Record<TerrainType, TerrainStatBlock>
  );

  return {
    ...overallStats,
    terrainBreakdown,
  };
}
