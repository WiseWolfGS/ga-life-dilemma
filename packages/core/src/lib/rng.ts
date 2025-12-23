export type RngLike = () => number;

export type Rng = RngLike & {
  getState: () => number;
  setState: (state: number) => void;
};

// Deterministic PRNG for reproducible simulations (mulberry32).
export function createRng(seed: number): Rng {
  const normalizedSeed = Number.isFinite(seed) ? seed : 0;
  let state = normalizedSeed >>> 0;

  const rng = (() => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }) as Rng;

  rng.getState = () => state >>> 0;
  rng.setState = (nextState: number) => {
    state = (Number.isFinite(nextState) ? nextState : 0) >>> 0;
  };

  return rng;
}
