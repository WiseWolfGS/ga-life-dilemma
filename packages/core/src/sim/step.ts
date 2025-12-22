import type { Grid, Cell, Gene } from "./types";
import type { SimParams } from "../config/schema";
import { hasAliveNeighbor } from "./grid";
import { calculateInfluence } from "./influence";
import { calculateSurvivalProbability, calculateBirthProbability } from "./prob";
import { createGrid } from "./init"; // For placeholder gene creation

// TODO: Replace with actual Genetic Algorithm implementation
function runGeneticAlgorithm(grid: Grid, index: number): Gene {
  // Placeholder: Create a random gene for now
  const randomGene = createGrid(1, 1).cells[0].gene;
  return randomGene;
}

/**
 * 시뮬레이션을 한 세대(tick) 진행합니다.
 * @param currentGrid - 현재 세대의 그리드
 * @param params - 시뮬레이션 파라미터
 * @returns 다음 세대의 새로운 그리드
 */
export function step(currentGrid: Grid, params: SimParams): Grid {
  // 1. 영향력 합산 (Influence Aggregation)
  const influenceGrid = calculateInfluence(currentGrid);

  const nextCells: Cell[] = [];

  // 2. 판정 및 자손 생성 (Judgment & Reproduction)
  for (let i = 0; i < currentGrid.cells.length; i++) {
    const currentCell = currentGrid.cells[i];
    const s_total = influenceGrid[i];

    let nextCell: Cell;

    if (currentCell.isAlive) {
      // Survival logic
      const p_live = calculateSurvivalProbability(s_total, params);
      if (Math.random() < p_live) {
        nextCell = { ...currentCell, age: currentCell.age + 1 };
      } else {
        nextCell = { isAlive: false, gene: [0, 0, 0, 0], age: 0 }; // Dies
      }
    } else {
      // Birth logic
      if (hasAliveNeighbor(currentGrid, i)) {
        const p_born = calculateBirthProbability(s_total, params);
        if (Math.random() < p_born) {
          // TODO: Implement parent selection, crossover, and mutation
          const childGene = runGeneticAlgorithm(currentGrid, i);
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

  // 3. 동기 커밋 (Synchronous Commit)
  return {
    ...currentGrid,
    cells: nextCells,
  };
}
