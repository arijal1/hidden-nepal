import Link from "next/link";

// ─── Data ─────────────────────────────────────────────

const footerLinks = {
  Explore: [
    { label: "All Destinations", href: "/destinations" },
    { label: "Hidden Gems", href: "/hidden-gems" },
    { label: "By Province", href: "/explore/provinces" },
    { label: "Near Me", href: "/nearby" },
    { label: "Seasonal Guide", href: "/explore/seasons" },
  ],
  Trekking: [
    { label: "All Routes", href: "/treks" },
    { label: "EBC Trek", href: "/treks/everest-base-camp" },
    { label: "Annapurna Circuit", href: "/treks/annapurna-circuit" },
    { label: "Manaslu Circuit", href: "/treks/manaslu-circuit" },
    { label: "Permit Guide", href: "/treks/permits" },
  ],
  Plan: [
    { label: "AI Itinerary Planner", href: "/plan" },
    { label: "How To Reach", href: "/plan/transport" },
    { label: "Budget Calculator", href: "/plan/budget" },
    { label: "Visa & Entry", href: "/plan/visa" },
    { label: "Packing Lists", href: "/plan/packing" },
  ],
  Community: [
    { label: "Submit a Gem", href: "/community/submit-gem" },
    { label: "Write a Review", href: "/community/review" },
    { label: "Travel Stories", href: "/community/stories" },
    { label: "Local Guides", href: "/community/guides" },
    { label: "Safety Alerts", href: "/safety" },
  ],
};

const socials = [
  { label: "Instagram", href: "https://instagram.com/hiddennepal", icon: "📸" },
  { label: "YouTube", href: "https://youtube.com/@hiddennepal", icon: "▶" },
  { label: "X (Twitter)", href: "https://x.com/hiddennepal", icon: "✕" },
  { label: "Facebook", href: "https://facebook.com/hiddennepal", icon: "f" },
];

// ─── Footer ───────────────────────────────────────────

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-black/30">
      {/* Main footer */}
      <div className="container max-w-[1200px] mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-[8px] bg-brand-gradient flex items-center justify-center text-white text-sm">
                ◈
              </div>
              <span className="text-white text-lg font-display font-semibold">
                Hidden Nepal
              </span>
            </Link>

            <p className="text-white/35 text-sm leading-relaxed mb-6">
              The premium digital companion for discovering Nepal's hidden side.
              Built by travelers, for travelers.
            </p>

            {/* Socials */}
            <div className="flex gap-2 flex-wrap">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.09] hover:border-white/20 transition-all duration-200 text-xs"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white/25 text-[10px] font-mono tracking-[0.2em] uppercase mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/45 text-sm hover:text-white/80 transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 p-8 rounded-2xl border border-white/[0.07] bg-brand-500/[0.04]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-display text-xl font-medium mb-1">
                Nepal, delivered to your inbox
              </h3>
              <p className="text-white/40 text-sm">
                New hidden gems, seasonal guides, safety alerts. No spam, ever.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="you@email.com"
                className="flex-1 md:w-64 bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder:text-white/25 text-sm outline-none focus:border-brand-500/50 transition-colors"
              />
              <button className="btn-primary px-5 py-3 rounded-xl text-sm whitespace-nowrap">
                Subscribe ✦
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.05]">
        <div className="container max-w-[1200px] mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-sm text-center sm:text-left">
            © 2025 Hidden Nepal. Made with ♥ in Kathmandu.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-white/20 text-xs hover:text-white/50 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/20 text-xs hover:text-white/50 transition-colors">
              Terms
            </Link>
            <Link href="/sitemap.xml" className="text-white/20 text-xs hover:text-white/50 transition-colors">
              Sitemap
            </Link>
            <div className="flex gap-1 ml-2">
              {["🇳🇵", "EN", "नेपाली"].map((item, i) => (
                <button
                  key={i}
                  className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.07] rounded-md text-white/30 text-[11px] font-mono hover:text-white/60 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
