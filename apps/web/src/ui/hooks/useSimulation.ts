"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createGrid, stepWithStats, DEFAULT_PARAMS, createRng, computeGridStats } from "@ga-life/core";
import type { Grid, SimParams, SimStats } from "@ga-life/core";

const SIM_WIDTH = 80;
const SIM_HEIGHT = 60;

type SavedState = {
  grid: Grid;
  params: SimParams;
  seed: number;
  initialDensity?: number;
  rngState?: number;
  tick?: number;
};
type HistoryPoint = { tick: number; stats: SimStats };

export function useSimulation() {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [seed, setSeed] = useState<number>(() => Date.now());
  const [stats, setStats] = useState<SimStats | null>(null);
  const [tick, setTick] = useState<number>(0);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(200);
  const [initialDensity, setInitialDensity] = useState<number>(0.25);

  const rngRef = useRef(createRng(seed));

  const resetSimulation = useCallback(
    (nextSeed?: number) => {
      const seedToUse = typeof nextSeed === "number" ? nextSeed : seed;
      rngRef.current = createRng(seedToUse);
      setSeed(seedToUse);
      const nextGrid = createGrid(SIM_WIDTH, SIM_HEIGHT, initialDensity, rngRef.current);
      const baseStats = computeGridStats(nextGrid);
      const nextStats = { ...baseStats, births: 0, deaths: 0 };
      setStats(nextStats);
      setTick(0);
      setHistory([{ tick: 0, stats: nextStats }]);
      setGrid(nextGrid);
    },
    [seed, initialDensity]
  );

  const stepForward = useCallback(() => {
    if (!grid) return;
    const { grid: nextGrid, stats: nextStats } = stepWithStats(grid, params, rngRef.current);
    setGrid(nextGrid);
    setStats(nextStats);
    const nextTick = tick + 1;
    setTick(nextTick);
    setHistory((current) => [...current, { tick: nextTick, stats: nextStats }]);
  }, [grid, params, tick]);

  const normalizeLoadedGrid = (sourceGrid: Grid): Grid => {
    const nextCells = sourceGrid.cells.map((cell) =>
      cell.isAlive ? cell : { ...cell, gene: [0, 0, 0, 0] }
    );
    return { ...sourceGrid, cells: nextCells };
  };

  const loadState = useCallback((newState: SavedState) => {
    setParams(newState.params);
    setSeed(newState.seed);
    if (typeof newState.initialDensity === "number") {
      setInitialDensity(newState.initialDensity);
    }
    rngRef.current = createRng(newState.seed);
    if (typeof newState.rngState === "number") {
      rngRef.current.setState(newState.rngState);
    }
    const normalizedGrid = normalizeLoadedGrid(newState.grid);
    const baseStats = computeGridStats(normalizedGrid);
    const nextStats = { ...baseStats, births: 0, deaths: 0 };
    const nextTick = typeof newState.tick === "number" && newState.tick >= 0 ? newState.tick : 0;
    setStats(nextStats);
    setTick(nextTick);
    setHistory([{ tick: nextTick, stats: nextStats }]);
    setGrid(normalizedGrid);
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
    history,
    tick,
    isRunning,
    setIsRunning,
    speedMs,
    setSpeedMs,
    initialDensity,
    setInitialDensity,
  };
}
