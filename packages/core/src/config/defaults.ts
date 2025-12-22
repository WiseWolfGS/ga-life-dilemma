import type { SimParams } from "./schema";

/**
 * GA-Life 시뮬레이션의 기본 파라미터 값
 */
export const DEFAULT_PARAMS: SimParams = {
  alpha: 4,
  beta: -0.3,
  gamma: 1,
  mu: 27.0,
  nu: 34.5,
  delta: 0.2,
  epsilon: 0.003,
  p_mut: 0.02,
};
