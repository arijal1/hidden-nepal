"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

type Festival = {
  name: string;
  nameNepali: string;
  date: string;
  endDate?: string;
  type: "hindu" | "buddhist" | "newari" | "tharu" | "national" | "cultural";
  region: string;
  description: string;
  season: "spring" | "summer" | "autumn" | "winter";
};

const FESTIVALS: Festival[] = [
  { name: "Maghe Sankranti", nameNepali: "माघे संक्रान्ति", date: "2026-01-14", type: "hindu", region: "Nationwide", description: "Marks the end of winter. Til ko laddu, sweet potatoes, and sesame treats are shared.", season: "winter" },
  { name: "Sonam Lhosar", nameNepali: "सोनम ल्होसार", date: "2026-02-18", type: "buddhist", region: "Tamang communities", description: "Tamang New Year — folk dances, traditional dress, family feasts.", season: "winter" },
  { name: "Maha Shivaratri", nameNepali: "महाशिवरात्रि", date: "2026-02-26", type: "hindu", region: "Pashupatinath, Kathmandu", description: "Night-long pilgrimage to Pashupatinath. Sadhus from across South Asia gather.", season: "winter" },
  { name: "Holi", nameNepali: "होली", date: "2026-03-14", type: "hindu", region: "Nationwide", description: "Festival of colors. The hills celebrate one day before the plains.", season: "spring" },
  { name: "Ghode Jatra", nameNepali: "घोडे जात्रा", date: "2026-04-06", type: "newari", region: "Tundikhel, Kathmandu", description: "Horse Festival — Nepal Army's horse parade to ward off a demon's spirit.", season: "spring" },
  { name: "Bisket Jatra", nameNepali: "बिस्केट जात्रा", date: "2026-04-13", endDate: "2026-04-22", type: "newari", region: "Bhaktapur, Thimi", description: "Bhaktapur's Newari New Year — massive chariot procession.", season: "spring" },
  { name: "Buddha Jayanti", nameNepali: "बुद्ध जयन्ती", date: "2026-05-25", type: "buddhist", region: "Lumbini · Boudhanath", description: "Birth, enlightenment, and parinirvana of Lord Buddha on the same full moon day.", season: "spring" },
  { name: "Janai Purnima", nameNepali: "जनै पूर्णिमा", date: "2026-08-09", type: "hindu", region: "Nationwide · Gosaikunda", description: "Sacred thread festival. Pilgrims trek to Gosaikunda Lake at 4,380m.", season: "summer" },
  { name: "Gai Jatra", nameNepali: "गाई जात्रा", date: "2026-08-10", type: "newari", region: "Bhaktapur · Kathmandu", description: "Cow Festival — families who lost loved ones in the past year parade through streets.", season: "summer" },
  { name: "Teej", nameNepali: "तिज", date: "2026-09-04", type: "hindu", region: "Nationwide", description: "Women's festival of fasting, red sarees, and song.", season: "autumn" },
  { name: "Indra Jatra", nameNepali: "इन्द्र जात्रा", date: "2026-09-26", endDate: "2026-10-03", type: "newari", region: "Kathmandu Durbar Square", description: "Eight days of masked dances, chariot processions, and the Living Goddess Kumari.", season: "autumn" },
  { name: "Dashain", nameNepali: "दशैं", date: "2026-10-18", endDate: "2026-10-26", type: "national", region: "Nationwide", description: "Nepal's biggest festival. Fifteen days of family reunions, blessings, and feasting.", season: "autumn" },
  { name: "Tihar", nameNepali: "तिहार", date: "2026-11-09", endDate: "2026-11-13", type: "national", region: "Nationwide", description: "Festival of lights. Five days honoring crows, dogs, cows, brothers, and Lakshmi.", season: "autumn" },
  { name: "Chhath", nameNepali: "छठ", date: "2026-11-16", endDate: "2026-11-19", type: "hindu", region: "Terai · Janakpur", description: "Four-day Sun God festival in the Madhesh. Pre-dawn river offerings and folk songs.", season: "autumn" },
  { name: "Yomari Punhi", nameNepali: "योमरि पुन्ही", date: "2026-12-04", type: "newari", region: "Kathmandu Valley", description: "Newari harvest celebration. Steamed dumplings filled with molasses and sesame.", season: "winter" },
  { name: "Tamu Lhosar", nameNepali: "तमु ल्होसार", date: "2026-12-30", type: "buddhist", region: "Gurung communities", description: "Gurung New Year. Pokhara comes alive with traditional Ghatu and Sorathi dances.", season: "winter" },
];

