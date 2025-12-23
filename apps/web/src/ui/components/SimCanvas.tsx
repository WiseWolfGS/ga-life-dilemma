"use client";

import { useEffect, useRef } from "react";
import type { Grid, Gene, TerrainType } from "@ga-life/core";
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

const TERRAIN_COLOR: Record<TerrainType, string> = {
  normal: "#FFFFFF", // 일반 지형은 죽은 셀과 동일하게
  double: "#a855f7", // purple-500
  half: "#f97316",   // orange-500
};

/**
 * 주어진 값(2 ~ 10 범위)을 연속적인 HSL 색상으로 변환합니다.
 * 2는 파란색(hue 240), 10은 빨간색(hue 0)에 매핑됩니다.
 */
const valueToContinuousColor = (value: number): string => {
  const clampedValue = Math.max(2, Math.min(10, value));
  const hue = 240 - ((clampedValue - 2) / 8) * 240;
  return `hsl(${hue}, 80%, 50%)`;
};

/**
 * Gene과 Direction에 따라 유전자 뷰의 색상을 결정하는 함수
 */
const getGeneColor = (gene: Gene, direction: GeneDirection): string => {
  let value: number;
  switch (direction) {
    case "up": value = gene[0]; break;
    case "down": value = gene[1]; break;
    case "left": value = gene[2]; break;
    case "right": value = gene[3]; break;
    case "avg": default: value = (gene[0] + gene[1] + gene[2] + gene[3]) / 4; break;
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

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < grid.cells.length; i++) {
      const cell = grid.cells[i];
      const x = i % grid.width;
      const y = Math.floor(i / grid.width);

      let color = DEAD_COLOR;
      switch (viewMode) {
        case "life":
          color = cell.isAlive ? ALIVE_COLOR : DEAD_COLOR;
          break;
        case "gene":
          color = cell.isAlive ? getGeneColor(cell.gene, geneDirection) : DEAD_COLOR;
          break;
        case "terrain":
          color = TERRAIN_COLOR[grid.terrain[i]];
          break;
      }
      context.fillStyle = color;
      context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }

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
