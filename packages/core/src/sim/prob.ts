import type { SimParams } from "../config/schema";
import { sigmoid, clip } from "../lib/math";

/**
 * Compute survival probability (p_live) for a given S_total and parameters.
 * @param s_total total influence for the cell
 * @param params simulation parameters
 * @returns survival probability in [0, 1]
 */
export function calculateSurvivalProbability(s_total: number, params: SimParams): number {
  const { alpha, beta, gamma, mu, delta } = params;
  const term = beta * (s_total - mu);
  const sigma_term = sigmoid(term);

  const probability = Math.pow(alpha * sigma_term * (1 - sigma_term), gamma) + delta;

  return clip(probability, 0, 1);
}

/**
 * Compute birth probability (p_born) for a given S_total and parameters.
 * @param s_total total influence for the cell
 * @param params simulation parameters
 * @returns birth probability in [0, 1]
 */
export function calculateBirthProbability(s_total: number, params: SimParams): number {
  const { alpha, beta, gamma, nu, delta } = params;
  const term = beta * (s_total - nu);
  const sigma_term = sigmoid(term);

  const probability = Math.pow(alpha * sigma_term * (1 - sigma_term), gamma) + delta;

  return clip(probability, 0, 1);
}
