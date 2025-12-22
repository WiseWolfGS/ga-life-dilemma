import type { SimParams } from "../config/schema";
import { sigmoid, clip } from "../lib/math";

/**
 * 특정 S_total 값과 파라미터에 대한 생존 확률(p_live)을 계산합니다.
 * @param s_total 해당 칸의 총 영향력
 * @param params 시뮬레이션 파라미터
 * @returns 생존 확률 (0과 1 사이의 값)
 */
export function calculateSurvivalProbability(s_total: number, params: SimParams): number {
  const { alpha, beta, gamma, mu, delta } = params;
  const term = beta * (s_total - mu);
  const sigma_term = sigmoid(term);

  const probability = alpha * sigma_term * Math.pow(1 - sigma_term, gamma) + delta;

  return clip(probability, 0, 1);
}

/**
 * 특정 S_total 값과 파라미터에 대한 탄생 확률(p_born)을 계산합니다.
 * @param s_total 해당 칸의 총 영향력
 * @param params 시뮬레이션 파라미터
 * @returns 탄생 확률 (0과 1 사이의 값)
 */
export function calculateBirthProbability(s_total: number, params: SimParams): number {
  const { alpha, beta, gamma, nu, delta } = params;
  const term = beta * (s_total - nu);
  const sigma_term = sigmoid(term);

  const probability = alpha * sigma_term * Math.pow(1 - sigma_term, gamma) + delta;

  return clip(probability, 0, 1);
}
