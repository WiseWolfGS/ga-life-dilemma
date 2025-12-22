import type { Grid, Cell, Gene } from "./types";

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
 * 지정된 크기와 초기 밀도에 따라 새로운 Grid를 생성합니다.
 *
 * @param width - 그리드의 너비
 * @param height - 그리드의 높이
 * @param initialDensity - 살아있는 세포의 초기 밀도 (기본값: 0.25)
 * @returns {Grid} 생성된 그리드 객체
 */
export function createGrid(width: number, height: number, initialDensity = 0.25): Grid {
  const cells: Cell[] = [];
  const totalCells = width * height;

  for (let i = 0; i < totalCells; i++) {
    const isAlive = Math.random() < initialDensity;
    cells.push({
      isAlive,
      gene: isAlive ? createRandomGene() : [0, 0, 0, 0], // 죽은 세포는 더미 유전자
      age: isAlive ? 1 : 0,
    });
  }

  return {
    width,
    height,
    cells,
  };
}
