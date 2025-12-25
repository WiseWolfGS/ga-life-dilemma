"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createGrid, stepWithStats, DEFAULT_PARAMS, createRng, computeGridStats } from "@ga-life/core";
import type { Grid, SimParams, SimStats } from "@ga-life/core";

const SIM_WIDTH = 80;
const SIM_HEIGHT = 60;

type SavedState = { grid: Grid; params: SimParams; seed: number; rngState?: number; tick?: number };

export function useSimulation() {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [seed, setSeed] = useState<number>(() => Date.now());
  const [stats, setStats] = useState<SimStats | null>(null);
  const [tick, setTick] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(200);

  const rngRef = useRef(createRng(seed));

  const resetSimulation = useCallback(
    (nextSeed?: number) => {
      const seedToUse = typeof nextSeed === "number" ? nextSeed : seed;
      rngRef.current = createRng(seedToUse);
      setSeed(seedToUse);
      const nextGrid = createGrid(SIM_WIDTH, SIM_HEIGHT, 0.25, rngRef.current);
      const baseStats = computeGridStats(nextGrid);
      setStats({ ...baseStats, births: 0, deaths: 0 });
      setTick(0);
      setGrid(nextGrid);
    },
    [seed]
  );

  const stepForward = useCallback(() => {
    if (!grid) return;
    const { grid: nextGrid, stats: nextStats } = stepWithStats(grid, params, rngRef.current);
    setGrid(nextGrid);
    setStats(nextStats);
    setTick((currentTick) => currentTick + 1);
  }, [grid, params]);

  const loadState = useCallback((newState: SavedState) => {
    setParams(newState.params);
    setSeed(newState.seed);
    rngRef.current = createRng(newState.seed);
    if (typeof newState.rngState === "number") {
      rngRef.current.setState(newState.rngState);
    }
    const baseStats = computeGridStats(newState.grid);
    setStats({ ...baseStats, births: 0, deaths: 0 });
    setTick(typeof newState.tick === "number" && newState.tick >= 0 ? newState.tick : 0);
    setGrid(newState.grid);
  }, []);

  useEffect(() => {
    resetSimulation(seed);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const intervalId = window.setInterval(() => {
      stepForward();
    }, speedMs);
    return () => window.clearInterval(intervalId);
  }, [isRunning, speedMs, stepForward]);

  const getRngState = useCallback(() => rngRef.current.getState(), []);

  return {
    grid,
    params,
    setParams,
    seed,
    setSeed,
    stepForward,
    resetSimulation,
    loadState,
    getRngState,
    stats,
    tick,
    isRunning,
    setIsRunning,
    speedMs,
    setSpeedMs,
  };
}