const SEASON_INFO = {
  spring: { label: "Spring", months: "Mar – May", color: "#52b788" },
  summer: { label: "Monsoon", months: "Jun – Aug", color: "#4a7c4e" },
  autumn: { label: "Autumn", months: "Sep – Nov", color: "#d97a3a" },
  winter: { label: "Winter", months: "Dec – Feb", color: "#2a5d8f" },
};

const TYPE_COLORS: Record<string, string> = {
  hindu: "#d97a3a",
  buddhist: "#e9a829",
  newari: "#c84630",
  tharu: "#4a7c4e",
  national: "#2a5d8f",
  cultural: "#9a8f80",
};

const BS_MONTHS_EN = ["Baisakh", "Jestha", "Ashar", "Shrawan", "Bhadra", "Ashoj", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];
const BS_MONTHS_NEPALI = ["बैशाख", "जेठ", "असार", "श्रावण", "भदौ", "आश्विन", "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत्र"];
const DAYS_NEPALI = ["आइतवार", "सोमवार", "मंगलवार", "बुधवार", "बिहीवार", "शुक्रवार", "शनिवार"];

const BS_BOUNDARIES: Array<[number, number, number]> = [
  [1, 14, 9], [2, 13, 10], [3, 14, 11], [4, 14, 0], [5, 14, 1], [6, 15, 2],
  [7, 17, 3], [8, 17, 4], [9, 17, 5], [10, 18, 6], [11, 17, 7], [12, 16, 8],
];

function toBikramSambat(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const bsNewYear = new Date(year, 3, 14);
  const bsYear = date >= bsNewYear ? year + 57 : year + 56;
  let bsMonthIdx = 8;
  for (let i = BS_BOUNDARIES.length - 1; i >= 0; i--) {
    const [eM, eD, bsM] = BS_BOUNDARIES[i];
    if (month > eM || (month === eM && day >= eD)) { bsMonthIdx = bsM; break; }
  }
  return {
    year: bsYear,
    monthEn: BS_MONTHS_EN[bsMonthIdx],
    monthNp: BS_MONTHS_NEPALI[bsMonthIdx],
    dayName: DAYS_NEPALI[date.getDay()],
  };
}

function getFestivalStatus(f: Festival, today: Date) {
  const start = new Date(f.date);
  const end = f.endDate ? new Date(f.endDate) : new Date(start.getTime() + 86400000);
  if (today >= start && today < end) return { status: "happening", daysAway: 0 };
  if (today < start) return { status: "upcoming", daysAway: Math.ceil((start.getTime() - today.getTime()) / 86400000) };
  return { status: "past", daysAway: 0 };
}

function getUpcoming(today: Date, limit = 3): Festival[] {
  return FESTIVALS.filter((f) => {
    const start = new Date(f.date);
    const end = f.endDate ? new Date(f.endDate) : new Date(start.getTime() + 86400000);
    return today < end;
  }).slice(0, limit);
}

function getCurrent(today: Date): Festival | null {
  return FESTIVALS.find((f) => {
    const start = new Date(f.date);
    const end = f.endDate ? new Date(f.endDate) : new Date(start.getTime() + 86400000);
    return today >= start && today < end;
  }) ?? null;
}

