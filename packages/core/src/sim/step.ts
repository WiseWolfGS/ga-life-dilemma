import type { Grid, Cell } from "./types";
import type { SimParams } from "../config/schema";
import { hasAliveNeighbor } from "./grid";
import { calculateInfluence } from "./influence";
import { calculateSurvivalProbability, calculateBirthProbability } from "./prob";
import { runGeneticAlgorithm } from "./ga";

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
      let p_live = calculateSurvivalProbability(s_total, params);
      if (p_live < params.epsilon) {
        p_live = 0;
      }

      if (Math.random() < p_live) {
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

        if (Math.random() < p_born) {
          // 유전 알고리즘 실행
          const childGene = runGeneticAlgorithm(currentGrid, influenceGrid, i, params);
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
