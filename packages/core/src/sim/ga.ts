import type { Cell, Gene, Grid } from "./types";
import type { SimParams } from "../config/schema";
import { getNeighbors, getNeighborIndices } from "./grid";
import { calculateSurvivalProbability } from "./prob";

const GENE_DOMAIN = [2, 4, 6, 8, 10];
const getRandomGeneValue = () => GENE_DOMAIN[Math.floor(Math.random() * GENE_DOMAIN.length)];

/**
 * 적합도 비례 선택(룰렛 휠 선택)을 사용하여 부모 후보 중에서 하나를 선택합니다.
 * @param candidates - 부모 후보가 될 세포 배열
 * @param fitnesses - 각 후보의 적합도(생존 확률) 배열
 * @returns 선택된 부모 세포
 */
function selectOneParent(candidates: Cell[], fitnesses: number[]): Cell {
  const totalFitness = fitnesses.reduce((sum, f) => sum + f, 0);
  if (totalFitness === 0) {
    // 모든 후보의 적합도가 0이면, 무작위로 하나를 선택합니다.
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  let randomPoint = Math.random() * totalFitness;
  for (let i = 0; i < candidates.length; i++) {
    randomPoint -= fitnesses[i];
    if (randomPoint <= 0) {
      return candidates[i];
    }
  }
  // 반올림 오류 등으로 루프가 끝날 경우 마지막 후보를 반환합니다.
  return candidates[candidates.length - 1];
}

/**
 * 균등 교차(Uniform Crossover)를 수행합니다.
 * @param parentA - 부모 A의 유전자
 * @param parentB - 부모 B의 유전자
 * @returns 새로운 자식 유전자
 */
function crossover(parentA: Gene, parentB: Gene): Gene {
  const childGene: Gene = [0, 0, 0, 0];
  for (let i = 0; i < 4; i++) {
    childGene[i] = Math.random() < 0.5 ? parentA[i] : parentB[i];
  }
  return childGene;
}

/**
 * 부분 변이(Per-locus mutation)를 수행합니다.
 * @param gene - 교차를 거친 유전자
 * @param p_mut - 각 좌위의 변이 확률
 * @returns 최종 자식 유전자
 */
function mutate(gene: Gene, p_mut: number): Gene {
  const mutatedGene = gene.slice() as Gene;
  for (let i = 0; i < 4; i++) {
    if (Math.random() < p_mut) {
      mutatedGene[i] = getRandomGeneValue();
    }
  }
  return mutatedGene;
}

/**
 * 새로운 세포가 태어날 때 호출되는 유전 알고리즘 파이프라인입니다.
 * @param grid - 현재 세대 그리드
 * @param influenceGrid - 계산된 영향력 그리드
 * @param index - 세포가 태어날 위치의 인덱스
 * @param params - 시뮬레이션 파라미터
 * @returns 자손의 유전자
 */
export function runGeneticAlgorithm(
  grid: Grid,
  influenceGrid: number[],
  index: number,
  params: SimParams
): Gene {
  // 1. 부모 후보 선정 (8방향 이웃)
  const parentCandidates = getNeighbors(grid, index);
  const parentIndices = getNeighborIndices(grid, index);

  if (parentCandidates.length === 0) {
    // 주변에 부모가 없으면 무작위 유전자 생성 (예외 케이스)
    return [getRandomGeneValue(), getRandomGeneValue(), getRandomGeneValue(), getRandomGeneValue()];
  }

  // 2. 적합도 계산 (각 후보의 생존 확률)
  const fitnesses = parentIndices.map(i =>
    calculateSurvivalProbability(influenceGrid[i], params)
  );

  // 3. 부모 선택 (룰렛 휠 선택으로 2명)
  const parentA = selectOneParent(parentCandidates, fitnesses);
  const parentB = selectOneParent(parentCandidates, fitnesses);

  // 4. 교차 (균등 교차)
  const childGene = crossover(parentA.gene, parentB.gene);

  // 5. 변이 (부분 변이)
  const finalGene = mutate(childGene, params.p_mut);

  return finalGene;
}
