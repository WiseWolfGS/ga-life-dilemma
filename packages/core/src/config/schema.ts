/**
 * Core simulation parameter set for GA-Life.
 */
export type SimParams = {
  /** Overall height of probability curves (global survival/birth scaling). */
  alpha: number;
  /** Curve sensitivity (slope). */
  beta: number;
  /** Right-side decay of the probability curve. */
  gamma: number;
  /** Optimal S_total that maximizes survival probability. */
  mu: number;
  /** Optimal S_total that maximizes birth probability. */
  nu: number;
  /** Base constant added to probabilities. */
  delta: number;
  /** Probabilities below this value are clamped to 0. */
  epsilon: number;
  /** Mutation probability for offspring gene. */
  p_mut: number;
};
