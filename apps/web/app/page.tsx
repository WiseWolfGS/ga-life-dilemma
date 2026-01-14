"use client";

import { useState, useRef, useEffect } from "react";
import { ParamPanel } from "@/ui/components/ParamPanel";
import { SimCanvas } from "@/ui/components/SimCanvas";
import { useSimulation } from "@/ui/hooks/useSimulation";
import type { ViewMode, GeneDirection } from "@/ui/types";
import type { Grid, SimParams, SimStats } from "@ga-life/core";

type SavedState = {
  schemaVersion?: number;
  grid: Grid;
  params: SimParams;
  seed: number;
  initialDensity?: number;
  rngState?: number;
  tick?: number;
};

const SCHEMA_VERSION = 1;
const STATS_SCHEMA_VERSION = 1;

type StatsHistoryState = {
  schemaVersion: number;
  seed: number;
  tick: number;
  params: SimParams;
  history: Array<{
    tick: number;
    density: number;
    avgAge: number;
    births: number;
    deaths: number;
    geneEntropy: number;
    geneHistogram: SimStats["geneHistogram"];
    clusterCount: number;
    avgClusterSize: number;
    largestClusterSize: number;
    terrainBreakdown: SimStats["terrainBreakdown"];
  }>;
};

const GENE_VALUES = new Set<number>([0, 2, 4, 6, 8, 10]);
const TERRAIN_VALUES = new Set<string>(["normal", "double", "half"]);
const PARAM_KEYS = ["alpha", "beta", "gamma", "mu", "nu", "delta", "epsilon", "p_mut"] as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPositiveInt = (value: unknown): value is number =>
  isFiniteNumber(value) && Number.isInteger(value) && value > 0;

const isSchemaVersion = (value: unknown): value is number =>
  isFiniteNumber(value) && Number.isInteger(value) && value > 0;

const isGeneStrict = (value: unknown): value is [number, number, number, number] =>
  Array.isArray(value) &&
  value.length === 4 &&
  value.every((v) => isFiniteNumber(v) && GENE_VALUES.has(v));

const isGeneLen4Finite = (value: unknown): value is [number, number, number, number] =>
  Array.isArray(value) &&
  value.length === 4 &&
  value.every((v) => isFiniteNumber(v));

const isCell = (value: unknown): value is Grid["cells"][number] => {
  if (!isObject(value)) return false;
  const { isAlive, gene, age } = value;
  if (typeof isAlive !== "boolean") return false;
  if (!isFiniteNumber(age) || age < 0) return false;
  return isAlive ? isGeneStrict(gene) : isGeneLen4Finite(gene);
};

const isTerrainArray = (value: unknown, length: number): value is Grid["terrain"] =>
  Array.isArray(value) &&
  value.length === length &&
  value.every((t) => typeof t === "string" && TERRAIN_VALUES.has(t));

const isGrid = (value: unknown): value is Grid => {
  if (!isObject(value)) return false;
  const { width, height, cells, terrain } = value;
  if (!isPositiveInt(width) || !isPositiveInt(height)) return false;
  if (!Array.isArray(cells)) return false;
  if (cells.length !== width * height) return false;
  if (!cells.every(isCell)) return false;
  return isTerrainArray(terrain, cells.length);
};

const isSimParams = (value: unknown): value is SimParams => {
  if (!isObject(value)) return false;
  return PARAM_KEYS.every((key) => isFiniteNumber(value[key]));
};

const normalizeGridForSave = (grid: Grid): Grid => {
  const nextCells = grid.cells.map((cell) =>
    cell.isAlive ? cell : { ...cell, gene: [0, 0, 0, 0] }
  );
  return { ...grid, cells: nextCells };
};

const isSavedState = (value: unknown): value is SavedState => {
  if (!isObject(value)) return false;
  const { schemaVersion, grid, params, seed, initialDensity, rngState, tick } = value;
  if (schemaVersion !== undefined) {
    if (!isSchemaVersion(schemaVersion)) return false;
    if (schemaVersion > SCHEMA_VERSION) return false;
  }
  if (!isGrid(grid) || !isSimParams(params)) return false;
  if (seed !== undefined && !isFiniteNumber(seed)) return false;
  if (initialDensity !== undefined && !isFiniteNumber(initialDensity)) return false;
  if (rngState !== undefined && !isFiniteNumber(rngState)) return false;
  if (tick !== undefined && (!isFiniteNumber(tick) || tick < 0)) return false;
  return true;
};

