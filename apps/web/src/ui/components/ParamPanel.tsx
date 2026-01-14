import type { SimParams } from "@ga-life/core";
import React, { useEffect, useState } from "react";
import type { ViewMode, GeneDirection } from "../types";

interface ParamPanelProps {
  params: SimParams;
  setParams: React.Dispatch<React.SetStateAction<SimParams>>;
  initialDensity: number;
  setInitialDensity: (density: number) => void;
  seed: number;
  setSeed: (seed: number) => void;
  onReset: (seed: number) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  geneDirection: GeneDirection;
  setGeneDirection: (direction: GeneDirection) => void;
  onSave: () => void;
  onLoadClick: () => void;
}

const ParamInput = ({ name, value, min, max, step, onChange }: { name: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => (
  <div className="grid grid-cols-3 items-center gap-2">
    <label htmlFor={name} className="text-sm text-zinc-600 dark:text-zinc-400">{name}</label>
    <input type="range" id={name} name={name} min={min} max={max} step={step} value={value} onChange={onChange} className="col-span-2 h-2 cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700" />
    <span className="col-start-3 justify-self-end text-sm font-mono text-zinc-800 dark:text-zinc-200">{value.toFixed(3)}</span>
  </div>
);

const DensityInput = ({ value, onChange }: { value: number; onChange: (value: number) => void; }) => (
  <div className="grid grid-cols-3 items-center gap-2">
    <label className="text-sm text-zinc-600 dark:text-zinc-400">initDensity</label>
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="col-span-2 h-2 cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700"
    />
    <span className="col-start-3 justify-self-end text-sm font-mono text-zinc-800 dark:text-zinc-200">{value.toFixed(2)}</span>
  </div>
);

const SeedControl = ({ seed, setSeed, onReset }: { seed: number; setSeed: (seed: number) => void; onReset: (seed: number) => void; }) => {
  const [draftSeed, setDraftSeed] = useState<number>(seed);

  useEffect(() => {
    setDraftSeed(seed);
  }, [seed]);

  const applySeed = () => {
    setSeed(draftSeed);
    onReset(draftSeed);
  };

  return (
    <div className="space-y-2">
      <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-50">Seed</h4>
      <div className="flex gap-2">
        <input
          type="number"
          value={draftSeed}
          onChange={(e) => {
            const nextSeed = Number(e.target.value);
            if (Number.isFinite(nextSeed)) {
              setDraftSeed(nextSeed);
            }
          }}
          className="w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm text-zinc-900 shadow-sm outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <button onClick={applySeed} className="rounded-md bg-zinc-200 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600">
          Apply
        </button>
      </div>
    </div>
  );
};

const GeneDirectionSelector = ({ geneDirection, setGeneDirection }: { geneDirection: GeneDirection; setGeneDirection: (direction: GeneDirection) => void; }) => {
  const directions: { label: string; value: GeneDirection }[] = [
    { label: "Avg", value: "avg" }, { label: "Up", value: "up" }, { label: "Down", value: "down" }, { label: "Left", value: "left" }, { label: "Right", value: "right" },
  ];
  return (
    <div className="pl-6 pt-2"><div className="grid grid-cols-3 gap-2">
        {directions.map(({ label, value }) => (
          <label key={value} className="flex items-center gap-2 text-sm">
            <input type="radio" name="geneDirection" value={value} checked={geneDirection === value} onChange={() => setGeneDirection(value)} className="h-3 w-3" />
            {label}
          </label>
        ))}
    </div></div>
  );
};

const ViewModeSelector = ({ viewMode, setViewMode, geneDirection, setGeneDirection }: { viewMode: ViewMode; setViewMode: (mode: ViewMode) => void; geneDirection: GeneDirection; setGeneDirection: (direction: GeneDirection) => void; }) => (
  <div className="space-y-2">
    <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-50">View Mode</h4>
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm"><input type="radio" name="viewMode" value="life" checked={viewMode === "life"} onChange={() => setViewMode("life")} className="h-4 w-4" />Life/Death</label>
      <div>
        <label className="flex items-center gap-2 text-sm"><input type="radio" name="viewMode" value="gene" checked={viewMode === "gene"} onChange={() => setViewMode("gene")} className="h-4 w-4" />Gene Map</label>
        {viewMode === "gene" && (<GeneDirectionSelector geneDirection={geneDirection} setGeneDirection={setGeneDirection} />)}
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="radio" name="viewMode" value="terrain" checked={viewMode === "terrain"} onChange={() => setViewMode("terrain")} className="h-4 w-4" />Terrain Map</label>
    </div>
  </div>
);

const FileIO = ({ onSave, onLoadClick }: { onSave: () => void; onLoadClick: () => void; }) => (
    <div className="space-y-2">
        <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-50">Save / Load</h4>
        <div className="flex gap-2">
            <button onClick={onSave} className="flex-1 rounded-md bg-zinc-200 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600">Save</button>
            <button onClick={onLoadClick} className="flex-1 rounded-md bg-zinc-200 px-3 py-1.5 text-sm text-zinc-800 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-600">Load</button>
        </div>
    </div>
);

export function ParamPanel({ params, setParams, initialDensity, setInitialDensity, seed, setSeed, onReset, viewMode, setViewMode, geneDirection, setGeneDirection, onSave, onLoadClick }: ParamPanelProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prevParams) => ({ ...prevParams, [name]: Number(value) }));
  };

  return (
    <div className="w-full max-w-xs space-y-6 rounded-lg border border-zinc-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Parameters</h3>
        <div className="mt-4 space-y-4">
          <DensityInput value={initialDensity} onChange={setInitialDensity} />
          <ParamInput name="mu" value={params.mu} min={0} max={60} step={0.5} onChange={handleChange} />
          <ParamInput name="nu" value={params.nu} min={0} max={60} step={0.5} onChange={handleChange} />
          <ParamInput name="delta" value={params.delta} min={-0.2} max={0.2} step={0.005} onChange={handleChange} />
          <ParamInput name="alpha" value={params.alpha} min={0} max={10} step={0.1} onChange={handleChange} />
          <ParamInput name="beta" value={params.beta} min={-1} max={1} step={0.05} onChange={handleChange} />
        </div>
      </div>
      <hr className="border-zinc-200 dark:border-zinc-700" />
      <SeedControl seed={seed} setSeed={setSeed} onReset={onReset} />
      <hr className="border-zinc-200 dark:border-zinc-700" />
      <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} geneDirection={geneDirection} setGeneDirection={setGeneDirection} />
      <hr className="border-zinc-200 dark:border-zinc-700" />
      <FileIO onSave={onSave} onLoadClick={onLoadClick} />
    </div>
  );
}
