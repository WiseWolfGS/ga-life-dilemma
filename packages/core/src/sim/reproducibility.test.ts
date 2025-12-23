import { describe, it, expect } from "vitest";
import { createGrid, step, DEFAULT_PARAMS, createRng, hashGrid } from "../index";

function runSimulation(seed: number, steps: number): string {
  const rng = createRng(seed);
  let grid = createGrid(10, 10, 0.25, rng);

  for (let i = 0; i < steps; i++) {
    grid = step(grid, DEFAULT_PARAMS, rng);
  }

  return hashGrid(grid);
}

describe("reproducibility", () => {
  it("produces identical results for the same seed", () => {
    const a = runSimulation(12345, 5);
    const b = runSimulation(12345, 5);
    expect(a).toBe(b);
  });

  it("produces different results for different seeds", () => {
    const a = runSimulation(1, 5);
    const b = runSimulation(2, 5);
    expect(a).not.toBe(b);
  });

  it("can resume RNG sequence from saved state", () => {
    const rng = createRng(999);
    const first = rng();
    const state = rng.getState();
    const second = rng();

    const resumed = createRng(0);
    resumed.setState(state);
    const resumedSecond = resumed();

    expect(resumedSecond).toBe(second);
    expect(first).not.toBe(second);
  });
});
