"use client";

import { useState, useEffect, useCallback } from "react";
import { createGrid, step, DEFAULT_PARAMS } from "@ga-life/core";
import type { Grid, SimParams } from "@ga-life/core";

const SIM_WIDTH = 80;
const SIM_HEIGHT = 60;

export function useSimulation() {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);

  // 시뮬레이션을 한 단계 진행하는 함수
  const stepForward = useCallback(() => {
    setGrid((prevGrid) => {
      if (!prevGrid) return null;
      // 현재 params 상태를 사용하여 step 함수 호출
      return step(prevGrid, params);
    });
  }, [params]);

  // 불러온 데이터로 시뮬레이션 상태를 완전히 교체하는 함수
  const loadState = useCallback((newState: { grid: Grid; params: SimParams }) => {
    setGrid(newState.grid);
    setParams(newState.params);
  }, []);

  // 초기 그리드 생성 (최초 1회만 실행)
  useEffect(() => {
    setGrid(createGrid(SIM_WIDTH, SIM_HEIGHT));
  }, []);

  return { grid, params, setParams, stepForward, loadState };
}
