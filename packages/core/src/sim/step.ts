import type { Grid, Cell } from "./types";
import type { SimParams } from "../config/schema";
import { hasAliveNeighbor } from "./grid";
import { calculateInfluence } from "./influence";
import { calculateSurvivalProbability, calculateBirthProbability } from "./prob";
import type { RngLike } from "../lib/rng";
import { runGeneticAlgorithm } from "./ga";
import type { SimStats } from "./stats";

type StepResult = { grid: Grid; stats: SimStats };

/**
 * Advance the simulation by one tick.
 * @param currentGrid - current grid state
 * @param params - simulation parameters
 * @returns next generation grid
 */
function advance(currentGrid: Grid, params: SimParams, rng: RngLike = Math.random): StepResult {
  // 1. Influence aggregation
  const influenceGrid = calculateInfluence(currentGrid);

  const nextCells: Cell[] = [];
  let births = 0;
  let deaths = 0;
  let aliveCount = 0;
  let ageSum = 0;

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
    if (currentCell.isAlive && !nextCell.isAlive) {
      deaths += 1;
    } else if (!currentCell.isAlive && nextCell.isAlive) {
      births += 1;
    }
    if (nextCell.isAlive) {
      aliveCount += 1;
      ageSum += nextCell.age;
    }

    nextCells.push(nextCell);
  }

  // 3. Synchronous commit
  const nextGrid = {
    ...currentGrid,
    cells: nextCells,
  };

  const totalCells = currentGrid.cells.length;
  return {
    grid: nextGrid,
    stats: {
      density: totalCells > 0 ? aliveCount / totalCells : 0,
      births,
      deaths,
      avgAge: aliveCount > 0 ? ageSum / aliveCount : 0,
    },
  };
}

export function step(currentGrid: Grid, params: SimParams, rng: RngLike = Math.random): Grid {
  return advance(currentGrid, params, rng).grid;
}

export function stepWithStats(
  currentGrid: Grid,
  params: SimParams,
  rng: RngLike = Math.random
): StepResult {
  return advance(currentGrid, params, rng);
}
