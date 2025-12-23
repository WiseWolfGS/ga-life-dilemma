"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createGrid, step, DEFAULT_PARAMS, createRng } from "@ga-life/core";
import type { Grid, SimParams } from "@ga-life/core";

const SIM_WIDTH = 80;
const SIM_HEIGHT = 60;

type SavedState = { grid: Grid; params: SimParams; seed: number; rngState?: number };

export function useSimulation() {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [seed, setSeed] = useState<number>(() => Date.now());

  const rngRef = useRef(createRng(seed));

  const resetSimulation = useCallback(
    (nextSeed?: number) => {
      const seedToUse = typeof nextSeed === "number" ? nextSeed : seed;
      rngRef.current = createRng(seedToUse);
      setSeed(seedToUse);
      setGrid(createGrid(SIM_WIDTH, SIM_HEIGHT, 0.25, rngRef.current));
    },
    [seed]
  );

  const stepForward = useCallback(() => {
    setGrid((prevGrid) => {
      if (!prevGrid) return null;
      return step(prevGrid, params, rngRef.current);
    });
  }, [params]);

  const loadState = useCallback((newState: SavedState) => {
    setParams(newState.params);
    setSeed(newState.seed);
    rngRef.current = createRng(newState.seed);
    if (typeof newState.rngState === "number") {
      rngRef.current.setState(newState.rngState);
    }
    setGrid(newState.grid);
  }, []);

  useEffect(() => {
    resetSimulation(seed);
  }, []);

  const getRngState = useCallback(() => rngRef.current.getState(), []);

  return { grid, params, setParams, seed, setSeed, stepForward, resetSimulation, loadState, getRngState };
}
