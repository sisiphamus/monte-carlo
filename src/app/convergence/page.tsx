"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  SimulationLayout,
  SliderControl,
  StatDisplay,
  Button,
} from "@/components/SimulationLayout";
import { Math as MathTex } from "@/components/Math";

type EstimatorType = "mean" | "pi" | "integral" | "exponential";

interface DataPoint {
  n: number;
  estimate: number;
  lower95: number;
  upper95: number;
}

const estimators: Record<
  EstimatorType,
  {
    name: string;
    trueValue: number;
    description: string;
    tex: string;
    sample: () => number;
  }
> = {
  mean: {
    name: "E[U(0,1)]",
    trueValue: 0.5,
    description: "Estimate the mean of a Uniform(0,1) distribution",
    tex: "E[U] = \\int_0^1 x\\,dx = 0.5",
    sample: () => Math.random(),
  },
  pi: {
    name: "Pi / 4",
    trueValue: Math.PI / 4,
    description: "Estimate pi/4 from random (x,y) in [0,1]^2",
    tex: "\\frac{\\pi}{4} = P(X^2 + Y^2 \\leq 1)",
    sample: () => {
      const x = Math.random();
      const y = Math.random();
      return x * x + y * y <= 1 ? 1 : 0;
    },
  },
  integral: {
    name: "Integral of sin(x)",
    trueValue: 1 - Math.cos(1), // integral of sin(x) from 0 to 1
    description: "Estimate the integral of sin(x) from 0 to 1",
    tex: "\\int_0^1 \\sin(x)\\,dx = 1 - \\cos(1) \\approx 0.4597",
    sample: () => Math.sin(Math.random()),
  },
  exponential: {
    name: "E[e^U]",
    trueValue: Math.E - 1,
    description: "Estimate E[e^U] where U ~ Uniform(0,1)",
    tex: "E[e^U] = \\int_0^1 e^x\\,dx = e - 1 \\approx 1.7183",
    sample: () => Math.exp(Math.random()),
  },
};