export default function Home() {
  const {
    grid,
    params,
    setParams,
    initialDensity,
    setInitialDensity,
    stepForward,
    loadState,
    seed,
    setSeed,
    resetSimulation,
    getRngState,
    stats,
    history,
    tick,
    isRunning,
    setIsRunning,
    speedMs,
    setSpeedMs,
  } = useSimulation();
  const [autoDownloadEnabled, setAutoDownloadEnabled] = useState<boolean>(false);
  const [autoDownloadEvery, setAutoDownloadEvery] = useState<number>(10);
  const [autoDownloadWarning, setAutoDownloadWarning] = useState<string | null>(null);
  const lastAutoDownloadTickRef = useRef<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("life");
  const [geneDirection, setGeneDirection] = useState<GeneDirection>("avg");
  const [historyVisibleCount, setHistoryVisibleCount] = useState<number>(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadState = (label?: string) => {
    if (!grid) return;
    try {
      const normalizedGrid = normalizeGridForSave(grid);
      const state: SavedState = {
        schemaVersion: SCHEMA_VERSION,
        grid: normalizedGrid,
        params,
        seed,
        initialDensity,
        rngState: getRngState(),
        tick,
      };
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const suffix = label ? `-${label}` : "";
      a.download = `ga-life-settings-${new Date().toISOString()}-t${tick}${suffix}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setAutoDownloadWarning(null);
    } catch (error) {
      console.warn("Auto download failed:", error);
      setAutoDownloadWarning("Auto download failed or was blocked by the browser.");
    }
  };

  const downloadStatsHistory = () => {
    if (!history.length) return;
    try {
      const statsState: StatsHistoryState = {
        schemaVersion: STATS_SCHEMA_VERSION,
        seed,
        tick,
        params,
        history: history.map((entry) => ({
          tick: entry.tick,
          density: entry.stats.density,
          avgAge: entry.stats.avgAge,
          births: entry.stats.births,
          deaths: entry.stats.deaths,
          geneEntropy: entry.stats.geneEntropy,
          geneHistogram: entry.stats.geneHistogram,
          clusterCount: entry.stats.clusterCount,
          avgClusterSize: entry.stats.avgClusterSize,
          largestClusterSize: entry.stats.largestClusterSize,
          terrainBreakdown: entry.stats.terrainBreakdown,
        })),
      };
      const blob = new Blob([JSON.stringify(statsState, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ga-life-stats-${new Date().toISOString()}-t${tick}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.warn("Stats download failed:", error);
      alert("Error: Failed to export stats. See console for details.");
    }
  };

  const handleSave = () => {
    downloadState("manual");
    setAutoDownloadWarning(null);
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== "string") throw new Error("File is not a valid text file.");
        const parsed = JSON.parse(text) as unknown;

        if (isSavedState(parsed)) {
          const nextSeed = typeof parsed.seed === "number" ? parsed.seed : Date.now();
          loadState({
            grid: parsed.grid,
            params: parsed.params,
            seed: nextSeed,
            initialDensity: parsed.initialDensity,
            rngState: parsed.rngState,
            tick: parsed.tick,
          });
        } else {
          alert("Error: Invalid file format.");
        }
      } catch (error) {
        console.error("Failed to load or parse file:", error);
        alert("Error: Failed to load file. See console for details.");
      }
    };
    reader.readAsText(file);

    // Reset file input to allow loading the same file again
    event.target.value = "";
  };

  useEffect(() => {
    if (!autoDownloadEnabled) return;
    if (!grid) return;
    if (autoDownloadEvery <= 0) return;
    if (tick === 0) return;
    if (tick % autoDownloadEvery !== 0) return;
    if (lastAutoDownloadTickRef.current === tick) return;

    if (navigator.userActivation && !navigator.userActivation.isActive) {
      setAutoDownloadWarning("Auto download may be blocked. Try clicking the page or use manual save.");
    }
    downloadState("auto");
    lastAutoDownloadTickRef.current = tick;
  }, [autoDownloadEnabled, autoDownloadEvery, tick, grid, params, seed, getRngState]);

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-100 p-4 dark:bg-zinc-900 sm:p-8">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: "none" }} />
      <div className="w-full max-w-7xl space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">GA-Life</h1>
          <p className="text-zinc-600 dark:text-zinc-400">An Experiment in Emergence</p>
        </div>

        <div className="flex flex-col items-start gap-6 md:flex-row">
          <div className="order-2 flex-shrink-0 md:order-1">
            <ParamPanel
              params={params}
              setParams={setParams}
              initialDensity={initialDensity}
              setInitialDensity={setInitialDensity}
              seed={seed}
              setSeed={setSeed}
              onReset={resetSimulation}
              viewMode={viewMode}
              setViewMode={setViewMode}
              geneDirection={geneDirection}
              setGeneDirection={setGeneDirection}
              onSave={handleSave}
              onLoadClick={handleLoadClick}
            />
          </div>

          <div className="order-1 flex w-full flex-col items-center gap-4 md:order-2">
            <SimCanvas grid={grid} viewMode={viewMode} geneDirection={geneDirection} />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={stepForward} className="w-32 rounded-md bg-zinc-800 px-4 py-2 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300">
                Next Step
              </button>
              <button
                onClick={() => setIsRunning((prev) => !prev)}
                className="w-32 rounded-md bg-zinc-200 px-4 py-2 text-zinc-800 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              >
                {isRunning ? "Pause" : "Run"}
              </button>
              <button
                onClick={() => setAutoDownloadEnabled((prev) => !prev)}
                className="w-32 rounded-md bg-zinc-200 px-4 py-2 text-zinc-800 transition-colors hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
              >
                {autoDownloadEnabled ? "Auto Download: On" : "Auto Download: Off"}
              </button>
            </div>
            <div className="w-full max-w-xl">
              <label className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
                <span>Speed (ms/tick)</span>
                <span className="font-mono">{speedMs}</span>
              </label>
              <input
                type="range"
                min={20}
                max={1000}
                step={20}
                value={speedMs}
                onChange={(event) => setSpeedMs(Number(event.target.value))}
                className="mt-2 w-full cursor-pointer"
              />
            </div>
            <div className="w-full max-w-xl">
              <label className="flex items-center justify-between text-sm text-zinc-700 dark:text-zinc-300">
                <span>Auto Download Every (ticks)</span>
                <span className="font-mono">{autoDownloadEvery}</span>
              </label>
              <input
                type="range"
                min={1}
                max={200}
                step={1}
                value={autoDownloadEvery}
                onChange={(event) => setAutoDownloadEvery(Number(event.target.value))}
                className="mt-2 w-full cursor-pointer"
              />
            </div>
            {autoDownloadWarning && (
              <div className="w-full max-w-xl rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                {autoDownloadWarning}
              </div>
            )}
            <div className="grid w-full max-w-xl grid-cols-2 gap-3 rounded-lg border border-zinc-200 bg-white/60 p-3 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
              <div className="flex items-center justify-between">
                <span>Generation</span>
                <span className="font-mono">{tick}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Density (rho)</span>
                <span className="font-mono">{stats ? stats.density.toFixed(4) : "0.0000"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Avg Age</span>
                <span className="font-mono">{stats ? stats.avgAge.toFixed(2) : "0.00"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Births</span>
                <span className="font-mono">{stats ? stats.births : 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Deaths</span>
                <span className="font-mono">{stats ? stats.deaths : 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Gene Entropy</span>
                <span className="font-mono">{stats ? stats.geneEntropy.toFixed(3) : "0.000"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Clusters</span>
                <span className="font-mono">{stats ? stats.clusterCount : 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Avg Cluster</span>
                <span className="font-mono">{stats ? stats.avgClusterSize.toFixed(2) : "0.00"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Largest Cluster</span>
                <span className="font-mono">{stats ? stats.largestClusterSize : 0}</span>
              </div>
            </div>
            <div className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white/60 p-3 text-xs text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Recent History</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={downloadStatsHistory}
                    disabled={!history.length}
                    className="rounded-md bg-zinc-200 px-2 py-1 text-xs text-zinc-800 hover:bg-zinc-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600"
                  >
                    Export Stats
                  </button>
                  <span className="text-xs">Rows</span>
                  <input
                    type="range"
                    min={5}
                    max={50}
                    step={5}
                    value={historyVisibleCount}
                    onChange={(event) => setHistoryVisibleCount(Number(event.target.value))}
                    className="w-28 cursor-pointer"
                  />
                  <span className="font-mono">{historyVisibleCount}</span>
                </div>
              </div>
              <div className="grid grid-cols-8 gap-2 border-b border-zinc-200 pb-1 font-semibold dark:border-zinc-800">
                <span>Tick</span>
                <span>Density</span>
                <span>Avg Age</span>
                <span>Entropy</span>
                <span>Clusters</span>
                <span>Avg Cl</span>
                <span>Max Cl</span>
                <span>Births</span>
                <span>Deaths</span>
              </div>
              <div className="mt-2 max-h-56 overflow-y-auto">
                {history
                  .slice(-historyVisibleCount)
                  .reverse()
                  .map((entry) => (
                    <div key={entry.tick} className="grid grid-cols-8 gap-2 py-1 font-mono">
                      <span>{entry.tick}</span>
                      <span>{entry.stats.density.toFixed(4)}</span>
                      <span>{entry.stats.avgAge.toFixed(2)}</span>
                      <span>{entry.stats.geneEntropy.toFixed(3)}</span>
                      <span>{entry.stats.clusterCount}</span>
                      <span>{entry.stats.avgClusterSize.toFixed(2)}</span>
                      <span>{entry.stats.largestClusterSize}</span>
                      <span>{entry.stats.births}</span>
                      <span>{entry.stats.deaths}</span>
                    </div>
                  ))}
                {history.length === 0 && (
                  <div className="py-2 text-center text-zinc-500">No history yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
