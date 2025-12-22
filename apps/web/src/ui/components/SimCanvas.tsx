"use client";

import { useEffect, useRef } from "react";
import type { Grid } from "@ga-life/core";

interface SimCanvasProps {
  grid: Grid | null;
}

const CELL_SIZE = 10; // 각 셀의 크기 (픽셀)
const GRID_COLOR = "#CCCCCC";
const ALIVE_COLOR = "#000000";
const DEAD_COLOR = "#FFFFFF";

export function SimCanvas({ grid }: SimCanvasProps) {
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

      context.fillStyle = cell.isAlive ? ALIVE_COLOR : DEAD_COLOR;
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
  }, [grid]);

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
