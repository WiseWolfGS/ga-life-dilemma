"use client";

import { useEffect, useRef } from "react";
import type { Grid, Gene } from "@ga-life/core";
import type { ViewMode, GeneDirection } from "../types";

interface SimCanvasProps {
  grid: Grid | null;
  viewMode: ViewMode;
  geneDirection: GeneDirection;
}

const CELL_SIZE = 10; // 각 셀의 크기 (픽셀)
const GRID_COLOR = "#CCCCCC";
const ALIVE_COLOR = "#000000";
const DEAD_COLOR = "#FFFFFF";

/**
 * 주어진 값(2 ~ 10 범위)을 연속적인 HSL 색상으로 변환합니다.
 * 2는 파란색(hue 240), 10은 빨간색(hue 0)에 매핑됩니다.
 * @param value - 변환할 값 (예: 유전자 값 또는 평균)
 */
const valueToContinuousColor = (value: number): string => {
  // 값을 [2, 10] 범위로 제한하여 예외적인 값도 안전하게 처리합니다.
  const clampedValue = Math.max(2, Math.min(10, value));
  // [2, 10] 범위를 [240, 0] 색상(hue) 범위로 변환합니다.
  const hue = 240 - ((clampedValue - 2) / 8) * 240;
  return `hsl(${hue}, 80%, 50%)`;
};

/**
 * Gene과 Direction에 따라 최종 색상을 결정하는 함수
 */
const getCellColor = (gene: Gene, viewMode: ViewMode, direction: GeneDirection): string => {
  if (viewMode === "life") {
    return ALIVE_COLOR;
  }

  let value: number;
  switch (direction) {
    case "up":
      value = gene[0];
      break;
    case "down":
      value = gene[1];
      break;
    case "left":
      value = gene[2];
      break;
    case "right":
      value = gene[3];
      break;
    case "avg":
    default:
      value = (gene[0] + gene[1] + gene[2] + gene[3]) / 4;
      break;
  }
  return valueToContinuousColor(value);
};

export function SimCanvas({ grid, viewMode, geneDirection }: SimCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!grid) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // 캔버스 초기화
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 셀 그리기
    for (let i = 0; i < grid.cells.length; i++) {
      const cell = grid.cells[i];
      const x = i % grid.width;
      const y = Math.floor(i / grid.width);

      context.fillStyle = cell.isAlive
        ? getCellColor(cell.gene, viewMode, geneDirection)
        : DEAD_COLOR;
      context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

    // 그리드 라인 그리기
    context.strokeStyle = GRID_COLOR;
    context.lineWidth = 0.5;
    for (let i = 0; i <= grid.width; i++) {
      context.beginPath();
      context.moveTo(i * CELL_SIZE, 0);
      context.lineTo(i * CELL_SIZE, grid.height * CELL_SIZE);
      context.stroke();
    }
    for (let i = 0; i <= grid.height; i++) {
      context.beginPath();
      context.moveTo(0, i * CELL_SIZE);
      context.lineTo(grid.width * CELL_SIZE, i * CELL_SIZE);
      context.stroke();
    }
  }, [grid, viewMode, geneDirection]);

  if (!grid) {
    return <div>Loading Grid...</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      width={grid.width * CELL_SIZE}
      height={grid.height * CELL_SIZE}
      className="border border-zinc-300"
    />
  );
}
