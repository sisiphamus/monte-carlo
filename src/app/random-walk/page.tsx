"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  SimulationLayout,
  SliderControl,
  StatDisplay,
  Button,
} from "@/components/SimulationLayout";
import { Math as MathTex } from "@/components/Math";

interface Position {
  x: number;
  y: number;
}

export default function RandomWalk() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const [numSteps, setNumSteps] = useState(5000);
  const [speed, setSpeed] = useState(5);
  const [stepSize, setStepSize] = useState(1);
  const [walkType, setWalkType] = useState<"lattice" | "continuous">("lattice");
  const [numWalkers, setNumWalkers] = useState(1);
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const walkersRef = useRef<Position[][]>([]);
  const stepsRef = useRef(0);

  const colors = [
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#06b6d4",
    "#8b5cf6",
    "#f97316",
  ];

  const initWalkers = useCallback(() => {
    walkersRef.current = [];
    for (let i = 0; i < numWalkers; i++) {
      walkersRef.current.push([{ x: 0, y: 0 }]);
    }
    stepsRef.current = 0;
    setCurrentStep(0);
  }, [numWalkers]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#13131a";
    ctx.fillRect(0, 0, w, h);

    const walkers = walkersRef.current;
    if (walkers.length === 0 || walkers[0].length === 0) {
      ctx.fillStyle = "#71717a";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Click 'Start' to begin the random walk", w / 2, h / 2);
      ctx.textAlign = "start";
      return;
    }

    // Find bounds across all walkers
    let minX = 0,
      maxX = 0,
      minY = 0,
      maxY = 0;
    for (const walker of walkers) {
      for (const pos of walker) {
        if (pos.x < minX) minX = pos.x;
        if (pos.x > maxX) maxX = pos.x;
        if (pos.y < minY) minY = pos.y;
        if (pos.y > maxY) maxY = pos.y;
      }
    }

    // Add padding to bounds
    const rangeX = Math.max(maxX - minX, 20);
    const rangeY = Math.max(maxY - minY, 20);
    const range = Math.max(rangeX, rangeY) * 1.2;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const padding = 40;
    const plotSize = Math.min(w, h) - 2 * padding;

    const toCanvasX = (x: number) =>
      padding + ((x - centerX) / range + 0.5) * plotSize;
    const toCanvasY = (y: number) =>
      padding + ((y - centerY) / range + 0.5) * plotSize;

    // Draw grid
    ctx.strokeStyle = "#1e1e2e";
    ctx.lineWidth = 0.5;
    const gridStep = Math.pow(10, Math.floor(Math.log10(range / 5)));
    const gridStart = Math.floor((centerX - range / 2) / gridStep) * gridStep;
    for (let gx = gridStart; gx <= centerX + range / 2; gx += gridStep) {
      const cx = toCanvasX(gx);
      ctx.beginPath();
      ctx.moveTo(cx, padding);
      ctx.lineTo(cx, h - padding);
      ctx.stroke();
    }
    const gridStartY = Math.floor((centerY - range / 2) / gridStep) * gridStep;
    for (let gy = gridStartY; gy <= centerY + range / 2; gy += gridStep) {
      const cy = toCanvasY(gy);
      ctx.beginPath();
      ctx.moveTo(padding, cy);
      ctx.lineTo(w - padding, cy);
      ctx.stroke();
    }

    // Draw origin axes
    ctx.strokeStyle = "#2e2e3e";
    ctx.lineWidth = 1;
    const ox = toCanvasX(0);
    const oy = toCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(ox, padding);
    ctx.lineTo(ox, h - padding);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding, oy);
    ctx.lineTo(w - padding, oy);
    ctx.stroke();

    // Draw origin marker
    ctx.beginPath();
    ctx.arc(ox, oy, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#71717a";
    ctx.fill();

    // Draw walker paths
    for (let wi = 0; wi < walkers.length; wi++) {
      const walker = walkers[wi];
      const color = colors[wi % colors.length];

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = walker.length > 1000 ? 0.5 : 1;
      ctx.globalAlpha = 0.6;

      for (let i = 0; i < walker.length; i++) {
        const cx = toCanvasX(walker[i].x);
        const cy = toCanvasY(walker[i].y);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw current position
      const last = walker[walker.length - 1];
      const lcx = toCanvasX(last.x);
      const lcy = toCanvasY(last.y);
      ctx.beginPath();
      ctx.arc(lcx, lcy, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(lcx, lcy, 8, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Info overlay
    ctx.fillStyle = "rgba(10, 10, 15, 0.7)";
    ctx.fillRect(padding, padding, 160, 25);
    ctx.fillStyle = "#e4e4e7";
    ctx.font = "11px monospace";
    ctx.fillText(
      `Steps: ${stepsRef.current.toLocaleString()}`,
      padding + 8,
      padding + 17
    );
  }, [colors]);

  const step = useCallback(
    (count: number) => {
      for (let s = 0; s < count; s++) {
        if (stepsRef.current >= numSteps) return;
        stepsRef.current++;

        for (const walker of walkersRef.current) {
          const last = walker[walker.length - 1];
          let nx: number, ny: number;

          if (walkType === "lattice") {
            const dir = Math.floor(Math.random() * 4);
            nx =
              last.x + (dir === 0 ? stepSize : dir === 1 ? -stepSize : 0);
            ny =
              last.y + (dir === 2 ? stepSize : dir === 3 ? -stepSize : 0);
          } else {
            const angle = Math.random() * 2 * Math.PI;
            nx = last.x + Math.cos(angle) * stepSize;
            ny = last.y + Math.sin(angle) * stepSize;
          }

          walker.push({ x: nx, y: ny });
        }
      }
      setCurrentStep(stepsRef.current);
    },
    [numSteps, walkType, stepSize]
  );

  const animate = useCallback(() => {
    if (stepsRef.current >= numSteps) {
      setRunning(false);
      return;
    }
    step(speed);
    drawCanvas();
    animFrameRef.current = requestAnimationFrame(animate);
  }, [speed, numSteps, step, drawCanvas]);

  useEffect(() => {
    if (running) {
      animFrameRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [running, animate]);

  const reset = useCallback(() => {
    setRunning(false);
    cancelAnimationFrame(animFrameRef.current);
    initWalkers();
    setTimeout(drawCanvas, 0);
  }, [initWalkers, drawCanvas]);

  useEffect(() => {
    initWalkers();
    drawCanvas();
  }, [initWalkers, drawCanvas]);

  // Compute stats
  const walkers = walkersRef.current;
  const distances =
    walkers.length > 0
      ? walkers.map((w) => {
          const last = w[w.length - 1];
          return Math.sqrt(last.x * last.x + last.y * last.y);
        })
      : [0];
  const avgDist =
    distances.reduce((a, b) => a + b, 0) / distances.length;
  const maxDist = Math.max(...distances);
  const rmsDisplacement =
    Math.sqrt(
      distances.reduce((a, b) => a + b * b, 0) / distances.length
    );

  return (
    <SimulationLayout
      title="Random Walk"
      description="Visualize 2D random walks — lattice or continuous. Watch particles diffuse outward, illustrating the connection to Brownian motion and diffusion processes."
      controls={
        <div className="space-y-5">
          <SliderControl
            label="Max Steps"
            value={numSteps}
            min={100}
            max={50000}
            step={100}
            onChange={setNumSteps}
          />
          <SliderControl
            label="Steps per frame"
            value={speed}
            min={1}
            max={50}
            onChange={setSpeed}
          />
          <SliderControl
            label="Step Size"
            value={stepSize}
            min={0.5}
            max={5}
            step={0.5}
            onChange={setStepSize}
          />
          <SliderControl
            label="Number of Walkers"
            value={numWalkers}
            min={1}
            max={8}
            onChange={setNumWalkers}
          />

          <div className="flex gap-2">
            <button
              onClick={() => setWalkType("lattice")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                walkType === "lattice"
                  ? "bg-accent text-white"
                  : "bg-surface text-muted border border-card-border"
              }`}
            >
              Lattice
            </button>
            <button
              onClick={() => setWalkType("continuous")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                walkType === "continuous"
                  ? "bg-accent text-white"
                  : "bg-surface text-muted border border-card-border"
              }`}
            >
              Continuous
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (running) {
                  setRunning(false);
                  cancelAnimationFrame(animFrameRef.current);
                } else {
                  if (stepsRef.current === 0) initWalkers();
                  setRunning(true);
                }
              }}
              variant={running ? "danger" : "primary"}
            >
              {running ? "Pause" : currentStep > 0 ? "Resume" : "Start"}
            </Button>
            <Button onClick={reset} variant="secondary">
              Reset
            </Button>
          </div>

          <div className="rounded-lg border border-card-border bg-surface p-3 text-xs text-muted">
            <MathTex
              tex="E[|X_n|^2] = n \cdot \sigma^2"
              display
            />
            <p className="mt-1">
              RMS displacement grows as{" "}
              <MathTex tex="\sqrt{n}" /> (diffusion).
            </p>
          </div>
        </div>
      }
      stats={
        <div className="grid grid-cols-2 gap-4">
          <StatDisplay label="Steps" value={currentStep} />
          <StatDisplay
            label="Walkers"
            value={numWalkers}
            color="var(--accent)"
          />
          <StatDisplay
            label="RMS Displacement"
            value={rmsDisplacement.toFixed(2)}
            subValue={`Expected: ${(stepSize * Math.sqrt(currentStep)).toFixed(2)}`}
            color="var(--accent)"
          />
          <StatDisplay
            label="Avg Distance"
            value={avgDist.toFixed(2)}
          />
          <StatDisplay
            label="Max Distance"
            value={maxDist.toFixed(2)}
            color="var(--warning)"
          />
          <StatDisplay
            label="Walk Type"
            value={walkType === "lattice" ? "Lattice" : "Continuous"}
          />
        </div>
      }
    >
      <canvas
        ref={canvasRef}
        width={700}
        height={700}
        className="w-full rounded-lg"
        style={{ aspectRatio: "1/1", maxHeight: "700px" }}
      />
    </SimulationLayout>
  );
}
