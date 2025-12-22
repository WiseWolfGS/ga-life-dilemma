"use client";

import type { SimParams } from "@ga-life/core";
import React from "react";

interface ParamPanelProps {
  params: SimParams;
  setParams: React.Dispatch<React.SetStateAction<SimParams>>;
}

// 각 파라미터에 대한 입력 필드를 생성하는 헬퍼 컴포넌트
const ParamInput = ({
  name,
  value,
  min,
  max,
  step,
  onChange,
}: {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="grid grid-cols-3 items-center gap-2">
    <label htmlFor={name} className="text-sm text-zinc-600 dark:text-zinc-400">
      {name}
    </label>
    <input
      type="range"
      id={name}
      name={name}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="col-span-2 h-2 cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700"
    />
    <span className="col-start-3 justify-self-end text-sm font-mono text-zinc-800 dark:text-zinc-200">
      {value.toFixed(3)}
    </span>
  </div>
);

export function ParamPanel({ params, setParams }: ParamPanelProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prevParams) => ({
      ...prevParams,
      [name]: Number(value),
    }));
  };

  return (
    <div className="w-full max-w-xs space-y-4 rounded-lg border border-zinc-200 bg-white/50 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Parameters</h3>
      <ParamInput name="mu" value={params.mu} min={0} max={60} step={0.5} onChange={handleChange} />
      <ParamInput name="nu" value={params.nu} min={0} max={60} step={0.5} onChange={handleChange} />
      <ParamInput name="delta" value={params.delta} min={-0.2} max={0.2} step={0.005} onChange={handleChange} />
      <ParamInput name="alpha" value={params.alpha} min={0} max={10} step={0.1} onChange={handleChange} />
      <ParamInput name="beta" value={params.beta} min={-1} max={1} step={0.05} onChange={handleChange} />
    </div>
  );
}
