"use client";

import { Math as MathTex } from "@/components/Math";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-2xl font-bold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-lg font-semibold text-accent">{title}</h3>
      {children}
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="prose-invert max-w-none text-base leading-7 text-zinc-300 [&>p]:mb-4">
      {children}
    </div>
  );
}

function MathBlock({
  tex,
  label,
}: {
  tex: string;
  label?: string;
}) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-card-border bg-surface p-4">
      <MathTex tex={tex} display />
      {label && (
        <div className="mt-2 text-center text-xs text-muted">{label}</div>
      )}
    </div>
  );
}

export default function Theory() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Mathematical Background
        </h1>
        <p className="mt-2 text-lg text-muted">
          The theory and foundations behind Monte Carlo simulation methods.
        </p>
      </div>

      {/* Table of Contents */}
      <nav className="mb-12 rounded-xl border border-card-border bg-card-bg p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Contents
        </h2>
        <ol className="space-y-1 text-sm">
          <li>
            <a href="#what-is-mc" className="text-accent hover:text-accent-hover">
              1. What Are Monte Carlo Methods?
            </a>
          </li>
          <li>
            <a href="#foundation" className="text-accent hover:text-accent-hover">
              2. Mathematical Foundation
            </a>
          </li>
          <li>
            <a href="#convergence" className="text-accent hover:text-accent-hover">
              3. Convergence Theory
            </a>
          </li>
          <li>
            <a href="#variance-reduction" className="text-accent hover:text-accent-hover">
              4. Variance Reduction Techniques
            </a>
          </li>
          <li>
            <a href="#applications" className="text-accent hover:text-accent-hover">
              5. Applications
            </a>
          </li>
        </ol>
      </nav>

      {/* Section 1: What Are Monte Carlo Methods? */}
      <div id="what-is-mc">
        <Section title="1. What Are Monte Carlo Methods?">
          <Prose>
            <p>
              Monte Carlo methods are a broad class of computational algorithms
              that use repeated random sampling to obtain numerical results. The
              core idea is simple: use randomness to solve problems that might be
              deterministic in principle but intractable by analytical means.
            </p>
            <p>
              The name &ldquo;Monte Carlo&rdquo; was coined by Stanislaw Ulam and
              John von Neumann during the Manhattan Project in the 1940s, named
              after the Monte Carlo Casino in Monaco. Ulam was recovering from an
              illness and playing solitaire when he realized that rather than
              computing the exact probability of winning, he could simply play
              many games and count the wins.
            </p>
            <p>
              This insight is the essence of Monte Carlo: replace exact
              computation with statistical estimation from random samples.
            </p>
          </Prose>
        </Section>
      </div>

      {/* Section 2: Mathematical Foundation */}
      <div id="foundation">
        <Section title="2. Mathematical Foundation">
          <Prose>
            <p>
              At the heart of every Monte Carlo method is the estimation of an
              expected value. Suppose we want to compute:
            </p>
          </Prose>

          <MathBlock
            tex="I = E[f(X)] = \int f(x)\,p(x)\,dx"
            label="The quantity we wish to estimate"
          />

          <Prose>
            <p>
              where <MathTex tex="X" /> is a random variable with density{" "}
              <MathTex tex="p(x)" /> and <MathTex tex="f" /> is some function.
              The Monte Carlo estimator is:
            </p>
          </Prose>

          <MathBlock
            tex="\hat{I}_N = \frac{1}{N}\sum_{i=1}^{N} f(X_i), \quad X_i \overset{\text{iid}}{\sim} p"
            label="The Monte Carlo estimator"
          />

          <Prose>
            <p>
              This is simply the sample mean of <MathTex tex="f(X_i)" />.
              By the Strong Law of Large Numbers (SLLN):
            </p>
          </Prose>

          <MathBlock
            tex="\hat{I}_N \xrightarrow{\text{a.s.}} E[f(X)] = I \quad \text{as } N \to \infty"
            label="Strong Law of Large Numbers"
          />

          <Prose>
            <p>
              This guarantees that our estimator converges to the true value
              almost surely. Furthermore, if{" "}
              <MathTex tex="\text{Var}[f(X)] = \sigma^2 < \infty" />, the
              Central Limit Theorem gives us:
            </p>
          </Prose>

          <MathBlock
            tex="\sqrt{N}\left(\hat{I}_N - I\right) \xrightarrow{d} N(0, \sigma^2)"
            label="Central Limit Theorem for Monte Carlo"
          />

          <Prose>
            <p>
              This tells us the error is approximately normally distributed with
              standard deviation{" "}
              <MathTex tex="\sigma / \sqrt{N}" />. To halve the error, we
              need four times as many samples. This{" "}
              <MathTex tex="O(1/\sqrt{N})" /> convergence rate is the
              fundamental bottleneck of Monte Carlo methods, but it is also its
              greatest strength: it is independent of the problem dimension.
            </p>
          </Prose>
        </Section>
      </div>

      {/* Section 3: Convergence Theory */}
      <div id="convergence">
        <Section title="3. Convergence Theory">
          <Subsection title="Standard Error and Confidence Intervals">
            <Prose>
              <p>
                The standard error (SE) of the Monte Carlo estimator is:
              </p>
            </Prose>
            <MathBlock tex="\text{SE} = \frac{\sigma}{\sqrt{N}} = \frac{1}{\sqrt{N}}\sqrt{\frac{1}{N-1}\sum_{i=1}^{N}\left(f(X_i) - \hat{I}_N\right)^2}" />
            <Prose>
              <p>
                An approximate 95% confidence interval for <MathTex tex="I" />{" "}
                is:
              </p>
            </Prose>
            <MathBlock tex="\hat{I}_N \pm 1.96 \cdot \text{SE}" />
          </Subsection>

          <Subsection title="Error Bounds">
            <Prose>
              <p>
                By Chebyshev&apos;s inequality, we have a non-asymptotic bound:
              </p>
            </Prose>
            <MathBlock tex="P\left(|\hat{I}_N - I| \geq \epsilon\right) \leq \frac{\sigma^2}{N\epsilon^2}" />
            <Prose>
              <p>
                For a desired accuracy <MathTex tex="\epsilon" /> with
                probability at least <MathTex tex="1 - \delta" />, we need:
              </p>
            </Prose>
            <MathBlock tex="N \geq \frac{\sigma^2}{\epsilon^2 \delta}" />
          </Subsection>
        </Section>
      </div>

      {/* Section 4: Variance Reduction Techniques */}
      <div id="variance-reduction">
        <Section title="4. Variance Reduction Techniques">
          <Prose>
            <p>
              Since the convergence rate <MathTex tex="O(1/\sqrt{N})" /> is
              fixed, the only way to improve accuracy without increasing{" "}
              <MathTex tex="N" /> is to reduce the variance{" "}
              <MathTex tex="\sigma^2" />. Several powerful techniques exist for
              this purpose.
            </p>
          </Prose>

          <Subsection title="Antithetic Variates">
            <Prose>
              <p>
                The idea: if <MathTex tex="U" /> is a uniform random variable,
                then <MathTex tex="1 - U" /> is also uniform but negatively
                correlated with <MathTex tex="U" />. By averaging estimates from
                both <MathTex tex="U" /> and <MathTex tex="1 - U" />, the
                variance decreases due to the negative covariance:
              </p>
            </Prose>
            <MathBlock
              tex="\hat{I}_{\text{AV}} = \frac{1}{2}\left[f(U) + f(1-U)\right]"
              label="Antithetic variate estimator"
            />
            <MathBlock
              tex="\text{Var}[\hat{I}_{\text{AV}}] = \frac{1}{4}\left[\text{Var}[f(U)] + \text{Var}[f(1-U)] + 2\text{Cov}[f(U), f(1-U)]\right]"
            />
            <Prose>
              <p>
                When <MathTex tex="f" /> is monotone, the covariance is
                negative, yielding a variance reduction.
              </p>
            </Prose>
          </Subsection>

          <Subsection title="Control Variates">
            <Prose>
              <p>
                Suppose we have a related function <MathTex tex="g(X)" /> whose
                expected value <MathTex tex="\mu_g = E[g(X)]" /> is known. We
                can form a controlled estimator:
              </p>
            </Prose>
            <MathBlock
              tex="\hat{I}_{\text{CV}} = \hat{I}_N - c\left(\hat{G}_N - \mu_g\right)"
              label="Control variate estimator"
            />
            <Prose>
              <p>
                The optimal coefficient is{" "}
                <MathTex tex="c^* = \text{Cov}[f(X), g(X)] / \text{Var}[g(X)]" />
                , which minimizes the variance to:
              </p>
            </Prose>
            <MathBlock tex="\text{Var}[\hat{I}_{\text{CV}}] = \text{Var}[\hat{I}_N]\left(1 - \rho_{fg}^2\right)" />
            <Prose>
              <p>
                where <MathTex tex="\rho_{fg}" /> is the correlation between{" "}
                <MathTex tex="f(X)" /> and <MathTex tex="g(X)" />. The higher
                the correlation, the greater the variance reduction.
              </p>
            </Prose>
          </Subsection>

          <Subsection title="Importance Sampling">
            <Prose>
              <p>
                Instead of sampling from <MathTex tex="p(x)" />, we sample from
                an alternative distribution <MathTex tex="q(x)" /> that places
                more mass in &ldquo;important&rdquo; regions:
              </p>
            </Prose>
            <MathBlock
              tex="I = \int f(x) p(x)\,dx = \int f(x)\frac{p(x)}{q(x)}q(x)\,dx = E_q\!\left[f(X)\frac{p(X)}{q(X)}\right]"
            />
            <MathBlock
              tex="\hat{I}_{\text{IS}} = \frac{1}{N}\sum_{i=1}^{N}f(X_i)\frac{p(X_i)}{q(X_i)}, \quad X_i \sim q"
              label="Importance sampling estimator"
            />
            <Prose>
              <p>
                The optimal proposal distribution is{" "}
                <MathTex tex="q^*(x) \propto |f(x)| p(x)" />, which achieves
                zero variance if <MathTex tex="f" /> does not change sign.
                In practice, we seek a <MathTex tex="q" /> that approximates
                this ideal.
              </p>
            </Prose>
          </Subsection>

          <Subsection title="Stratified Sampling">
            <Prose>
              <p>
                Partition the sample space into strata{" "}
                <MathTex tex="A_1, \ldots, A_K" /> and sample from each
                stratum proportionally. This guarantees we &ldquo;cover&rdquo;
                the space more evenly than pure random sampling:
              </p>
            </Prose>
            <MathBlock
              tex="\hat{I}_{\text{strat}} = \sum_{k=1}^{K} P(A_k) \cdot \frac{1}{N_k}\sum_{i=1}^{N_k}f(X_i^{(k)}), \quad X_i^{(k)} \sim p(\cdot \mid A_k)"
            />
            <Prose>
              <p>
                Stratified sampling always reduces variance compared to simple
                random sampling (or at worst, matches it), with the reduction
                being largest when the stratum means differ significantly.
              </p>
            </Prose>
          </Subsection>
        </Section>
      </div>

      {/* Section 5: Applications */}
      <div id="applications">
        <Section title="5. Applications">
          <Subsection title="Finance: Option Pricing">
            <Prose>
              <p>
                The price of a European option under risk-neutral pricing is:
              </p>
            </Prose>
            <MathBlock tex="V_0 = e^{-rT}\,E^{\mathbb{Q}}[\text{Payoff}(S_T)]" />
            <Prose>
              <p>
                Under the Black-Scholes model, the stock price follows Geometric
                Brownian Motion:
              </p>
            </Prose>
            <MathBlock tex="dS_t = rS_t\,dt + \sigma S_t\,dW_t" />
            <MathBlock tex="S_T = S_0 \exp\!\left[\left(r - \tfrac{\sigma^2}{2}\right)T + \sigma\sqrt{T}\,Z\right], \quad Z \sim N(0,1)" />
            <Prose>
              <p>
                Monte Carlo simulation generates many paths of{" "}
                <MathTex tex="S_T" />, computes the payoff for each, and
                averages the discounted payoffs. This approach scales to
                path-dependent options (Asian, barrier, lookback) and
                multi-dimensional problems where closed-form solutions do not
                exist.
              </p>
            </Prose>
          </Subsection>

          <Subsection title="Physics: Integration and Particle Transport">
            <Prose>
              <p>
                In computational physics, Monte Carlo is indispensable for:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>
                  <strong>High-dimensional integration</strong> in quantum
                  mechanics (path integrals) and statistical mechanics (partition
                  functions)
                </li>
                <li>
                  <strong>Particle transport</strong> simulations (neutron
                  diffusion, photon scattering) using random walks
                </li>
                <li>
                  <strong>Ising model</strong> simulations using Metropolis-Hastings
                  MCMC
                </li>
                <li>
                  <strong>Lattice QCD</strong> for computing hadron masses and
                  other non-perturbative quantities
                </li>
              </ul>
              <p>
                The key advantage: while deterministic quadrature rules suffer
                from the curse of dimensionality (error grows exponentially with
                dimension), Monte Carlo error is always{" "}
                <MathTex tex="O(1/\sqrt{N})" /> regardless of dimension.
              </p>
            </Prose>
          </Subsection>

          <Subsection title="Engineering: Reliability and Risk">
            <Prose>
              <p>
                Monte Carlo methods are widely used in engineering for:
              </p>
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>
                  <strong>Structural reliability</strong>: estimate the
                  probability of failure by sampling uncertain loads, material
                  properties, and geometries
                </li>
                <li>
                  <strong>Circuit design</strong>: analyze how manufacturing
                  variations affect chip performance
                </li>
                <li>
                  <strong>Risk assessment</strong>: model uncertain inputs to
                  complex systems and estimate tail probabilities
                </li>
                <li>
                  <strong>Optimization</strong>: simulated annealing and genetic
                  algorithms use randomness to explore solution spaces
                </li>
              </ul>
            </Prose>
          </Subsection>

          <Subsection title="Machine Learning: MCMC and Bayesian Inference">
            <Prose>
              <p>
                Markov Chain Monte Carlo (MCMC) methods generate samples from
                complex posterior distributions in Bayesian inference:
              </p>
            </Prose>
            <MathBlock tex="p(\theta \mid \text{data}) = \frac{p(\text{data} \mid \theta)\,p(\theta)}{p(\text{data})}" />
            <Prose>
              <p>
                Algorithms like Metropolis-Hastings, Gibbs sampling, and
                Hamiltonian Monte Carlo (HMC) construct Markov chains whose
                stationary distribution is the target posterior. Modern
                probabilistic programming frameworks (Stan, PyMC, NumPyro) are
                built on these foundations.
              </p>
            </Prose>
          </Subsection>
        </Section>
      </div>

      {/* Footer */}
      <div className="mt-16 rounded-xl border border-card-border bg-card-bg p-6 text-center">
        <p className="text-sm text-muted">
          Explore the interactive simulations to see these concepts in action.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <a
            href="/pi"
            className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
          >
            Pi Estimation
          </a>
          <a
            href="/options"
            className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
          >
            Option Pricing
          </a>
          <a
            href="/clt"
            className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
          >
            Central Limit Theorem
          </a>
          <a
            href="/random-walk"
            className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
          >
            Random Walk
          </a>
          <a
            href="/convergence"
            className="rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20"
          >
            Convergence
          </a>
        </div>
      </div>
    </div>
  );
}
