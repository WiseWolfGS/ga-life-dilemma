import type { SimParams } from "./schema";

/**
 * Default parameter values for GA-Life.
 */
export const DEFAULT_PARAMS: SimParams = {
  alpha: 4,
  beta: -0.15,
  gamma: 1,
  mu: 20.0,
  nu: 27.5,
  delta: -0.07,
  epsilon: 0.03,
  p_mut: 0.02,
};
