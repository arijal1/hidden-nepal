"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

// ─── AI Planner Teaser ────────────────────────────────

export function PlannerTeaser() {
  const [days, setDays] = useState(7);
  const [budget, setBudget] = useState(800);
  const [style, setStyle] = useState("Adventure");

  return (
    <section className="py-20 px-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-aurora pointer-events-none" />
      <div className="container max-w-[680px] mx-auto relative">
        <AnimatedSection className="text-center mb-12 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-brand-500/60" />
            <span className="text-brand-400 text-xs font-mono tracking-[0.3em] uppercase">Chapter 04 · Plan</span>
            <div className="h-px w-10 bg-brand-500/60" />
          </div>
          <h2 className="font-display text-white leading-[1.05] tracking-[-0.01em]" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
            Your trip,<br />
            <span className="italic text-brand-400 font-normal">drafted in minutes.</span>
          </h2>
          <p className="text-white/55 text-base font-light mt-5 max-w-md mx-auto leading-relaxed">
            Tell us your days, budget, and style. We'll plan the rest.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="glass-card p-8 rounded-3xl">
            <Slider
              label="DAYS"
              min={3} max={30} value={days}
              displayValue={`${days} days`}
              onChange={setDays}
              color="#52b788"
            />
            <Slider
              label="BUDGET"
              min={300} max={5000} step={100} value={budget}
              displayValue={`$${budget} USD`}
              onChange={setBudget}
              color="#f4a261"
            />
            <div className="mb-6">
              <p className="text-white/40 text-xs font-mono tracking-widest uppercase mb-3">TRAVEL STYLE</p>
              <div className="flex flex-wrap gap-2">
                {["Adventure", "Cultural", "Luxury", "Backpacker", "Photography"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-4 py-2 rounded-full border text-sm transition-all duration-200 ${
                      style === s
                        ? "border-brand-500/50 bg-brand-500/12 text-brand-400"
                        : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Link
              href={`/plan?days=${days}&budget=${budget}&style=${style}`}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-xl text-base"
            >
              <span>✦</span> Generate {days}-Day {style} Itinerary
            </Link>
            <p className="text-white/20 text-xs text-center mt-3 font-mono">
              Includes transport, accommodation & hidden gems
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

function Slider({ label, min, max, step = 1, value, displayValue, onChange, color }: any) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-white/40 text-xs font-mono tracking-widest uppercase">{label}</span>
        <span className="text-sm font-mono font-medium" style={{ color }}>{displayValue}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full h-1.5 rounded-full outline-none cursor-pointer"
        style={{
          accentColor: color,
          background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.1) 100%)`,
        }}
      />
    </div>
  );
}

// ─── Festival Calendar ────────────────────────────────

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const FESTIVALS = [
  { name: "Dashain", month: 9, color: "#e76f51" },
  { name: "Tihar", month: 10, color: "#f4a261" },
  { name: "Holi", month: 2, color: "#e9c46a" },
  { name: "Indra Jatra", month: 8, color: "#2d6a4f" },
  { name: "Shivaratri", month: 1, color: "#6b4c7d" },
  { name: "Buddha Jayanti", month: 4, color: "#f4a261" },
];

export function FestivalCalendar() {
  return (
    <section className="py-20 px-5">
      <div className="container max-w-[1200px] mx-auto">
        <AnimatedSection className="mb-10">
          <p className="text-gold-400 text-[10px] font-mono tracking-widest uppercase mb-3">◈ Culture & Festivals</p>
          <h2 className="text-display-md text-white">Nepal's living culture</h2>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="grid grid-cols-12 gap-2 mb-12">
          {MONTHS.map((m, i) => {
            const fest = FESTIVALS.find(f => f.month === i);
            return (
              <div
                key={m}
                className="rounded-xl p-3 text-center border transition-colors cursor-pointer"
                style={{
                  background: fest ? `${fest.color}18` : "rgba(255,255,255,0.02)",
                  borderColor: fest ? `${fest.color}35` : "rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-white/30 text-[10px] font-mono mb-1">{m}</p>
                {fest && <p style={{ color: fest.color }} className="text-[9px] font-semibold leading-tight">{fest.name}</p>}
              </div>
            );
          })}
        </AnimatedSection>

        <AnimatedSection delay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden">
            {[
              { icon: "🙏", title: "Spirituality", desc: "Hindu & Buddhist temples, rituals, and pilgrimages woven into daily life" },
              { icon: "🎭", title: "Festivals", desc: "50+ festivals a year — from Dashain to Indra Jatra, each with centuries of history" },
              { icon: "🍛", title: "Local Food", desc: "Dal Bhat, Momo, Sel Roti — taste Nepal's authentic culinary heritage" },
            ].map((item) => (
              <div key={item.title} className="bg-base-950 p-8 hover:bg-white/[0.02] transition-colors cursor-pointer">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="text-white font-display font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ─── Safety Banner ────────────────────────────────────

export function SafetyBanner() {
  return (
    <section className="py-4 px-5 bg-gold-500/[0.04] border-y border-gold-500/15">
      <div className="container max-w-[1200px] mx-auto flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
          <span className="text-white/25 text-[10px] font-mono tracking-widest uppercase">Live Safety</span>
        </div>
        <div className="flex gap-6 flex-1 flex-wrap">
          {[
            { status: "✓", label: "No active weather alerts", color: "text-brand-400" },
            { status: "✓", label: "Major roads: Open", color: "text-brand-400" },
            { status: "⚠", label: "Monsoon advisory active Jun–Sep", color: "text-gold-400" },
          ].map((item, i) => (
            <span key={i} className={`text-sm flex items-center gap-1.5 ${item.color}`}>
              {item.status} {item.label}
            </span>
          ))}
        </div>
        <Link href="/safety" className="text-[10px] font-mono text-gold-500/60 border border-gold-500/25 rounded-full px-3 py-1 hover:text-gold-400 transition-colors whitespace-nowrap">
          VIEW ALL ALERTS
        </Link>
      </div>
    </section>
  );
}

// ─── Home CTA ─────────────────────────────────────────

export function HomeCTA() {
  return (
    <section className="py-28 px-5 relative overflow-hidden text-center">
      <div
        className="absolute inset-0 opacity-15"
        style={{ backgroundImage: "url(https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Khumbutse%2C_Changtse%2C_Everest%2C_Nuptse_from_Kala_Patthar.jpg/1600px-Khumbutse%2C_Changtse%2C_Everest%2C_Nuptse_from_Kala_Patthar.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 bg-aurora" />
      <div className="relative max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-3 mb-8">
          <div className="h-px w-10 bg-brand-500/60" />
          <span className="text-brand-400 text-[11px] font-mono tracking-[0.35em] uppercase">The Mountains Are Calling</span>
          <div className="h-px w-10 bg-brand-500/60" />
        </div>
        <h2 className="font-display text-white leading-[0.98] tracking-[-0.02em] mb-6" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
          Nepal is waiting.<br />
          <span className="italic text-brand-400 font-normal">Are you?</span>
        </h2>
        <p className="text-white/55 text-base font-light mb-10 max-w-md mx-auto leading-relaxed">
          Pack lightly. Walk slowly. The best Nepal is the one nobody told you about.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/plan" className="btn-primary px-10 py-4 rounded-xl text-base flex items-center gap-2">
            Start Planning for Free ✦
          </Link>
          <Link href="/destinations" className="btn-ghost px-10 py-4 rounded-xl text-base">
            Browse Destinations
          </Link>
        </div>
      </div>
    </section>
  );
}
