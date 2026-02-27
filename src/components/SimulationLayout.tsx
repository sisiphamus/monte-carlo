"use client";

import React from "react";

interface SimulationLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
  stats?: React.ReactNode;
}

export function SimulationLayout({
  title,
  description,
  children,
  controls,
  stats,
}: SimulationLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-lg text-muted">{description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
            {children}
          </div>
        </div>

        <div className="space-y-6">
          {controls && (
            <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                Controls
              </h2>
              {controls}
            </div>
          )}
          {stats && (
            <div className="rounded-xl border border-card-border bg-card-bg p-4 sm:p-6">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                Statistics
              </h2>
              {stats}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  displayValue?: string;
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  displayValue,
}: SliderControlProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <span className="font-mono text-sm text-accent">
          {displayValue ?? value.toLocaleString()}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

interface StatDisplayProps {
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

export function StatDisplay({ label, value, subValue, color }: StatDisplayProps) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </div>
      <div
        className="font-mono text-xl font-bold"
        style={{ color: color || "var(--foreground)" }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {subValue && (
        <div className="text-xs text-muted">{subValue}</div>
      )}
    </div>
  );
}

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

export function Button({
  onClick,
  children,
  variant = "primary",
  disabled = false,
}: ButtonProps) {
  const base =
    "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-accent hover:bg-accent-hover text-white",
    secondary:
      "border border-card-border bg-surface hover:bg-card-border text-foreground",
    danger: "bg-red-600 hover:bg-red-500 text-white",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}
