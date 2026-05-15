"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePlannerStore } from "@/stores/plannerStore";
import type { GeneratedItinerary, ItineraryDay, TravelStyle, TrekDifficulty } from "@/types";
import { cn } from "@/lib/utils/formatters";

// ─── Constants ────────────────────────────────────────

const INTERESTS = [
  { label: "Trekking & Hiking", icon: "🥾" },
  { label: "Photography", icon: "📸" },
  { label: "Temples & Spirituality", icon: "🙏" },
  { label: "Local Food & Cuisine", icon: "🍛" },
  { label: "Wildlife & Nature", icon: "🦎" },
  { label: "Hidden Gems", icon: "✦" },
  { label: "Cultural Immersion", icon: "🎭" },
  { label: "Adventure Sports", icon: "🪂" },
  { label: "Meditation & Yoga", icon: "🧘" },
  { label: "Village Life", icon: "🏡" },
  { label: "Himalayan Views", icon: "🏔️" },
  { label: "Festivals", icon: "🎉" },
];

const TRAVEL_STYLES: { value: TravelStyle; label: string; desc: string; icon: string }[] = [
  { value: "budget", label: "Budget", desc: "Dal bhat & hostels", icon: "🎒" },
  { value: "backpacker", label: "Backpacker", desc: "Flexible & adventurous", icon: "🌿" },
  { value: "mid_range", label: "Mid Range", desc: "Comfort + culture", icon: "🏨" },
  { value: "adventure", label: "Adventure", desc: "Trekking & wild camps", icon: "⛺" },
  { value: "luxury", label: "Luxury", desc: "Boutique & private", icon: "✨" },
];

const TREKKING_LEVELS: { value: TrekDifficulty; label: string; desc: string }[] = [
  { value: "easy", label: "Easy", desc: "Short walks, no technical" },
  { value: "moderate", label: "Moderate", desc: "Multi-day treks, 5–6h days" },
  { value: "strenuous", label: "Strenuous", desc: "Long days, high altitude" },
  { value: "extreme", label: "Extreme", desc: "Technical, 5,000m+ passes" },
];

// ─── Step Components ──────────────────────────────────

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              i < step ? "bg-brand-400" : i === step ? "bg-brand-400 scale-125" : "bg-white/20"
            )}
          />
          {i < total - 1 && (
            <div className={cn("h-px w-6 transition-all duration-500", i < step - 1 ? "bg-brand-400" : "bg-white/10")} />
          )}
        </div>
      ))}
      <span className="ml-2 text-white/30 text-xs font-mono">
        Step {step + 1} of {total}
      </span>
    </div>
  );
}

