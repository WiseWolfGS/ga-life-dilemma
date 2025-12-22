/**
 * 시그모이드 함수 (로지스틱 함수)
 * @param x 입력 값
 * @returns 0과 1 사이의 값
 */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * 값을 특정 범위 [min, max] 사이로 제한합니다.
 * @param value 대상 값
 * @param min 최솟값
 * @param max 최댓값
 * @returns 제한된 값
 */
export function clip(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
