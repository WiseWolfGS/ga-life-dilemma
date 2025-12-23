"use client";

import { useState, useRef } from "react";
import { ParamPanel } from "@/ui/components/ParamPanel";
import { SimCanvas } from "@/ui/components/SimCanvas";
import { useSimulation } from "@/ui/hooks/useSimulation";
import type { ViewMode, GeneDirection } from "@/ui/types";
import type { Grid, SimParams } from "@ga-life/core";

export default function Home() {
  const { grid, params, setParams, stepForward, loadState } = useSimulation();
  const [viewMode, setViewMode] = useState<ViewMode>("life");
  const [geneDirection, setGeneDirection] = useState<GeneDirection>("avg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!grid) return;
    const state = { grid, params };
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ga-life-settings-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        const loadedState = JSON.parse(text) as { grid: Grid; params: SimParams };
        
        // Basic validation
        if (loadedState.grid && loadedState.params) {
          loadState(loadedState);
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
            <button onClick={stepForward} className="w-32 rounded-md bg-zinc-800 px-4 py-2 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300">
              Next Step
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

