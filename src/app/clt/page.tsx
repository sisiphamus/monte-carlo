"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  SimulationLayout,
  SliderControl,
  StatDisplay,
  Button,
} from "@/components/SimulationLayout";
import { Math as MathTex } from "@/components/Math";

export default function CentralLimitTheorem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const [numDice, setNumDice] = useState(2);
  const [numRolls, setNumRolls] = useState(0);
  const [targetRolls, setTargetRolls] = useState(5000);
  const [speed, setSpeed] = useState(20);
  const [running, setRunning] = useState(false);
  const [sampleMean, setSampleMean] = useState(0);
  const [sampleStd, setSampleStd] = useState(0);

  // Histogram bins: for numDice dice, the mean ranges from 1 to 6
  const binsRef = useRef<Map<string, number>>(new Map());
  const totalRef = useRef(0);
  const sumRef = useRef(0);
  const sumSqRef = useRef(0);

  const getBinKey = (value: number): string => {
    // Round to 1 decimal for binning
    return (Math.round(value * 10) / 10).toFixed(1);
  };

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

    const bins = binsRef.current;
    const total = totalRef.current;

    if (total === 0) {
      ctx.fillStyle = "#71717a";
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Click 'Start' to begin rolling dice", w / 2, h / 2);
      ctx.textAlign = "start";
      return;
    }

    const padding = { top: 30, bottom: 50, left: 60, right: 20 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    // Determine all possible bin values (from 1.0 to 6.0 in steps of 1/numDice)
    const step = 1 / numDice;
    const allBins: { key: string; value: number; count: number }[] = [];
    for (let v = 1; v <= 6; v += step) {
      const key = getBinKey(v);
      allBins.push({ key, value: v, count: bins.get(key) || 0 });
    }

    // Find max count for scaling
    let maxCount = 0;
    for (const bin of allBins) {
      if (bin.count > maxCount) maxCount = bin.count;
    }
    if (maxCount === 0) maxCount = 1;

    // Draw axes
    ctx.strokeStyle = "#2e2e3e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, h - padding.bottom);
    ctx.lineTo(w - padding.right, h - padding.bottom);
    ctx.stroke();

    // Draw bars
    const barWidth = Math.max(1, plotW / allBins.length - 1);
    for (let i = 0; i < allBins.length; i++) {
      const bin = allBins[i];
      const barHeight = (bin.count / maxCount) * plotH;
      const x = padding.left + (i / allBins.length) * plotW;
      const y = h - padding.bottom - barHeight;

      // Color gradient from accent to accent-hover based on height
      const intensity = bin.count / maxCount;
      const r2 = Math.round(99 + intensity * 30);
      const g = Math.round(102 + intensity * 30);
      const b = Math.round(241);
      ctx.fillStyle = `rgba(${r2}, ${g}, ${b}, ${0.4 + intensity * 0.6})`;
      ctx.fillRect(x, y, barWidth, barHeight);
    }

    // Draw normal distribution overlay
    const trueMean = 3.5;
    const trueVar = 35 / (12 * numDice); // Variance of mean of numDice dice
    const trueStd = Math.sqrt(trueVar);

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= plotW; i++) {
      const xVal = 1 + (i / plotW) * 5;
      const z = (xVal - trueMean) / trueStd;
      const pdf =
        (1 / (trueStd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);

      // Scale pdf to match histogram
      const binWidth = 5 / allBins.length;
      const expectedCount = pdf * total * binWidth;
      const barH = (expectedCount / maxCount) * plotH;
      const x = padding.left + i;
      const y = h - padding.bottom - barH;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // X-axis labels
    ctx.fillStyle = "#71717a";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    for (let v = 1; v <= 6; v++) {
      const x = padding.left + ((v - 1) / 5) * plotW;
      ctx.fillText(v.toString(), x, h - padding.bottom + 15);
    }

    // Y-axis labels
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const count = Math.round((maxCount * i) / 4);
      const y = h - padding.bottom - (i / 4) * plotH;
      ctx.fillText(count.toString(), padding.left - 8, y + 3);
    }

    // Labels
    ctx.textAlign = "left";
    ctx.fillStyle = "#e4e4e7";
    ctx.font = "12px sans-serif";
    ctx.fillText(`N = ${total.toLocaleString()}`, padding.left + 10, padding.top + 15);

    ctx.fillStyle = "#22c55e";
    ctx.fillText("-- Normal approximation", padding.left + 10, padding.top + 32);

    ctx.textAlign = "center";
    ctx.fillStyle = "#71717a";
    ctx.font = "11px sans-serif";
    ctx.fillText("Mean of dice rolls", w / 2, h - 5);
    ctx.textAlign = "start";
  }, [numDice]);

  const rollDice = useCallback(
    (count: number) => {
      for (let i = 0; i < count; i++) {
        let sum = 0;
        for (let d = 0; d < numDice; d++) {
          sum += Math.floor(Math.random() * 6) + 1;
        }
        const mean = sum / numDice;
        const key = getBinKey(mean);
        binsRef.current.set(key, (binsRef.current.get(key) || 0) + 1);
        totalRef.current++;
        sumRef.current += mean;
        sumSqRef.current += mean * mean;
      }

      const n = totalRef.current;
      const avg = sumRef.current / n;
      const v = sumSqRef.current / n - avg * avg;
      setNumRolls(n);
      setSampleMean(avg);
      setSampleStd(Math.sqrt(v));
    },
    [numDice]
  );

  const animate = useCallback(() => {
    if (totalRef.current >= targetRolls) {
      setRunning(false);
      return;
    }
    rollDice(speed);
    drawCanvas();
    animFrameRef.current = requestAnimationFrame(animate);
  }, [speed, targetRolls, rollDice, drawCanvas]);

  useEffect(() => {
    if (running) {
      animFrameRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [running, animate]);

  const reset = useCallback(() => {
    setRunning(false);
    cancelAnimationFrame(animFrameRef.current);
    binsRef.current = new Map();
    totalRef.current = 0;
    sumRef.current = 0;
    sumSqRef.current = 0;
    setNumRolls(0);
    setSampleMean(0);
    setSampleStd(0);
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Reset when numDice changes
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numDice]);

  const trueMean = 3.5;
  const trueStd = Math.sqrt(35 / (12 * numDice));

  return (
    <SimulationLayout
      title="Central Limit Theorem"
      description="Roll dice repeatedly and watch the distribution of sample means converge to a normal distribution, regardless of the underlying uniform distribution."
      controls={
        <div className="space-y-5">
          <SliderControl
            label="Number of Dice"
            value={numDice}
            min={1}
            max={20}
            onChange={setNumDice}
          />
          <SliderControl
            label="Rolls per frame"
            value={speed}
            min={1}
            max={100}
            onChange={setSpeed}
          />
          <SliderControl
            label="Target rolls"
            value={targetRolls}
            min={500}
            max={50000}
            step={500}
            onChange={setTargetRolls}
          />

          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (running) {
                  setRunning(false);
                  cancelAnimationFrame(animFrameRef.current);
                } else {
                  setRunning(true);
                }
              }}
              variant={running ? "danger" : "primary"}
            >
              {running ? "Pause" : numRolls > 0 ? "Resume" : "Start"}
            </Button>
            <Button onClick={reset} variant="secondary">
              Reset
            </Button>
          </div>

          <div className="rounded-lg border border-card-border bg-surface p-3 text-xs text-muted">
            <MathTex
              tex="\bar{X}_n = \frac{1}{n}\sum_{i=1}^{n} X_i \xrightarrow{d} N\!\left(\mu,\, \frac{\sigma^2}{n}\right)"
              display
            />
          </div>
        </div>
      }
      stats={
        <div className="grid grid-cols-2 gap-4">
          <StatDisplay label="Total Rolls" value={numRolls} />
          <StatDisplay
            label="Dice per Roll"
            value={numDice}
            color="var(--accent)"
          />
          <StatDisplay
            label="Sample Mean"
            value={sampleMean.toFixed(4)}
            subValue={`True: ${trueMean.toFixed(4)}`}
            color="var(--accent)"
          />
          <StatDisplay
            label="Sample Std"
            value={sampleStd.toFixed(4)}
            subValue={`True: ${trueStd.toFixed(4)}`}
            color="var(--success)"
          />
        </div>
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
