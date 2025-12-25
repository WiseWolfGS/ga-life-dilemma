"use client";

import { useState, useRef, useEffect } from "react";
import { ParamPanel } from "@/ui/components/ParamPanel";
import { SimCanvas } from "@/ui/components/SimCanvas";
import { useSimulation } from "@/ui/hooks/useSimulation";
import type { ViewMode, GeneDirection } from "@/ui/types";
import type { Grid, SimParams } from "@ga-life/core";

type SavedState = { grid: Grid; params: SimParams; seed: number; rngState?: number; tick?: number };

const GENE_VALUES = new Set<number>([0, 2, 4, 6, 8, 10]);
const TERRAIN_VALUES = new Set<string>(["normal", "double", "half"]);
const PARAM_KEYS = ["alpha", "beta", "gamma", "mu", "nu", "delta", "epsilon", "p_mut"] as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isPositiveInt = (value: unknown): value is number =>
  isFiniteNumber(value) && Number.isInteger(value) && value > 0;

const isGene = (value: unknown): value is [number, number, number, number] =>
  Array.isArray(value) &&
  value.length === 4 &&
  value.every((v) => isFiniteNumber(v) && GENE_VALUES.has(v));

const isCell = (value: unknown): value is Grid["cells"][number] => {
  if (!isObject(value)) return false;
  const { isAlive, gene, age } = value;
  return typeof isAlive === "boolean" && isGene(gene) && isFiniteNumber(age) && age >= 0;
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

const isSavedState = (value: unknown): value is SavedState => {
  if (!isObject(value)) return false;
  const { grid, params, seed, rngState, tick } = value;
  if (!isGrid(grid) || !isSimParams(params)) return false;
  if (seed !== undefined && !isFiniteNumber(seed)) return false;
  if (rngState !== undefined && !isFiniteNumber(rngState)) return false;
  if (tick !== undefined && (!isFiniteNumber(tick) || tick < 0)) return false;
  return true;
};

export default function Home() {
  const {
    grid,
    params,
    setParams,
    stepForward,
    loadState,
    seed,
    setSeed,
    resetSimulation,
    getRngState,
    stats,
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadState = (label?: string) => {
    if (!grid) return;
    try {
      const state: SavedState = { grid, params, seed, rngState: getRngState(), tick };
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
              seed={seed}
              setSeed={setSeed}
              onReset={() => resetSimulation(seed)}
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
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
