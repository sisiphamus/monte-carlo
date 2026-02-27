"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  SimulationLayout,
  SliderControl,
  StatDisplay,
  Button,
} from "@/components/SimulationLayout";
import { Math as MathTex } from "@/components/Math";

interface Point {
  x: number;
  y: number;
  inside: boolean;
}

export default function PiEstimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const [points, setPoints] = useState<Point[]>([]);
  const [inside, setInside] = useState(0);
  const [total, setTotal] = useState(0);
  const [piEstimate, setPiEstimate] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(10); // points per frame
  const [maxPoints, setMaxPoints] = useState(10000);
  const [piHistory, setPiHistory] = useState<number[]>([]);

  const stateRef = useRef({
    points: [] as Point[],
    inside: 0,
    total: 0,
    piHistory: [] as number[],
  });

  const drawMainCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);

    // Background
    ctx.fillStyle = "#13131a";
    ctx.fillRect(0, 0, size, size);

    // Draw the square border
    ctx.strokeStyle = "#2e2e3e";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, size - 20, size - 20);

    // Draw the inscribed circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, (size - 20) / 2, 0, Math.PI * 2);
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw points
    const pts = stateRef.current.points;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const px = 10 + p.x * (size - 20);
      const py = 10 + p.y * (size - 20);

      ctx.beginPath();
      ctx.arc(px, py, pts.length > 2000 ? 1 : 1.5, 0, Math.PI * 2);
      ctx.fillStyle = p.inside
        ? "rgba(99, 102, 241, 0.7)"
        : "rgba(239, 68, 68, 0.5)";
      ctx.fill();
    }

    // Draw pi value overlay
    const pi = stateRef.current.total > 0
      ? (4 * stateRef.current.inside) / stateRef.current.total
      : 0;
    ctx.fillStyle = "rgba(10, 10, 15, 0.7)";
    ctx.fillRect(10, 10, 180, 50);
    ctx.fillStyle = "#e4e4e7";
    ctx.font = "bold 22px monospace";
    ctx.fillText(`π ≈ ${pi.toFixed(6)}`, 20, 42);
  }, []);

  const drawHistoryCanvas = useCallback(() => {
    const canvas = historyCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#13131a";
    ctx.fillRect(0, 0, w, h);

    const history = stateRef.current.piHistory;
    if (history.length < 2) return;

    // Draw true pi line
    const piY = h / 2;
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, piY);
    ctx.lineTo(w, piY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.fillStyle = "#22c55e";
    ctx.font = "11px monospace";
    ctx.fillText("π = 3.14159...", w - 110, piY - 5);

    // Scale: show range from pi-0.5 to pi+0.5 (narrowing as it converges)
    const minVal = Math.PI - 0.5;
    const maxVal = Math.PI + 0.5;
    const range = maxVal - minVal;

    // Draw the estimate convergence line
    ctx.beginPath();
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < history.length; i++) {
      const x = (i / (history.length - 1)) * w;
      const y = h - ((history[i] - minVal) / range) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = "#71717a";
    ctx.font = "10px monospace";
    ctx.fillText(maxVal.toFixed(2), 4, 14);
    ctx.fillText(minVal.toFixed(2), 4, h - 4);
    ctx.fillText("N=" + history.length, 4, h / 2 + 20);
  }, []);

  const reset = useCallback(() => {
    setRunning(false);
    cancelAnimationFrame(animFrameRef.current);
    stateRef.current = {
      points: [],
      inside: 0,
      total: 0,
      piHistory: [],
    };
    setPoints([]);
    setInside(0);
    setTotal(0);
    setPiEstimate(0);
    setPiHistory([]);
    drawMainCanvas();
    drawHistoryCanvas();
  }, [drawMainCanvas, drawHistoryCanvas]);

  const addPoints = useCallback(
    (count: number) => {
      const state = stateRef.current;
      for (let i = 0; i < count; i++) {
        if (state.total >= maxPoints) return;
        const x = Math.random();
        const y = Math.random();
        const dx = x - 0.5;
        const dy = y - 0.5;
        const isInside = dx * dx + dy * dy <= 0.25;

        state.points.push({ x, y, inside: isInside });
        state.total++;
        if (isInside) state.inside++;

        // Record history at logarithmic intervals for performance
        if (
          state.total <= 100 ||
          state.total % Math.max(1, Math.floor(state.total / 200)) === 0
        ) {
          state.piHistory.push((4 * state.inside) / state.total);
        }
      }
      const pi = (4 * state.inside) / state.total;
      setPoints([...state.points]);
      setInside(state.inside);
      setTotal(state.total);
      setPiEstimate(pi);
      setPiHistory([...state.piHistory]);
    },
    [maxPoints]
  );

  const animate = useCallback(() => {
    const state = stateRef.current;
    if (state.total >= maxPoints) {
      setRunning(false);
      return;
    }
    addPoints(speed);
    drawMainCanvas();
    drawHistoryCanvas();
    animFrameRef.current = requestAnimationFrame(animate);
  }, [speed, maxPoints, addPoints, drawMainCanvas, drawHistoryCanvas]);

  const toggleRun = useCallback(() => {
    if (running) {
      setRunning(false);
      cancelAnimationFrame(animFrameRef.current);
    } else {
      setRunning(true);
    }
  }, [running]);

  useEffect(() => {
    if (running) {
      animFrameRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [running, animate]);

  // Initial canvas draw
  useEffect(() => {
    drawMainCanvas();
    drawHistoryCanvas();
  }, [drawMainCanvas, drawHistoryCanvas]);

  const error = total > 0 ? Math.abs(piEstimate - Math.PI) : 0;
  const errorPct = total > 0 ? (error / Math.PI) * 100 : 0;

  return (
    <SimulationLayout
      title="Pi Estimation"
      description="Estimate pi using the Monte Carlo method: throw random points at a unit square and count how many land inside the inscribed circle."
      controls={
        <div className="space-y-5">
          <SliderControl
            label="Points per frame"
            value={speed}
            min={1}
            max={100}
            onChange={setSpeed}
          />
          <SliderControl
            label="Max points"
            value={maxPoints}
            min={1000}
            max={100000}
            step={1000}
            onChange={(v) => {
              setMaxPoints(v);
            }}
          />
          <div className="flex gap-2">
            <Button
              onClick={toggleRun}
              variant={running ? "danger" : "primary"}
            >
              {running ? "Pause" : total > 0 ? "Resume" : "Start"}
            </Button>
            <Button onClick={reset} variant="secondary">
              Reset
            </Button>
          </div>
          <div className="rounded-lg border border-card-border bg-surface p-3 text-xs text-muted">
            <MathTex tex="\pi \approx 4 \cdot \frac{\text{points inside circle}}{\text{total points}}" display />
          </div>
        </div>
      }
      stats={
        <div className="grid grid-cols-2 gap-4">
          <StatDisplay label="Total Points" value={total} />
          <StatDisplay
            label="Inside Circle"
            value={inside}
            color="var(--accent)"
          />
          <StatDisplay
            label="Pi Estimate"
            value={piEstimate.toFixed(6)}
            subValue={`True: ${Math.PI.toFixed(6)}`}
            color="var(--accent)"
          />
          <StatDisplay
            label="Error"
            value={error.toFixed(6)}
            subValue={`${errorPct.toFixed(3)}%`}
            color={errorPct < 1 ? "var(--success)" : "var(--warning)"}
          />
        </div>
      }
    >
      <div className="space-y-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="w-full rounded-lg"
          style={{ aspectRatio: "1/1", maxHeight: "600px" }}
        />
        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
            Convergence to pi
          </div>
          <canvas
            ref={historyCanvasRef}
            width={600}
            height={150}
            className="w-full rounded-lg"
            style={{ maxHeight: "150px" }}
          />
        </div>
      </div>
    </SimulationLayout>
  );
}
