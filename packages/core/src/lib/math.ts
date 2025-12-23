/**
 * Sigmoid (logistic) function.
 * @param x input value
 * @returns value in [0, 1]
 */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Clamp a value to the [min, max] range.
 * @param value input value
 * @param min minimum
 * @param max maximum
 * @returns clamped value
 */
export function clip(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
