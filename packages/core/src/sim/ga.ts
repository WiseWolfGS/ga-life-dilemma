import type { Cell, Gene, Grid } from "./types";
import type { SimParams } from "../config/schema";
import { getNeighborIndices } from "./grid";
import type { RngLike } from "../lib/rng";
import { calculateSurvivalProbability } from "./prob";

const GENE_DOMAIN = [2, 4, 6, 8, 10];
const getRandomGeneValue = (rng: RngLike) =>
  GENE_DOMAIN[Math.floor(rng() * GENE_DOMAIN.length)];

/**
 * Select a parent using roulette-wheel selection.
 * @param candidates - parent candidate cells
 * @param fitnesses - fitness values for candidates
 * @param rng - random generator
 * @returns chosen parent cell
 */
function selectOneParent(candidates: Cell[], fitnesses: number[], rng: RngLike): Cell {
  const totalFitness = fitnesses.reduce((sum, f) => sum + f, 0);
  if (totalFitness === 0) {
    // Fallback to uniform selection when all fitness values are 0.
    return candidates[Math.floor(rng() * candidates.length)];
  }

  let randomPoint = rng() * totalFitness;
  for (let i = 0; i < candidates.length; i++) {
    randomPoint -= fitnesses[i];
    if (randomPoint <= 0) {
      return candidates[i];
    }
  }
  // Numerical edge case: return last candidate.
  return candidates[candidates.length - 1];
}

/**
 * Uniform crossover between two parents.
 * @param parentA - parent A gene
 * @param parentB - parent B gene
 * @param rng - random generator
 * @returns child gene
 */
function crossover(parentA: Gene, parentB: Gene, rng: RngLike): Gene {
  const childGene: Gene = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    childGene[i] = rng() < 0.5 ? parentA[i] : parentB[i];
  }
  return childGene;
}

/**
 * Per-locus mutation.
 * @param gene - gene after crossover
 * @param p_mut - mutation probability per locus
 * @param rng - random generator
 * @returns mutated gene
 */
function mutate(gene: Gene, p_mut: number, rng: RngLike): Gene {
  const mutatedGene = gene.slice() as Gene;
  for (let i = 0; i < 4; i++) {
    if (rng() < p_mut) {
      mutatedGene[i] = getRandomGeneValue(rng);
    }
  }
  return mutatedGene;
}

/**
 * Genetic algorithm applied when a new cell is born.
 * @param grid - current grid
 * @param influenceGrid - precomputed influence grid
 * @param index - target index where the cell is born
 * @param params - simulation parameters
 * @param rng - random generator
 * @returns child gene
 */
export function runGeneticAlgorithm(
  grid: Grid,
  influenceGrid: number[],
  index: number,
  params: SimParams,
  rng: RngLike = Math.random
): Gene {
  // 1. Select alive neighbors as parent candidates.
  const neighborIndices = getNeighborIndices(grid, index);
  const parentIndices = neighborIndices.filter(i => grid.cells[i].isAlive);
  const parentCandidates = parentIndices.map(i => grid.cells[i]);

  if (parentCandidates.length === 0) {
    // No parents available: generate a random gene.
    return [
      getRandomGeneValue(rng),
      getRandomGeneValue(rng),
      getRandomGeneValue(rng),
      getRandomGeneValue(rng),
    ];
  }

  // 2. Fitness calculation using survival probability.
  const fitnesses = parentIndices.map(i =>
    calculateSurvivalProbability(influenceGrid[i], params)
  );

  // 3. Parent selection (roulette-wheel).
  const parentA = selectOneParent(parentCandidates, fitnesses, rng);
  const parentB = selectOneParent(parentCandidates, fitnesses, rng);

  // 4. Crossover (uniform).
  const childGene = crossover(parentA.gene, parentB.gene, rng);

  // 5. Mutation (per locus).
  const finalGene = mutate(childGene, params.p_mut, rng);

  return finalGene;
}
