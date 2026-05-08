import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

// ─── DATA ───────────────────────────────────────────────

const FEATURES = [
  {
    icon: "🏢",
    title: "Multibranch Control Center",
    desc: "Manage every branch's hiring pipeline from one unified dashboard. Branch admins get isolated views; HQ gets the full picture.",
    tag: "Core feature",
    featured: true,
  },
  {
    icon: "🤖",
    title: "AI Resume Screening",
    desc: "Our AI ranks candidates by fit score, flags red flags, and summarizes profiles — cutting screen time by 80%.",
    tag: "AI-powered",
  },
  {
    icon: "📅",
    title: "Smart Interview Scheduling",
    desc: "Auto-sync calendars across teams, send reminders, and let candidates self-schedule with your availability.",
    tag: "Automation",
  },
  {
    icon: "📊",
    title: "Cross-Branch Analytics",
    desc: "Compare hiring velocity, source performance, and offer acceptance rates across all branches in real time.",
    tag: "Analytics",
  },
  {
    icon: "🔗",
    title: "Job Board Integrations",
    desc: "Post to LinkedIn, Indeed, Rozee.pk and 40+ boards simultaneously. All applications flow into one inbox.",
    tag: "Integrations",
  },
  {
    icon: "🔒",
    title: "Role-Based Permissions",
    desc: "Set granular access — branch managers only see their own roles; HQ can oversee everything with audit logs.",
    tag: "Security",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Create & publish roles",
    desc: "Define the role, assign it to branches, set criteria and publish to multiple job boards in one click.",
    active: true,
  },
  {
    num: "02",
    title: "AI screens applicants",
    desc: "Resumes are scored, ranked and summarized automatically. Your team reviews only the top fits.",
  },
  {
    num: "03",
    title: "Collaborate & interview",
    desc: "Leave feedback, schedule interviews, and make collaborative decisions — all inside HireFlow.",
  },
  {
    num: "04",
    title: "Offer & onboard",
    desc: "Generate offer letters, collect e-signatures, and hand off seamlessly to your onboarding workflow.",
  },
];

const BRANCHES = [
  { city: "Karachi", roles: "34 open roles" },
  { city: "Lahore", roles: "21 open roles" },
  { city: "Islamabad", roles: "18 open roles" },
];

const TESTIMONIALS = [
  {
    quote:
      "HireFlow completely transformed how we manage hiring across our 8 branches. Before, everything was scattered in spreadsheets — now it's one clean dashboard.",
    name: "Sara Azeem",
    role: "Head of Talent, TechNova",
    initials: "SA",
    avatarClass: "avatar--purple",
  },
  {
    quote:
      "The AI screening alone saved our team 15 hours a week. We now only look at candidates who actually match the role. Game-changing for a lean HR team.",
    name: "Mohammad Hassan",
    role: "HR Director, Bridgemark",
    initials: "MH",
    avatarClass: "avatar--green",
  },
  {
    quote:
      "We went from 28 days average time-to-hire down to 9. The branch-level controls meant every regional manager could own their process without chaos at HQ.",
    name: "Layla Mirza",
    role: "VP People Ops, Velum Co.",
    initials: "LM",
    avatarClass: "avatar--amber",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    period: "per month · up to 2 branches",
    features: [
      "Up to 2 branch workspaces",
      "10 active job postings",
      "Basic AI resume screening",
      "5 job board integrations",
      "Email support",
    ],
    cta: "Get started",
    popular: false,
  },
  {
    name: "Growth",
    price: "$149",
    period: "per month · up to 10 branches",
    features: [
      "Up to 10 branch workspaces",
      "Unlimited job postings",
      "Advanced AI screening & scoring",
      "40+ job board integrations",
      "Cross-branch analytics",
      "Custom approval workflows",
      "Priority support",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "tailored for 10+ branches",
    features: [
      "Unlimited branches",
      "SSO & advanced security",
      "Custom AI model fine-tuning",
      "Dedicated account manager",
      "SLA + uptime guarantee",
      "On-premise option available",
    ],
    cta: "Contact sales",
    popular: false,
  },
];

const LOGOS = ["TechNova", "Bridgemark", "Orion HR", "Velum Co.", "Stackwise", "Nimbus"];

const CANDIDATES = [
  {
    initials: "AS",
    name: "Amira Sharif",
    role: "Senior Product Designer · Karachi HQ",
    status: "Interview",
    statusClass: "pill--interview",
    avatarClass: "avatar--purple",
  },
  {
    initials: "RK",
    name: "Rayan Khan",
    role: "Backend Engineer · Lahore Branch",
    status: "Review",
    statusClass: "pill--review",
    avatarClass: "avatar--amber",
  },
  {
    initials: "ZB",
    name: "Zara Baig",
    role: "HR Manager · Islamabad Branch",
    status: "Offer sent",
    statusClass: "pill--offer",
    avatarClass: "avatar--green",
  },
];

const PIPELINE = [
  { label: "Applied", count: 284, fill: 100, color: "var(--accent)" },
  { label: "Screened", count: 112, fill: 65, color: "#7B6BF8" },
  { label: "Interview", count: 48, fill: 38, color: "var(--green)" },
  { label: "Offer", count: 11, fill: 15, color: "var(--amber)" },
];

// ─── SUB-COMPONENTS ──────────────────────────────────────

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        <span className="logo-dot" />
        HireFlow
      </Link>
      <ul className="nav-links">
        <li><a href="#features">Features</a></li>
        <li><a href="#how">How it works</a></li>
        <li><a href="#branches">Branches</a></li>
        <li><a href="#pricing">Pricing</a></li>
      </ul>
      <div className="nav-cta">
        <Link to="/login" className="btn btn--ghost">Sign in</Link>
        <Link to="/register" className="btn btn--primary">Get started →</Link>
      </div>
    </nav>
  );
}