export function LivingCulture() {
  const [today, setToday] = useState<Date | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => { setToday(new Date()); }, []);

  if (!today) return <section className="py-20 px-5"><div className="container max-w-[1200px] mx-auto"><div className="h-96 bg-white/[0.02] rounded-2xl animate-pulse" /></div></section>;

  const bs = toBikramSambat(today);
  const current = getCurrent(today);
  const upcoming = getUpcoming(today, 3);
  const next = upcoming[0];

  return (
    <section className="py-20 px-5">
      <div className="container max-w-[1200px] mx-auto">
        <AnimatedSection className="mb-12 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-5">
            <div className="h-px w-10 bg-brand-500/60" />
            <span className="text-brand-400 text-xs font-mono tracking-[0.3em] uppercase">Chapter 05 · Living Culture</span>
            <div className="h-px w-10 bg-brand-500/60" />
          </div>
          <h2 className="font-display text-white leading-[1.05] tracking-[-0.01em]" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
            A country that<br />
            <span className="italic text-brand-400 font-normal">never stops celebrating.</span>
          </h2>
          <p className="text-white/55 text-base font-light mt-5 max-w-md mx-auto leading-relaxed">
            Over 50 festivals a year. Time your trip around one.
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.1} className="mb-10">
          <div className="relative bg-white/[0.04] border border-white/[0.08] rounded-2xl p-5 md:p-6 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8 md:items-center pl-3">
              <div>
                <p className="text-white/35 text-[10px] font-mono uppercase tracking-[0.25em] mb-2">Today in Nepal</p>
                <p className="text-white font-display text-2xl leading-tight">{bs.monthEn} {bs.year} BS</p>
                <p className="text-white/45 text-sm mt-1">{bs.dayName} · {bs.monthNp}</p>
              </div>
              {current ? (
                <div>
                  <p className="text-emerald-400 text-[10px] font-mono uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Happening Now
                  </p>
                  <p className="text-white font-display text-2xl leading-tight">{current.name}</p>
                  <p className="text-white/50 text-sm mt-1">{current.region}</p>
                </div>
              ) : next ? (
                <div>
                  <p className="text-brand-400 text-[10px] font-mono uppercase tracking-[0.25em] mb-2">Next Up</p>
                  <p className="text-white font-display text-2xl leading-tight">{next.name}</p>
                  <p className="text-white/50 text-sm mt-1">in {getFestivalStatus(next, today).daysAway} days · {next.region}</p>
                </div>
              ) : null}
              <div className="md:text-right">
                <p className="text-white/35 text-[10px] font-mono uppercase tracking-[0.25em] mb-2">This year</p>
                <p className="text-white font-display text-2xl leading-tight">{FESTIVALS.length} festivals</p>
                <p className="text-white/45 text-sm mt-1">across 7 provinces</p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.15} className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white/70 text-sm font-mono uppercase tracking-[0.2em]">Coming up</h3>
            <span className="text-white/30 text-xs font-mono">{upcoming.length} of {FESTIVALS.length}</span>
          </div>
          <div className="flex md:grid md:grid-cols-3 gap-4 overflow-x-auto md:overflow-visible -mx-5 px-5 md:mx-0 md:px-0 snap-x snap-mandatory">
            {upcoming.map((f) => {
              const { daysAway } = getFestivalStatus(f, today);
              const accent = TYPE_COLORS[f.type];
              return (
                <article key={f.name} className="min-w-[280px] md:min-w-0 snap-start bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:border-white/20 transition-colors flex flex-col" style={{ borderTop: "3px solid " + accent }}>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: accent + "18", color: accent }}>{f.type}</span>
                    <span className="text-white/40 text-xs font-mono">{daysAway === 0 ? "Today" : daysAway + "d"}</span>
                  </div>
                  <h4 className="text-white font-display text-2xl leading-tight mb-1">{f.name}</h4>
                  <p className="text-white/40 text-sm mb-3">{f.nameNepali}</p>
                  <p className="text-white/55 text-sm leading-relaxed mb-4 flex-1">{f.description}</p>
                  <div className="flex items-center gap-2 text-xs text-white/40 font-mono pt-3 border-t border-white/[0.06]">
                    <span>{new Date(f.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span>·</span>
                    <span className="truncate">{f.region}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.2} className="mb-10">
          <h3 className="text-white/70 text-sm font-mono uppercase tracking-[0.2em] mb-5">All year</h3>
          <div className="space-y-2">
            {(Object.keys(SEASON_INFO) as Array<keyof typeof SEASON_INFO>).map((season) => {
              const info = SEASON_INFO[season];
              const fests = FESTIVALS.filter((f) => f.season === season);
              const isOpen = expanded === season;
              return (
                <div key={season} className="bg-white/[0.025] border border-white/[0.06] rounded-xl overflow-hidden">
                  <button onClick={() => setExpanded(isOpen ? null : season)} className="w-full p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-12 rounded-full" style={{ background: info.color }} />
                      <div className="text-left">
                        <p className="text-white font-display text-xl">{info.label}</p>
                        <p className="text-white/40 text-xs font-mono mt-0.5">{info.months} · {fests.length} festivals</p>
                      </div>
                    </div>
                    <span className="text-white/40 text-xl transition-transform" style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 border-t border-white/[0.04] grid grid-cols-1 md:grid-cols-2 gap-3">
                      {fests.map((f) => (
                        <div key={f.name} className="flex gap-3 p-3 rounded-lg hover:bg-white/[0.02]">
                          <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: TYPE_COLORS[f.type] }} />
                          <div className="min-w-0">
                            <p className="text-white font-display text-base leading-tight">{f.name}</p>
                            <p className="text-white/45 text-xs mt-0.5">{new Date(f.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {f.region}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.25} className="text-center">
          <Link href="/plan" className="inline-flex items-center gap-2 border border-brand-500/40 hover:bg-brand-500/10 text-brand-400 px-6 py-3 rounded-md text-sm font-medium tracking-wide transition-all">
            Plan a trip around a festival
            <span>→</span>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}
