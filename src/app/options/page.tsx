"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  SimulationLayout,
  SliderControl,
  StatDisplay,
  Button,
} from "@/components/SimulationLayout";
import { Math as MathTex } from "@/components/Math";

// Standard normal CDF approximation (Abramowitz & Stegun)
function normCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}

// Black-Scholes closed-form for European call/put
function blackScholes(
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
  type: "call" | "put"
): number {
  const d1 =
    (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) /
    (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  if (type === "call") {
    return S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
  } else {
    return K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
  }
}

// Box-Muller transform for standard normal
function randn(): number {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

interface Path {
  prices: number[];
}

export default function OptionPricing() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [S0, setS0] = useState(100); // initial price
  const [K, setK] = useState(105); // strike
  const [T, setT] = useState(1); // time to expiry (years)
  const [r, setR] = useState(0.05); // risk-free rate
  const [sigma, setSigma] = useState(0.2); // volatility
  const [numPaths, setNumPaths] = useState(1000);
  const [numSteps, setNumSteps] = useState(252); // trading days
  const [optionType, setOptionType] = useState<"call" | "put">("call");

  const [paths, setPaths] = useState<Path[]>([]);
  const [mcPrice, setMcPrice] = useState(0);
  const [bsPrice, setBsPrice] = useState(0);
  const [mcStdErr, setMcStdErr] = useState(0);
  const [computed, setComputed] = useState(false);

  const simulate = useCallback(() => {
    const dt = T / numSteps;
    const drift = (r - 0.5 * sigma * sigma) * dt;
    const diffusion = sigma * Math.sqrt(dt);

    const allPaths: Path[] = [];
    const payoffs: number[] = [];

    for (let i = 0; i < numPaths; i++) {
      const prices: number[] = [S0];
      let price = S0;

      for (let j = 0; j < numSteps; j++) {
        const z = randn();
        price = price * Math.exp(drift + diffusion * z);
        // Only store path data for display (max 200 paths shown)
        if (i < 200) {
          prices.push(price);
        }
      }

      if (i < 200) {
        allPaths.push({ prices });
      }

      // Compute payoff
      const payoff =
        optionType === "call"
          ? Math.max(price - K, 0)
          : Math.max(K - price, 0);
      payoffs.push(payoff);
    }

    // Discounted average payoff
    const discountFactor = Math.exp(-r * T);
    const discountedPayoffs = payoffs.map((p) => p * discountFactor);
    const mean =
      discountedPayoffs.reduce((a, b) => a + b, 0) / discountedPayoffs.length;
    const variance =
      discountedPayoffs.reduce((a, b) => a + (b - mean) ** 2, 0) /
      (discountedPayoffs.length - 1);
    const stdErr = Math.sqrt(variance / discountedPayoffs.length);

    const bs = blackScholes(S0, K, T, r, sigma, optionType);

    setPaths(allPaths);
    setMcPrice(mean);
    setBsPrice(bs);
    setMcStdErr(stdErr);
    setComputed(true);
  }, [S0, K, T, r, sigma, numPaths, numSteps, optionType]);

  // Draw paths on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || paths.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#13131a";
    ctx.fillRect(0, 0, w, h);

    // Find min/max for scaling
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    for (const path of paths) {
      for (const p of path.prices) {
        if (p < minPrice) minPrice = p;
        if (p > maxPrice) maxPrice = p;
      }
    }
    const priceRange = maxPrice - minPrice || 1;
    const padding = 40;

    // Draw axes
    ctx.strokeStyle = "#2e2e3e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();

    // Y axis labels
    ctx.fillStyle = "#71717a";
    ctx.font = "10px monospace";
    for (let i = 0; i <= 4; i++) {
      const val = minPrice + (priceRange * i) / 4;
      const y = h - padding - ((val - minPrice) / priceRange) * (h - 2 * padding);
      ctx.fillText(`$${val.toFixed(0)}`, 2, y + 3);
      ctx.beginPath();
      ctx.strokeStyle = "#1e1e2e";
      ctx.moveTo(padding, y);
      ctx.lineTo(w - padding, y);
      ctx.stroke();
    }

    // Draw strike price line
    const strikeY =
      h - padding - ((K - minPrice) / priceRange) * (h - 2 * padding);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, strikeY);
    ctx.lineTo(w - padding, strikeY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#f59e0b";
    ctx.font = "11px monospace";
    ctx.fillText(`K=$${K}`, w - padding - 50, strikeY - 5);

    // Draw paths
    const maxDisplay = Math.min(paths.length, 200);
    for (let i = 0; i < maxDisplay; i++) {
      const path = paths[i];
      const steps = path.prices.length;

      // Color based on final price vs strike
      const finalPrice = path.prices[steps - 1];
      const inTheMoney =
        optionType === "call" ? finalPrice > K : finalPrice < K;
      ctx.strokeStyle = inTheMoney
        ? "rgba(34, 197, 94, 0.15)"
        : "rgba(239, 68, 68, 0.1)";
      ctx.lineWidth = 0.5;

      ctx.beginPath();
      for (let j = 0; j < steps; j++) {
        const x = padding + (j / (steps - 1)) * (w - 2 * padding);
        const y =
          h -
          padding -
          ((path.prices[j] - minPrice) / priceRange) * (h - 2 * padding);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Draw S0 label
    const s0Y =
      h - padding - ((S0 - minPrice) / priceRange) * (h - 2 * padding);
    ctx.fillStyle = "#6366f1";
    ctx.font = "11px monospace";
    ctx.fillText(`S₀=$${S0}`, padding + 5, s0Y - 5);
  }, [paths, K, S0, optionType]);

  // Draw empty canvas on mount
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
      "Click 'Run Simulation' to generate paths",
      canvas.width / 2,
      canvas.height / 2
    );
    ctx.textAlign = "start";
  }, []);

  return (
    <SimulationLayout
      title="Option Pricing"
      description="Price European options using Monte Carlo simulation of Geometric Brownian Motion paths, and compare against the Black-Scholes analytical solution."
      controls={
        <div className="space-y-4">
          <SliderControl
            label="Spot Price (S₀)"
            value={S0}
            min={50}
            max={200}
            step={1}
            onChange={setS0}
            displayValue={`$${S0}`}
          />
          <SliderControl
            label="Strike Price (K)"
            value={K}
            min={50}
            max={200}
            step={1}
            onChange={setK}
            displayValue={`$${K}`}
          />
          <SliderControl
            label="Volatility (σ)"
            value={sigma}
            min={0.05}
            max={0.8}
            step={0.01}
            onChange={setSigma}
            displayValue={`${(sigma * 100).toFixed(0)}%`}
          />
          <SliderControl
            label="Risk-free Rate (r)"
            value={r}
            min={0.01}
            max={0.15}
            step={0.005}
            onChange={setR}
            displayValue={`${(r * 100).toFixed(1)}%`}
          />
          <SliderControl
            label="Time to Expiry (T)"
            value={T}
            min={0.1}
            max={3}
            step={0.1}
            onChange={setT}
            displayValue={`${T.toFixed(1)} yr`}
          />
          <SliderControl
            label="Simulation Paths"
            value={numPaths}
            min={100}
            max={50000}
            step={100}
            onChange={setNumPaths}
          />

          <div className="flex gap-2">
            <button
              onClick={() => setOptionType("call")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                optionType === "call"
                  ? "bg-accent text-white"
                  : "bg-surface text-muted border border-card-border"
              }`}
            >
              Call
            </button>
            <button
              onClick={() => setOptionType("put")}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                optionType === "put"
                  ? "bg-accent text-white"
                  : "bg-surface text-muted border border-card-border"
              }`}
            >
              Put
            </button>
          </div>

          <Button onClick={simulate} variant="primary">
            Run Simulation
          </Button>

          <div className="rounded-lg border border-card-border bg-surface p-3 text-xs text-muted">
            <MathTex
              tex="dS = \mu S\,dt + \sigma S\,dW"
              display
            />
          </div>
        </div>
      }
      stats={
        computed ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatDisplay
                label="MC Price"
                value={`$${mcPrice.toFixed(4)}`}
                color="var(--accent)"
              />
              <StatDisplay
                label="B-S Price"
                value={`$${bsPrice.toFixed(4)}`}
                color="var(--success)"
              />
              <StatDisplay
                label="MC Std Error"
                value={`$${mcStdErr.toFixed(4)}`}
              />
              <StatDisplay
                label="Difference"
                value={`$${Math.abs(mcPrice - bsPrice).toFixed(4)}`}
                subValue={`${(
                  (Math.abs(mcPrice - bsPrice) / bsPrice) *
                  100
                ).toFixed(2)}%`}
                color={
                  Math.abs(mcPrice - bsPrice) / bsPrice < 0.05
                    ? "var(--success)"
                    : "var(--warning)"
                }
              />
            </div>
            <div className="rounded-lg border border-card-border bg-surface p-3 text-xs text-muted">
              <div className="mb-1 font-medium text-foreground">
                95% Confidence Interval
              </div>
              ${(mcPrice - 1.96 * mcStdErr).toFixed(4)} - $
              {(mcPrice + 1.96 * mcStdErr).toFixed(4)}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted">
            Run the simulation to see pricing results.
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
