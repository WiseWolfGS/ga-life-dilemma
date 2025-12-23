import type { Grid, Cell } from "./types";
import type { SimParams } from "../config/schema";
import { hasAliveNeighbor } from "./grid";
import { calculateInfluence } from "./influence";
import { calculateSurvivalProbability, calculateBirthProbability } from "./prob";
import type { RngLike } from "../lib/rng";
import { runGeneticAlgorithm } from "./ga";

/**
 * Advance the simulation by one tick.
 * @param currentGrid - current grid state
 * @param params - simulation parameters
 * @returns next generation grid
 */
export function step(currentGrid: Grid, params: SimParams, rng: RngLike = Math.random): Grid {
  // 1. Influence aggregation
  const influenceGrid = calculateInfluence(currentGrid);

  const nextCells: Cell[] = [];

  // 2. Judgment & reproduction
  for (let i = 0; i < currentGrid.cells.length; i++) {
    const currentCell = currentGrid.cells[i];
    const s_total = influenceGrid[i];

    let nextCell: Cell;

    if (currentCell.isAlive) {
      // Survival logic
      let p_live = calculateSurvivalProbability(s_total, params);
      if (p_live < params.epsilon) {
        p_live = 0;
      }

      if (rng() < p_live) {
        nextCell = { ...currentCell, age: currentCell.age + 1 };
      } else {
        nextCell = { isAlive: false, gene: [0, 0, 0, 0], age: 0 }; // Dies
      }
    } else {
      // Birth logic
      if (hasAliveNeighbor(currentGrid, i)) {
        let p_born = calculateBirthProbability(s_total, params);
        if (p_born < params.epsilon) {
          p_born = 0;
        }

        if (rng() < p_born) {
          // Run genetic algorithm for newborn cell.
          const childGene = runGeneticAlgorithm(currentGrid, influenceGrid, i, params, rng);
          nextCell = { isAlive: true, gene: childGene, age: 1 }; // Born
        } else {
          nextCell = { ...currentCell }; // Stays dead
        }
      } else {
        nextCell = { ...currentCell }; // Stays dead
      }
    }
    nextCells.push(nextCell);
  }

  // 3. Synchronous commit
  return {
    ...currentGrid,
    cells: nextCells,
  };
}
