import type { Grid, Cell } from "./types";
import type { SimParams } from "../config/schema";
import { hasAliveNeighbor } from "./grid";
import { calculateInfluence } from "./influence";
import { calculateSurvivalProbability, calculateBirthProbability } from "./prob";
import type { RngLike } from "../lib/rng";
import { runGeneticAlgorithm } from "./ga";
import { computeGridStats, type SimStats, type TerrainStats } from "./stats";
import type { TerrainType } from "./types";

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

  const terrainEvents: Record<TerrainType, { births: number; deaths: number }> = {
    normal: { births: 0, deaths: 0 },
    double: { births: 0, deaths: 0 },
    half: { births: 0, deaths: 0 },
  };

  // 2. Judgment & reproduction
  for (let i = 0; i < currentGrid.cells.length; i++) {
    const currentCell = currentGrid.cells[i];
    const s_total = influenceGrid[i];
    const terrainType = currentGrid.terrain[i];

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
      terrainEvents[terrainType].deaths += 1;
    } else if (!currentCell.isAlive && nextCell.isAlive) {
      births += 1;
      terrainEvents[terrainType].births += 1;
    }
    nextCells.push(nextCell);
  }

  // 3. Synchronous commit
  const nextGrid = {
    ...currentGrid,
    cells: nextCells,
  };

  const gridStats = computeGridStats(nextGrid);
  const terrainBreakdown = Object.keys(gridStats.terrainBreakdown).reduce((acc, key) => {
    const terrainKey = key as TerrainType;
    acc[terrainKey] = {
      ...gridStats.terrainBreakdown[terrainKey],
      births: terrainEvents[terrainKey].births,
      deaths: terrainEvents[terrainKey].deaths,
    };
    return acc;
  }, {} as Record<TerrainType, TerrainStats>);

  return {
    grid: nextGrid,
    stats: {
      ...gridStats,
      births,
      deaths,
      terrainBreakdown,
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