export default function ConvergenceVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [estimatorType, setEstimatorType] = useState<EstimatorType>("pi");
  const [maxN, setMaxN] = useState(10000);
  const [numTrials, setNumTrials] = useState(5);
  const [computed, setComputed] = useState(false);
  const [data, setData] = useState<DataPoint[][]>([]);

  const trialColors = [
    "#6366f1",
    "#22c55e",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#06b6d4",
    "#8b5cf6",
    "#f97316",
    "#14b8a6",
    "#a855f7",
  ];

  const runSimulation = useCallback(() => {
    const est = estimators[estimatorType];
    const allTrials: DataPoint[][] = [];

    for (let trial = 0; trial < numTrials; trial++) {
      const trialData: DataPoint[] = [];
      let sum = 0;
      let sumSq = 0;

      // Sample at logarithmic intervals for smooth plotting
      const samplePoints: number[] = [];
      for (let i = 1; i <= Math.min(100, maxN); i++) samplePoints.push(i);
      for (let i = 100; i <= maxN; i += Math.max(1, Math.floor(i / 100))) {
        if (i > 100) samplePoints.push(i);
      }
      if (samplePoints[samplePoints.length - 1] !== maxN) {
        samplePoints.push(maxN);
      }

      let currentIdx = 0;
      for (let n = 1; n <= maxN; n++) {
        const x = est.sample();
        sum += x;
        sumSq += x * x;

        if (n === samplePoints[currentIdx]) {
          const mean = sum / n;
          const variance = n > 1 ? (sumSq / n - mean * mean) : 0;
          const stdErr = n > 1 ? Math.sqrt(variance / n) : 0;

          trialData.push({
            n,
            estimate: mean,
            lower95: mean - 1.96 * stdErr,
            upper95: mean + 1.96 * stdErr,
          });
          currentIdx++;
        }
      }

      allTrials.push(trialData);
    }

    setData(allTrials);
    setComputed(true);
  }, [estimatorType, maxN, numTrials]);

  // Draw the convergence plot
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#13131a";
    ctx.fillRect(0, 0, w, h);

    if (!computed || data.length === 0) {
      ctx.fillStyle = "#71717a";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "Click 'Run Simulation' to see convergence",
        w / 2,
        h / 2
      );
      ctx.textAlign = "start";
      return;
    }

    const est = estimators[estimatorType];
    const padding = { top: 40, bottom: 50, left: 70, right: 30 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    // Find y bounds
    let yMin = Infinity,
      yMax = -Infinity;
    for (const trial of data) {
      for (const pt of trial) {
        if (pt.lower95 < yMin) yMin = pt.lower95;
        if (pt.upper95 > yMax) yMax = pt.upper95;
        if (pt.estimate < yMin) yMin = pt.estimate;
        if (pt.estimate > yMax) yMax = pt.estimate;
      }
    }

    // Ensure true value is visible
    yMin = Math.min(yMin, est.trueValue - 0.1);
    yMax = Math.max(yMax, est.trueValue + 0.1);
    const yRange = yMax - yMin;

    const toX = (n: number) =>
      padding.left + (Math.log(n) / Math.log(maxN)) * plotW;
    const toY = (v: number) =>
      padding.top + plotH - ((v - yMin) / yRange) * plotH;

    // Draw grid
    ctx.strokeStyle = "#1e1e2e";
    ctx.lineWidth = 0.5;
    for (let e = 0; e <= Math.log10(maxN); e++) {
      const n = Math.pow(10, e);
      if (n >= 1 && n <= maxN) {
        const x = toX(n);
        ctx.beginPath();
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, h - padding.bottom);
        ctx.stroke();
      }
    }

    // Draw axes
    ctx.strokeStyle = "#2e2e3e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    // Draw true value line
    const trueY = toY(est.trueValue);
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, trueY);
    ctx.lineTo(w - padding.right, trueY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#22c55e";
    ctx.font = "11px monospace";
    ctx.textAlign = "right";
    ctx.fillText(
      `True = ${est.trueValue.toFixed(4)}`,
      w - padding.right,
      trueY - 8
    );

    // Draw confidence bands and estimate lines for each trial
    for (let t = 0; t < data.length; t++) {
      const trial = data[t];
      const color = trialColors[t % trialColors.length];

      // Draw confidence band (only for first trial to avoid clutter)
      if (t === 0 && numTrials <= 3) {
        ctx.fillStyle = color.replace(")", ", 0.08)").replace("rgb", "rgba").replace("#", "");
        // Use hex to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.08)`;
        ctx.beginPath();
        for (let i = 0; i < trial.length; i++) {
          const x = toX(trial[i].n);
          const y = toY(trial[i].upper95);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = trial.length - 1; i >= 0; i--) {
          const x = toX(trial[i].n);
          const y = toY(trial[i].lower95);
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Draw CI bounds
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let i = 0; i < trial.length; i++) {
          const x = toX(trial[i].n);
          const y = toY(trial[i].upper95);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.beginPath();
        for (let i = 0; i < trial.length; i++) {
          const x = toX(trial[i].n);
          const y = toY(trial[i].lower95);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Draw estimate line
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < trial.length; i++) {
        const x = toX(trial[i].n);
        const y = toY(trial[i].estimate);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // X-axis labels (log scale)
    ctx.fillStyle = "#71717a";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    for (let e = 0; e <= Math.log10(maxN); e++) {
      const n = Math.pow(10, e);
      if (n >= 1 && n <= maxN) {
        const x = toX(n);
        ctx.fillText(`10^${e}`, x, h - padding.bottom + 20);
      }
    }

    // Y-axis labels
    ctx.textAlign = "right";
    const ySteps = 6;
    for (let i = 0; i <= ySteps; i++) {
      const val = yMin + (yRange * i) / ySteps;
      const y = toY(val);
      ctx.fillText(val.toFixed(3), padding.left - 8, y + 3);
    }

    // Axis titles
    ctx.fillStyle = "#71717a";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Sample Size (N) — log scale", w / 2, h - 5);

    ctx.save();
    ctx.translate(15, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Estimate", 0, 0);
    ctx.restore();

    // Legend
    ctx.textAlign = "left";
    for (let t = 0; t < Math.min(data.length, 8); t++) {
      ctx.fillStyle = trialColors[t % trialColors.length];
      ctx.fillRect(padding.left + 10, padding.top + 5 + t * 16, 12, 10);
      ctx.fillStyle = "#a1a1aa";
      ctx.font = "10px monospace";
      ctx.fillText(
        `Trial ${t + 1}: ${data[t][data[t].length - 1].estimate.toFixed(4)}`,
        padding.left + 28,
        padding.top + 14 + t * 16
      );
    }
  }, [data, computed, estimatorType, maxN, numTrials, trialColors]);

  // Draw initial state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#13131a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#71717a";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(
      "Click 'Run Simulation' to see convergence",
      canvas.width / 2,
      canvas.height / 2
    );
    ctx.textAlign = "start";
  }, []);

  const est = estimators[estimatorType];
  const finalEstimates = data.map(
    (trial) => trial[trial.length - 1]?.estimate ?? 0
  );
  const avgEstimate =
    finalEstimates.length > 0
      ? finalEstimates.reduce((a, b) => a + b, 0) / finalEstimates.length
      : 0;
  const finalError = Math.abs(avgEstimate - est.trueValue);

  return (
    <SimulationLayout
      title="Convergence Visualizer"
      description="Watch how Monte Carlo estimates converge as sample size grows. Multiple trials show variance between runs, and confidence intervals shrink at the 1/sqrt(N) rate."
      controls={
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Estimator
            </label>
            <div className="grid grid-cols-2 gap-1">
              {(Object.keys(estimators) as EstimatorType[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setEstimatorType(key);
                    setComputed(false);
                  }}
                  className={`rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                    estimatorType === key
                      ? "bg-accent text-white"
                      : "bg-surface text-muted border border-card-border"
                  }`}
                >
                  {estimators[key].name}
                </button>
              ))}
            </div>
          </div>

          <SliderControl
            label="Max Sample Size"
            value={maxN}
            min={1000}
            max={100000}
            step={1000}
            onChange={setMaxN}
          />
          <SliderControl
            label="Number of Trials"
            value={numTrials}
            min={1}
            max={10}
            onChange={setNumTrials}
          />

          <Button onClick={runSimulation} variant="primary">
            Run Simulation
          </Button>

          <div className="rounded-lg border border-card-border bg-surface p-3 text-xs text-muted">
            <MathTex tex={est.tex} display />
            <p className="mt-1">{est.description}</p>
          </div>

          <div className="rounded-lg border border-card-border bg-surface p-3 text-xs text-muted">
            <MathTex
              tex="\\text{SE} = \\frac{\\sigma}{\\sqrt{N}} \\propto \\frac{1}{\\sqrt{N}}"
              display
            />
          </div>
        </div>
      }
      stats={
        computed ? (
          <div className="grid grid-cols-2 gap-4">
            <StatDisplay
              label="Avg Estimate"
              value={avgEstimate.toFixed(6)}
              color="var(--accent)"
            />
            <StatDisplay
              label="True Value"
              value={est.trueValue.toFixed(6)}
              color="var(--success)"
            />
            <StatDisplay
              label="Abs Error"
              value={finalError.toFixed(6)}
              color={finalError < 0.01 ? "var(--success)" : "var(--warning)"}
            />
            <StatDisplay label="Trials" value={numTrials} />
          </div>
        ) : (
          <div className="text-sm text-muted">
            Run the simulation to see convergence statistics.
          </div>
        )
      }
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full rounded-lg"
        style={{ maxHeight: "500px" }}
      />
    </SimulationLayout>
  );
}
