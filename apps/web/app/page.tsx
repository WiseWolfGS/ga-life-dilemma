"use client";

import { useState } from "react";
import { ParamPanel } from "@/ui/components/ParamPanel";
import { SimCanvas } from "@/ui/components/SimCanvas";
import { useSimulation } from "@/ui/hooks/useSimulation";
import type { ViewMode, GeneDirection } from "@/ui/types";

export default function Home() {
  const { grid, params, setParams, stepForward } = useSimulation();
  const [viewMode, setViewMode] = useState<ViewMode>("life");
  const [geneDirection, setGeneDirection] = useState<GeneDirection>("avg");

  return (
    <main className="flex min-h-screen flex-col items-center bg-zinc-100 p-4 dark:bg-zinc-900 sm:p-8">
      <div className="w-full max-w-7xl space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            GA-Life
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            An Experiment in Emergence
          </p>
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
            />
          </div>

          <div className="order-1 flex w-full flex-col items-center gap-4 md:order-2">
            <SimCanvas grid={grid} viewMode={viewMode} geneDirection={geneDirection} />
            <button
              onClick={stepForward}
              className="w-32 rounded-md bg-zinc-800 px-4 py-2 text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              Next Step
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