function HeroDashboard() {
  return (
    <div className="hero-visual">
      <div className="float-card float-card--tl">
        <div className="float-mini-label">Applicants today</div>
        <div className="float-mini-val">128</div>
        <div className="float-mini-sub">↑ 24% vs last week</div>
      </div>

      <div className="dashboard-card">
        <div className="dash-header">
          <span className="dash-title">Hiring Pipeline</span>
          <span className="dash-badge-green">● 6 active roles</span>
        </div>

        <div className="pipeline-stages">
          {PIPELINE.map((s) => (
            <div className="stage" key={s.label}>
              <div className="stage-label">{s.label}</div>
              <div className="stage-count">{s.count}</div>
              <div className="stage-bar">
                <div
                  className="stage-fill"
                  style={{ width: `${s.fill}%`, background: s.color }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="candidates-list">
          {CANDIDATES.map((c) => (
            <div className="candidate-row" key={c.name}>
              <div className={`avatar ${c.avatarClass}`}>{c.initials}</div>
              <div className="cand-info">
                <div className="cand-name">{c.name}</div>
                <div className="cand-role">{c.role}</div>
              </div>
              <span className={`status-pill ${c.statusClass}`}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="float-card float-card--br">
        <div className="float-mini-label">Avg. time to hire</div>
        <div className="float-mini-val">9 days</div>
        <div className="float-mini-sub">↓ 63% vs before</div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-inner">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse" />
            Multibranch ATS — v2.0 now live
          </div>
          <h1>
            Hire smarter across{" "}
            <span className="accent-word">every branch</span>, all at once.
          </h1>
          <p className="hero-sub">
            HireFlow centralizes your entire recruitment pipeline — from multiple
            locations to a single dashboard. Post, track, and close roles 3×
            faster with AI-assisted screening.
          </p>
          <div className="hero-actions">
            <a href="#" className="btn btn--hero">Start free trial →</a>
            <a href="#how" className="btn btn--hero-outline">▶ Watch demo</a>
          </div>
          <div className="hero-stats">
            {[
              { num: "340+", label: "Companies onboarded" },
              { num: "12k", label: "Hires made" },
              { num: "63%", label: "Faster time-to-hire" },
            ].map((s) => (
              <div className="stat-item" key={s.label}>
                <span className="stat-num">{s.num}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <HeroDashboard />
      </div>
    </section>
  );
}

function LogosSection() {
  return (
    <div className="logos-section">
      <p className="logos-label">Trusted by fast-growing teams</p>
      <div className="logos-track">
        {LOGOS.map((l) => (
          <div className="logo-item" key={l}>{l}</div>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="section">
      <div className="section-inner">
        <div className="section-badge">⬡ Features</div>
        <h2>
          Everything your team needs
          <br />
          to hire at scale
        </h2>
        <p className="section-desc">
          Built for organizations running multiple branches, offices, or
          departments — all under one platform.
        </p>

        <div className="features-grid">
          {FEATURES.map((f) => (
            <div
              className={`feature-card ${f.featured ? "feature-card--featured" : ""}`}
              key={f.title}
            >
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
              <span className="feat-tag">{f.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowSection() {
  return (
    <section id="how" className="section section--dark">
      <div className="section-inner">
        <div className="section-badge section-badge--dim">⟡ Process</div>
        <h2>
          From open role to offer
          <br />
          in four steps
        </h2>
        <p className="section-desc section-desc--dim">
          HireFlow streamlines every stage of the recruitment lifecycle across
          all your locations.
        </p>

        <div className="steps-grid">
          {STEPS.map((s) => (
            <div className="step-card" key={s.num}>
              <div className={`step-num ${s.active ? "step-num--active" : ""}`}>
                {s.num}
              </div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BranchesSection() {
  return (
    <section id="branches" className="section">
      <div className="section-inner">
        <div className="branches-layout">
          <div className="branches-text">
            <div className="section-badge">⊕ Multibranch</div>
            <h2>One company, many locations — zero chaos.</h2>
            <p className="section-desc" style={{ maxWidth: "100%" }}>
              Whether you have 3 offices or 30, HireFlow gives each branch its
              own hiring environment while keeping HQ in full control. Permissions,
              pipelines and reports are all branch-aware.
            </p>
            <ul className="branches-list">
              {[
                "Branch-level dashboards with isolated candidate pools",
                "HQ overlay view for cross-branch comparison and reporting",
                "Share candidates between branches for internal mobility",
                "Custom workflows and approval chains per location",
              ].map((item) => (
                <li key={item}>
                  <span className="list-icon">✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="branch-viz">
            <div className="branch-hub">
              <div className="branch-hub-label">🏢 HQ — Central Dashboard</div>
              <div className="branch-hub-sub">
                Full visibility · Role consolidation · Analytics
              </div>
            </div>
            <div className="branches-row">
              {BRANCHES.map((b) => (
                <div className="branch-node" key={b.city}>
                  <div className="branch-icon">📍</div>
                  <div className="branch-node-label">{b.city}</div>
                  <div className="branch-node-loc">{b.roles}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="section section--white">
      <div className="section-inner">
        <div className="section-badge">❝ Testimonials</div>
        <h2>Loved by HR teams everywhere</h2>
        <div className="testimonials-grid">
          {TESTIMONIALS.map((t) => (
            <div className="testimonial-card" key={t.name}>
              <div className="t-stars">★★★★★</div>
              <p className="t-quote">"{t.quote}"</p>
              <div className="t-author">
                <div className={`avatar ${t.avatarClass}`}>{t.initials}</div>
                <div>
                  <div className="t-name">{t.name}</div>
                  <div className="t-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="section">
      <div className="section-inner">
        <div className="section-badge">◈ Pricing</div>
        <h2>Simple, transparent pricing</h2>
        <p className="section-desc">
          Scale your plan as your company grows. No hidden fees, no per-seat
          surprises.
        </p>
        <div className="pricing-grid">
          {PLANS.map((p) => (
            <div
              className={`price-card ${p.popular ? "price-card--popular" : ""}`}
              key={p.name}
            >
              {p.popular && <div className="popular-badge">Most Popular</div>}
              <div className="price-plan">{p.name}</div>
              <div className="price-amount">{p.price}</div>
              <div className="price-period">{p.period}</div>
              <ul className="price-features">
                {p.features.map((f) => (
                  <li key={f}>
                    <span className="check-icon">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button className="btn-plan">{p.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  const [form, setForm] = useState({ name: "", email: "", company: "" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thanks ${form.name}! We'll be in touch soon.`);
  };

  return (
    <section className="cta-section">
      <div className="cta-card">
        <div className="cta-text">
          <h2>Ready to transform your hiring?</h2>
          <p className="cta-sub">
            Join 340+ companies already using HireFlow to build great teams —
            faster, smarter, and with less overhead.
          </p>
        </div>
        <form className="cta-form" onSubmit={handleSubmit}>
          <div className="cta-input-row">
            <input
              className="cta-input"
              type="text"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
            />
            <input
              className="cta-input"
              type="email"
              name="email"
              placeholder="Work email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <input
            className="cta-input"
            type="text"
            name="company"
            placeholder="Company name"
            value={form.company}
            onChange={handleChange}
          />
          <button type="submit" className="cta-btn">
            Start your free 14-day trial →
          </button>
          <p className="cta-note">No credit card required. Cancel anytime.</p>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    {
      heading: "Product",
      links: ["Features", "Pricing", "Integrations", "Changelog"],
    },
    {
      heading: "Company",
      links: ["About", "Blog", "Careers", "Press"],
    },
    {
      heading: "Resources",
      links: ["Documentation", "API Reference", "Help Center", "Status"],
    },
    {
      heading: "Legal",
      links: ["Privacy Policy", "Terms of Use", "Security", "GDPR"],
    },
  ];

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <a href="#" className="nav-logo">
              <span className="logo-dot" />
              HireFlow
            </a>
            <p>
              Multibranch ATS for modern HR teams. Built to scale with your
              organization.
            </p>
          </div>
          {cols.map((col) => (
            <div className="footer-col" key={col.heading}>
              <h4>{col.heading}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">
            © 2025 HireFlow Technologies. All rights reserved.
          </div>
          <div className="footer-links-bottom">
            {["Twitter", "LinkedIn", "GitHub"].map((l) => (
              <a href="#" key={l}>{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── ROOT COMPONENT ──────────────────────────────────────

export default function Home() {
  return (
    <div className="home-root">
      <Navbar />
      <main>
        <HeroSection />
        <LogosSection />
        <FeaturesSection />
        <HowSection />
        <BranchesSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