function StepDuration() {
  const { input, setDays } = usePlannerStore();
  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-white/50 text-sm font-mono uppercase tracking-wider">Trip Duration</span>
          <span className="text-brand-400 font-display text-4xl font-medium">{input.days} days</span>
        </div>
        <input
          type="range" min={3} max={30} value={input.days}
          onChange={(e) => setDays(+e.target.value)}
          className="w-full h-1.5 rounded-full cursor-pointer accent-brand-400"
          style={{ background: `linear-gradient(to right, #52b788 0%, #52b788 ${((input.days - 3) / 27) * 100}%, rgba(255,255,255,0.1) ${((input.days - 3) / 27) * 100}%, rgba(255,255,255,0.1) 100%)` }}
        />
        <div className="flex justify-between text-white/20 text-xs font-mono mt-2">
          <span>3 days</span>
          <span>2 weeks</span>
          <span>1 month</span>
        </div>
      </div>

      {/* Presets */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { days: 5, label: "Long Weekend", icon: "🌅" },
          { days: 10, label: "Classic Nepal", icon: "🏔️" },
          { days: 21, label: "Deep Immersion", icon: "🌿" },
        ].map((p) => (
          <button
            key={p.days}
            onClick={() => setDays(p.days)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all duration-200",
              input.days === p.days
                ? "border-brand-500/50 bg-brand-500/10 text-white"
                : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:bg-white/[0.06]"
            )}
          >
            <div className="text-xl mb-1">{p.icon}</div>
            <div className="text-sm font-medium">{p.label}</div>
            <div className="text-xs font-mono text-white/30 mt-0.5">{p.days} days</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepBudget() {
  const { input, setBudget } = usePlannerStore();

  const presets = [
    { amount: 400, label: "Shoestring", desc: "Teahouses & dal bhat" },
    { amount: 800, label: "Balanced", desc: "Comfort + local feel" },
    { amount: 1600, label: "Comfortable", desc: "Hotels & guides" },
    { amount: 3500, label: "Premium", desc: "Boutique & private tours" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-white/50 text-sm font-mono uppercase tracking-wider">Total Budget (USD)</span>
          <span className="text-gold-400 font-display text-4xl font-medium">${input.budgetUsd.toLocaleString()}</span>
        </div>
        <input
          type="range" min={300} max={6000} step={50} value={input.budgetUsd}
          onChange={(e) => setBudget(+e.target.value)}
          className="w-full h-1.5 rounded-full cursor-pointer accent-gold-400"
          style={{ background: `linear-gradient(to right, #f4a261 0%, #f4a261 ${((input.budgetUsd - 300) / 5700) * 100}%, rgba(255,255,255,0.1) ${((input.budgetUsd - 300) / 5700) * 100}%, rgba(255,255,255,0.1) 100%)` }}
        />
        <p className="text-white/25 text-xs mt-2">Excludes international flights. Per person estimate.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {presets.map((p) => (
          <button
            key={p.amount}
            onClick={() => setBudget(p.amount)}
            className={cn(
              "p-4 rounded-xl border text-left transition-all duration-200",
              input.budgetUsd === p.amount
                ? "border-gold-400/40 bg-gold-400/[0.08] text-white"
                : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:bg-white/[0.06]"
            )}
          >
            <div className="text-sm font-medium">{p.label}</div>
            <div className="text-xs font-mono text-gold-400/70 mt-0.5">${p.amount.toLocaleString()} USD</div>
            <div className="text-xs text-white/30 mt-0.5">{p.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StepStyle() {
  const { input, setTravelStyle, setTrekkingLevel, toggleInterest } = usePlannerStore();

  return (
    <div className="space-y-8">
      {/* Travel style */}
      <div>
        <p className="text-white/50 text-sm font-mono uppercase tracking-wider mb-4">Travel Style</p>
        <div className="grid grid-cols-5 gap-2">
          {TRAVEL_STYLES.map((style) => (
            <button
              key={style.value}
              onClick={() => setTravelStyle(style.value)}
              className={cn(
                "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200",
                input.travelStyle === style.value
                  ? "border-brand-500/50 bg-brand-500/10"
                  : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
              )}
            >
              <span className="text-xl">{style.icon}</span>
              <span className={cn("text-xs font-medium", input.travelStyle === style.value ? "text-brand-400" : "text-white/60")}>
                {style.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Trekking level */}
      <div>
        <p className="text-white/50 text-sm font-mono uppercase tracking-wider mb-4">Trekking Fitness</p>
        <div className="grid grid-cols-2 gap-2">
          {TREKKING_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => setTrekkingLevel(level.value)}
              className={cn(
                "p-3 rounded-xl border text-left transition-all duration-200",
                input.trekkingLevel === level.value
                  ? "border-brand-500/50 bg-brand-500/10"
                  : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
              )}
            >
              <span className={cn("text-sm font-medium", input.trekkingLevel === level.value ? "text-brand-400" : "text-white/70")}>
                {level.label}
              </span>
              <span className="text-xs text-white/30 block mt-0.5">{level.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interests */}
      <div>
        <p className="text-white/50 text-sm font-mono uppercase tracking-wider mb-4">
          Interests <span className="text-white/20">(pick any)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((interest) => {
            const active = input.interests.includes(interest.label);
            return (
              <button
                key={interest.label}
                onClick={() => toggleInterest(interest.label)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full border text-sm transition-all duration-200",
                  active
                    ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                    : "border-white/[0.1] bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/70"
                )}
              >
                <span>{interest.icon}</span>
                {interest.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Itinerary Result ─────────────────────────────────

function DayCard({ day, isActive, onClick }: { day: ItineraryDay; isActive: boolean; onClick: () => void }) {
  return (
    <div
      className={cn(
        "rounded-2xl border cursor-pointer transition-all duration-300",
        isActive ? "border-brand-500/40 bg-brand-500/[0.05]" : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04]"
      )}
      onClick={onClick}
    >
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-mono shrink-0",
            isActive ? "bg-brand-500 text-white" : "bg-white/[0.07] text-white/50"
          )}>
            {day.day}
          </div>
          <div>
            <p className="text-white/80 font-medium text-sm">{day.location}</p>
            <p className="text-white/35 text-xs italic mt-0.5">{day.theme}</p>
          </div>
        </div>
        <motion.span
          animate={{ rotate: isActive ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-white/20 text-sm shrink-0 mt-1"
        >
          ↓
        </motion.span>
      </div>

      <AnimatePresence initial={false}>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5">
              <div className="h-px bg-white/[0.06]" />

              {/* Activities */}
              <div className="space-y-3">
                {day.activities.map((act, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="text-white/30 text-xs font-mono w-10 text-right">{act.time}</span>
                      {i < day.activities.length - 1 && (
                        <div className="w-px flex-1 bg-white/[0.06] my-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-white/80 text-sm font-medium">{act.title}</p>
                        {act.hiddenGem && <span className="gem-badge text-[8px]">Gem</span>}
                      </div>
                      <p className="text-white/40 text-xs leading-relaxed mt-0.5">{act.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Meals */}
              <div className="grid grid-cols-3 gap-2">
                {day.meals.map((meal, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <p className="text-white/30 text-[10px] font-mono uppercase tracking-wider">{meal.meal}</p>
                    <p className="text-white/60 text-xs mt-1">{meal.localDish}</p>
                  </div>
                ))}
              </div>

              {/* Transport */}
              {day.transport?.from !== day.transport?.to && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-white/30 text-sm">🚌</span>
                  <div className="flex-1">
                    <p className="text-white/60 text-xs">
                      {day.transport.from} → {day.transport.to} · {day.transport.method}
                    </p>
                    <p className="text-white/30 text-xs">{day.transport.duration} · ${day.transport.estimatedCostUsd}</p>
                  </div>
                </div>
              )}

              {/* Accommodation */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-white/30 text-sm">🏨</span>
                <div>
                  <p className="text-white/60 text-xs font-medium">{day.accommodation.name}</p>
                  <p className="text-white/30 text-xs">{day.accommodation.type} · ~${day.accommodation.estimatedCostUsd}/night</p>
                </div>
              </div>

              {/* Tips */}
              {day.tips?.length > 0 && (
                <div className="space-y-1">
                  {day.tips.map((tip, i) => (
                    <p key={i} className="text-white/35 text-xs flex gap-2">
                      <span className="text-brand-400 shrink-0">💡</span> {tip}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ItineraryResult({ itinerary }: { itinerary: GeneratedItinerary }) {
  const [activeDay, setActiveDay] = useState(1);
  const total = Object.values(itinerary.totalBudgetBreakdown).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center pb-6 border-b border-white/[0.07]">
        <div className="inline-flex items-center gap-2 text-brand-400 text-xs font-mono tracking-wider uppercase mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-slow" />
          AI Generated
        </div>
        <h2 className="text-display-sm text-white mb-2">{itinerary.title}</h2>
        <p className="text-white/45 text-sm leading-relaxed max-w-xl mx-auto">{itinerary.summary}</p>
      </div>

      {/* Budget breakdown */}
      <div className="glass-card p-5">
        <p className="section-label mb-4">Budget Breakdown — ~${total.toLocaleString()} total</p>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(itinerary.totalBudgetBreakdown).map(([key, val]) => (
            <div key={key}>
              <p className="text-white/25 text-[10px] font-mono uppercase tracking-wider">{key}</p>
              <p className="text-white/80 text-lg font-display mt-0.5">${val}</p>
              <div className="mt-1.5 h-1 bg-white/[0.07] rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gradient rounded-full"
                  style={{ width: `${(val / total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day-by-day */}
      <div>
        <p className="section-label mb-4">Day-by-Day Itinerary</p>
        <div className="space-y-2">
          {itinerary.days.map((day) => (
            <DayCard
              key={day.day}
              day={day}
              isActive={activeDay === day.day}
              onClick={() => setActiveDay(activeDay === day.day ? -1 : day.day)}
            />
          ))}
        </div>
      </div>

      {/* Hidden gems */}
      {itinerary.hiddenGems?.length > 0 && (
        <div className="glass-card p-5 border-gold-500/20">
          <p className="text-gold-400 text-xs font-mono tracking-wider uppercase mb-4">✦ Hidden Gems in this Itinerary</p>
          <div className="space-y-3">
            {itinerary.hiddenGems.map((gem, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-gold-400 shrink-0">◈</span>
                <div>
                  <p className="text-white/80 text-sm font-medium">{gem.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{gem.why}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permits */}
      {itinerary.permits?.length > 0 && (
        <div className="glass-card p-5">
          <p className="section-label mb-4">Permits Required</p>
          <div className="space-y-3">
            {itinerary.permits.map((permit, i) => (
              <div key={i} className="flex justify-between items-start gap-4 py-2 border-b border-white/[0.05] last:border-0">
                <div>
                  <p className="text-white/70 text-sm">{permit.name}</p>
                  <p className="text-white/30 text-xs mt-0.5">{permit.whereToGet}</p>
                </div>
                <span className="text-brand-400 text-sm font-mono whitespace-nowrap">{permit.cost}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button className="btn-primary flex-1 text-sm py-3.5 rounded-xl flex items-center justify-center gap-2">
          ↓ Save Itinerary
        </button>
        <button className="btn-ghost flex-1 text-sm py-3.5 rounded-xl">
          Share ↗
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────

export default function PlanPage() {
  const { input, isGenerating, itinerary, streamingText, error,
    setGenerating, setItinerary, appendStreamingText, clearStreamingText, setError } = usePlannerStore();
  const [step, setStep] = useState(0);

  const steps = [
    { label: "Duration", component: <StepDuration /> },
    { label: "Budget", component: <StepBudget /> },
    { label: "Style", component: <StepStyle /> },
  ];

  const generate = async () => {
    setGenerating(true);
    clearStreamingText();
    setItinerary(null);
    setError(null);

    try {
      const res = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) throw new Error("API error");
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        appendStreamingText(chunk);
      }

      // Extract JSON from response (Claude may add prose around JSON)
      let jsonText = accumulated.trim();
      // Strip markdown code fences if present
      jsonText = jsonText.replace(/^```(?:json)?\n?/gm, "").replace(/\n?```\s*$/gm, "");
      // Extract JSON object boundaries
      const firstBrace = jsonText.indexOf("{");
      const lastBrace = jsonText.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No JSON found in response");
      }
      jsonText = jsonText.slice(firstBrace, lastBrace + 1);
      const parsed: GeneratedItinerary = JSON.parse(jsonText);
      setItinerary(parsed);
    } catch (err) {
      console.error("[planner parse]", err);
      setError("Failed to generate itinerary. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-950">
      {/* Page header */}
      <section className="border-b border-white/[0.06] py-16">
        <div className="container max-w-[800px] mx-auto px-5 text-center">
          <p className="section-label mb-3">AI Itinerary Planner</p>
          <h1 className="text-display-lg text-white mb-4">
            Your perfect Nepal journey,
            <br />
            <em className="italic text-brand-400">built in seconds</em>
          </h1>
          <p className="text-white/40 text-base font-light max-w-md mx-auto">
            Answer three questions. Get a full day-by-day Nepal itinerary with hidden gems, local food, and transport details.
          </p>
        </div>
      </section>

      <div className="container max-w-[900px] mx-auto px-5 py-16">
        {!itinerary ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div>
              <StepIndicator step={step} total={steps.length} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="text-white/80 text-xl font-display mb-6">
                    {step === 0 && "How long is your trip?"}
                    {step === 1 && "What's your budget?"}
                    {step === 2 && "What's your travel style?"}
                  </h2>
                  {steps[step].component}
                </motion.div>
              </AnimatePresence>

              <div className="flex gap-3 mt-8">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="btn-ghost px-6 py-3 rounded-xl text-sm"
                  >
                    ← Back
                  </button>
                )}
                {step < steps.length - 1 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="btn-primary flex-1 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    onClick={generate}
                    disabled={isGenerating}
                    className="btn-primary flex-1 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <><span>✦</span> Generate Itinerary</>
                    )}
                  </button>
                )}
              </div>

              {error && (
                <p className="text-gold-500 text-sm mt-4 text-center">{error}</p>
              )}
            </div>

            {/* Preview panel */}
            <div className="hidden lg:block">
              <div className="glass-card p-6 rounded-2xl sticky top-24">
                <p className="section-label mb-5">Your Trip Summary</p>
                <dl className="space-y-4">
                  <SummaryRow label="Duration" value={`${input.days} days`} />
                  <SummaryRow label="Budget" value={`$${input.budgetUsd.toLocaleString()} USD`} />
                  <SummaryRow label="Style" value={TRAVEL_STYLES.find(s => s.value === input.travelStyle)?.label ?? input.travelStyle} />
                  <SummaryRow label="Trekking" value={input.trekkingLevel} />
                  {input.interests.length > 0 && (
                    <SummaryRow
                      label="Interests"
                      value={input.interests.slice(0, 3).join(", ") + (input.interests.length > 3 ? "…" : "")}
                    />
                  )}
                </dl>

                {isGenerating && streamingText && (
                  <div className="mt-6 pt-6 border-t border-white/[0.07]">
                    <p className="text-white/25 text-xs font-mono mb-2">AI writing your journey...</p>
                    <p className="text-white/40 text-xs leading-relaxed line-clamp-4">
                      {streamingText.slice(-200)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <ItineraryResult itinerary={itinerary} />
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-white/30 text-xs font-mono uppercase tracking-wider">{label}</dt>
      <dd className="text-white/70 text-sm capitalize text-right">{value}</dd>
    </div>
  );
}
