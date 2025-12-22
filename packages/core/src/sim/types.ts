/**
 * 형태 유전자(Form Gene)
 * [Up, Down, Left, Right] 영향력을 나타냅니다.
 * 값의 도메인은 {2, 4, 6, 8, 10}으로 강제됩니다.
 */
export type Gene = [number, number, number, number];

/**
 * 시뮬레이션의 기본 단위인 세포(Cell)
 */
export type Cell = {
  isAlive: boolean;
  gene: Gene;
  age: number;
};

/**
 * 시뮬레이션 공간을 나타내는 격자(Grid)
 */
export type Grid = {
  width: number;
  height: number;
  cells: Cell[];
};
