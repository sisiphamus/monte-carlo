import Link from "next/link";

const simulations = [
  {
    href: "/pi",
    title: "Pi Estimation",
    description:
      "Estimate pi by throwing random darts at a unit square. Watch the ratio of points inside the inscribed circle converge to pi/4.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="20" cy="20" r="18" className="text-accent" />
        <rect x="2" y="2" width="36" height="36" rx="2" className="text-muted" />
      </svg>
    ),
    color: "from-indigo-500/20 to-purple-500/20",
  },
  {
    href: "/options",
    title: "Option Pricing",
    description:
      "Simulate Geometric Brownian Motion paths to price European options. Compare Monte Carlo estimates against the Black-Scholes closed-form solution.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <polyline points="4,35 12,28 18,32 24,15 30,20 36,5" className="text-success" />
        <line x1="4" y1="36" x2="36" y2="36" className="text-muted" />
        <line x1="4" y1="4" x2="4" y2="36" className="text-muted" />
      </svg>
    ),
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    href: "/clt",
    title: "Central Limit Theorem",
    description:
      "Roll dice and watch the sampling distribution of the mean converge to a Gaussian. An interactive demonstration of the CLT.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="8" y="25" width="4" height="10" rx="1" className="text-warning" />
        <rect x="14" y="18" width="4" height="17" rx="1" className="text-warning" />
        <rect x="20" y="8" width="4" height="27" rx="1" className="text-warning" />
        <rect x="26" y="18" width="4" height="17" rx="1" className="text-warning" />
        <rect x="32" y="25" width="4" height="10" rx="1" className="text-warning" />
      </svg>
    ),
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    href: "/random-walk",
    title: "Random Walk",
    description:
      "Watch a particle take random steps on a 2D plane. Observe diffusion, path tracing, and the connection to Brownian motion.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <polyline points="5,20 10,15 14,22 20,10 25,18 28,12 35,25" className="text-rose-400" />
        <circle cx="35" cy="25" r="2" fill="currentColor" className="text-rose-400" />
      </svg>
    ),
    color: "from-rose-500/20 to-pink-500/20",
  },
  {
    href: "/convergence",
    title: "Convergence Visualizer",
    description:
      "Explore how Monte Carlo estimates converge as sample size grows. Visualize confidence intervals shrinking in real time.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4,30 Q15,5 36,20" className="text-cyan-400" />
        <line x1="4" y1="20" x2="36" y2="20" strokeDasharray="2,2" className="text-muted" />
      </svg>
    ),
    color: "from-cyan-500/20 to-blue-500/20",
  },
  {
    href: "/theory",
    title: "Mathematical Background",
    description:
      "The theory behind Monte Carlo methods: law of large numbers, variance reduction, importance sampling, and real-world applications.",
    icon: (
      <svg viewBox="0 0 40 40" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <text x="8" y="30" fontSize="28" fontFamily="serif" className="text-foreground" fill="currentColor" stroke="none">
          &pi;
        </text>
      </svg>
    ),
    color: "from-violet-500/20 to-fuchsia-500/20",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Monte Carlo
          <span className="block text-accent">Simulations</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted">
          Interactive visualizations of Monte Carlo methods. Explore how
          randomness converges to deterministic results through the law of large
          numbers.
        </p>
      </div>

      {/* Simulation Cards */}
      <div className="stagger-children grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {simulations.map((sim) => (
          <Link
            key={sim.href}
            href={sim.href}
            className="group relative overflow-hidden rounded-xl border border-card-border bg-card-bg p-6 transition-all duration-300 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/5"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${sim.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            />
            <div className="relative">
              <div className="mb-4">{sim.icon}</div>
              <h2 className="mb-2 text-lg font-semibold tracking-tight">
                {sim.title}
              </h2>
              <p className="text-sm leading-relaxed text-muted">
                {sim.description}
              </p>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent opacity-0 transition-all duration-300 group-hover:opacity-100">
                Explore
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-16 text-center text-sm text-muted">
        All simulations run entirely in your browser. No data is sent to any server.
      </div>
    </div>
  );
}
