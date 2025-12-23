import type { SimParams } from "@ga-life/core";
import React from "react";
import type { ViewMode, GeneDirection } from "../types";

interface ParamPanelProps {
  params: SimParams;
  setParams: React.Dispatch<React.SetStateAction<SimParams>>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  geneDirection: GeneDirection;
  setGeneDirection: (direction: GeneDirection) => void;
}

const ParamInput = ({ name, value, min, max, step, onChange }: { name: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }) => (
  <div className="grid grid-cols-3 items-center gap-2">
    <label htmlFor={name} className="text-sm text-zinc-600 dark:text-zinc-400">{name}</label>
    <input type="range" id={name} name={name} min={min} max={max} step={step} value={value} onChange={onChange} className="col-span-2 h-2 cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700" />
    <span className="col-start-3 justify-self-end text-sm font-mono text-zinc-800 dark:text-zinc-200">{value.toFixed(3)}</span>
  </div>
);

const GeneDirectionSelector = ({ geneDirection, setGeneDirection }: { geneDirection: GeneDirection; setGeneDirection: (direction: GeneDirection) => void; }) => {
  const directions: { label: string; value: GeneDirection }[] = [
    { label: "Avg", value: "avg" },
    { label: "Up", value: "up" },
    { label: "Down", value: "down" },
    { label: "Left", value: "left" },
    { label: "Right", value: "right" },
  ];

  return (
    <div className="pl-6 pt-2">
      <div className="grid grid-cols-3 gap-2">
        {directions.map(({ label, value }) => (
          <label key={value} className="flex items-center gap-2 text-sm">
            <input type="radio" name="geneDirection" value={value} checked={geneDirection === value} onChange={() => setGeneDirection(value)} className="h-3 w-3" />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
};

const ViewModeSelector = ({ viewMode, setViewMode, geneDirection, setGeneDirection }: { viewMode: ViewMode; setViewMode: (mode: ViewMode) => void; geneDirection: GeneDirection; setGeneDirection: (direction: GeneDirection) => void; }) => (
  <div className="space-y-2">
    <h4 className="text-base font-medium text-zinc-900 dark:text-zinc-50">View Mode</h4>
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm">
        <input type="radio" name="viewMode" value="life" checked={viewMode === "life"} onChange={() => setViewMode("life")} className="h-4 w-4" />
        Life/Death
      </label>
      <div>
        <label className="flex items-center gap-2 text-sm">
          <input type="radio" name="viewMode" value="gene" checked={viewMode === "gene"} onChange={() => setViewMode("gene")} className="h-4 w-4" />
          Gene Map
        </label>
        {viewMode === "gene" && (
          <GeneDirectionSelector geneDirection={geneDirection} setGeneDirection={setGeneDirection} />
        )}
      </div>
    </div>
  </div>
);

export function ParamPanel({ params, setParams, viewMode, setViewMode, geneDirection, setGeneDirection }: ParamPanelProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prevParams) => ({ ...prevParams, [name]: Number(value) }));
  };

  return (
    <div className="w-full max-w-xs space-y-6 rounded-lg border border-zinc-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Parameters</h3>
        <div className="mt-4 space-y-4">
          <ParamInput name="mu" value={params.mu} min={0} max={60} step={0.5} onChange={handleChange} />
          <ParamInput name="nu" value={params.nu} min={0} max={60} step={0.5} onChange={handleChange} />
          <ParamInput name="delta" value={params.delta} min={-0.2} max={0.2} step={0.005} onChange={handleChange} />
          <ParamInput name="alpha" value={params.alpha} min={0} max={10} step={0.1} onChange={handleChange} />
          <ParamInput name="beta" value={params.beta} min={-1} max={1} step={0.05} onChange={handleChange} />
        </div>
      </div>
      <hr className="border-zinc-200 dark:border-zinc-700" />
      <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} geneDirection={geneDirection} setGeneDirection={setGeneDirection} />
    </div>
  );
}
