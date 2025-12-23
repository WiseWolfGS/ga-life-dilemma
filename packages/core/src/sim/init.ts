import type { Grid, Cell, Gene, TerrainType } from "./types";

const GENE_DOMAIN = [2, 4, 6, 8, 10];

/**
 * 무작위 유전자를 생성합니다.
 * @returns {Gene} [U, D, L, R] 형태의 유전자
 */
function createRandomGene(): Gene {
  const getRandomGeneValue = () => GENE_DOMAIN[Math.floor(Math.random() * GENE_DOMAIN.length)];
  return [
    getRandomGeneValue(),
    getRandomGeneValue(),
    getRandomGeneValue(),
    getRandomGeneValue(),
  ];
}

/**
 * 무작위 지형 타입을 생성합니다.
 * (90% normal, 5% double, 5% half)
 * @returns {TerrainType}
 */
function createRandomTerrain(): TerrainType {
  const rand = Math.random();
  if (rand < 0.05) {
    return "double";
  }
  if (rand < 0.1) {
    return "half";
  }
  return "normal";
}

/**
 * 지정된 크기와 초기 밀도에 따라 새로운 Grid를 생성합니다.
 *
 * @param width - 그리드의 너비
 * @param height - 그리드의 높이
 * @param initialDensity - 살아있는 세포의 초기 밀도 (기본값: 0.25)
 * @returns {Grid} 생성된 그리드 객체
 */
export function createGrid(width: number, height: number, initialDensity = 0.25): Grid {
  const cells: Cell[] = [];
  const terrain: TerrainType[] = [];
  const totalCells = width * height;

  for (let i = 0; i < totalCells; i++) {
    const isAlive = Math.random() < initialDensity;
    cells.push({
      isAlive,
      gene: isAlive ? createRandomGene() : [0, 0, 0, 0], // 죽은 세포는 더미 유전자
      age: isAlive ? 1 : 0,
    });
    terrain.push(createRandomTerrain());
  }

  return {
    width,
    height,
    cells,
    terrain,
  };
}
