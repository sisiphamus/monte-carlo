# Monte Carlo Simulations

Simulate a random walk ten times and you have noise. Simulate it ten thousand times and structure appears. Simulate it a million times and you converge on truth.

That's the core idea behind Monte Carlo methods -- use randomness as a computational tool. It sounds paradoxical until you see it work. Option pricing, risk quantification, Bayesian inference, integral estimation, portfolio stress testing -- all approachable through the same fundamental technique: generate enough random scenarios and the statistics do the rest.

This is a browser-based engine for running and visualizing Monte Carlo simulations across probability and finance. Watch convergence happen in real time. See how path count affects confidence intervals. Explore the boundary between randomness and certainty.

## Simulations

### Pi Estimation (`/pi`)

The classic Monte Carlo demonstration. Random points are thrown uniformly into a unit square. The ratio of points landing inside the inscribed quarter-circle to total points converges to pi/4. The visualization shows:

- **Real-time scatter plot** of points colored by inside/outside status
- **Convergence graph** showing the pi estimate approaching the true value over time
- **Interactive controls** for speed, sample size, and play/pause

**Math**: If (X, Y) are uniform on [0,1]^2, then P(X^2 + Y^2 <= 1) = pi/4, so pi = 4 * (points inside) / (total points).

### Option Pricing (`/options`)

Monte Carlo simulation of European option prices using Geometric Brownian Motion (GBM). Features:

- **Path visualization**: up to 200 simulated stock price paths rendered on canvas, colored by in-the-money status
- **Black-Scholes comparison**: the analytical closed-form price is computed alongside the MC estimate
- **Confidence intervals**: standard error and 95% CI reported
- **Full parameter control**: spot price, strike, volatility, risk-free rate, time to expiry, number of paths
- **Call/Put toggle**

**Math**: Under risk-neutral pricing, V_0 = e^(-rT) E[Payoff(S_T)] where S_T follows GBM: dS = rS dt + sigma S dW.

### Central Limit Theorem (`/clt`)

An interactive proof of the CLT. Roll N dice repeatedly and plot the distribution of sample means:

- **Animated histogram** that fills in as dice are rolled
- **Normal distribution overlay** showing the theoretical Gaussian the histogram converges to
- **Adjustable dice count** (1-20) to see how quickly normality emerges
- **Live statistics**: sample mean and standard deviation vs. theoretical values

**Math**: By the CLT, the sample mean of N iid random variables converges in distribution to N(mu, sigma^2/N) regardless of the underlying distribution.

### Random Walk (`/random-walk`)

2D random walk visualization with path tracing:

- **Lattice walk**: particle steps in one of four cardinal directions each tick
- **Continuous walk**: particle steps in a random angle with fixed step size
- **Multi-walker support**: up to 8 simultaneous walkers with distinct colors
- **Auto-scaling viewport** that adjusts as walkers diffuse outward
- **Statistics**: RMS displacement, average distance, comparison to theoretical sqrt(N) scaling

**Math**: For a simple random walk, E[|X_n|^2] = n * sigma^2. The RMS displacement grows as sqrt(n), the hallmark of diffusion.

### Convergence Visualizer (`/convergence`)

The most general simulation. Pick an estimator and watch it converge:

- **Four built-in estimators**: E[U(0,1)], Pi/4, integral of sin(x), E[e^U]
- **Multiple trials**: run up to 10 independent trials to see inter-run variance
- **Log-scale x-axis** to show convergence behavior across orders of magnitude
- **Confidence bands**: 95% CI shown for the first trial
- **True value reference line** with error statistics

**Math**: The standard error of a Monte Carlo estimator is SE = sigma / sqrt(N). The 1/sqrt(N) convergence rate is dimension-independent, which is why MC methods dominate in high dimensions.

### Mathematical Background (`/theory`)

A reference page covering the theory behind Monte Carlo methods:

- **Foundations**: the MC estimator, law of large numbers, CLT for Monte Carlo
- **Convergence theory**: standard errors, confidence intervals, Chebyshev bounds
- **Variance reduction**: antithetic variates, control variates, importance sampling, stratified sampling
- **Applications**: finance (option pricing, risk), physics (particle transport, lattice QCD), engineering (reliability, circuit design), machine learning (MCMC, Bayesian inference)

All equations rendered with KaTeX.

## Tech Stack

- **Next.js 16** with App Router and TypeScript
- **Tailwind CSS v4** for styling (dark theme)
- **HTML Canvas** for all visualizations (no heavy charting libraries)
- **KaTeX** for mathematical equation rendering
- **100% client-side** -- all simulations run in the browser, no server compute

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    page.tsx              # Home page with simulation cards
    layout.tsx            # Root layout with navigation
    globals.css           # Dark theme, custom styling
    pi/page.tsx           # Pi estimation simulation
    options/page.tsx      # Option pricing (GBM + Black-Scholes)
    clt/page.tsx          # Central Limit Theorem demo
    random-walk/page.tsx  # 2D random walk visualization
    convergence/page.tsx  # Convergence visualizer
    theory/page.tsx       # Mathematical background
  components/
    Navigation.tsx        # Top nav bar (responsive)
    SimulationLayout.tsx  # Shared layout, slider, stat, button components
    Math.tsx              # KaTeX rendering wrapper
```

## Design Principles

- **Dark theme throughout** -- easier on the eyes for staring at simulations
- **Canvas rendering** -- lightweight, fast, no DOM overhead for thousands of points
- **Interactive controls** -- sliders for all parameters, play/pause/reset
- **Responsive** -- works on desktop and mobile
- **Educational** -- every simulation includes the relevant math and context
