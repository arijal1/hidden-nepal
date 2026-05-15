import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-base-950 flex items-center justify-center px-5">
      <div className="text-center max-w-lg">
        {/* Big number */}
        <p className="text-[120px] font-display font-medium text-white/[0.06] leading-none select-none mb-2">
          404
        </p>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center text-white text-3xl mx-auto mb-6 -mt-8">
          ◈
        </div>

        <h1 className="text-white font-display text-3xl font-medium mb-3">
          Lost in the Himalayas
        </h1>
        <p className="text-white/40 text-base font-light leading-relaxed mb-8">
          This trail doesn't exist on our map. The page you're looking for has moved, been removed, or never existed.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/" className="btn-primary px-7 py-3 rounded-xl text-sm flex items-center gap-2">
            ← Back to Home
          </Link>
          <Link href="/destinations" className="btn-ghost px-7 py-3 rounded-xl text-sm">
            Browse Destinations
          </Link>
        </div>

        {/* Suggestions */}
        <div className="mt-12 pt-8 border-t border-white/[0.06]">
          <p className="text-white/25 text-xs font-mono uppercase tracking-widest mb-5">
            You might be looking for
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "Rara Lake", href: "/destinations/rara-lake" },
              { label: "EBC Trek", href: "/treks/everest-base-camp" },
              { label: "Hidden Gems", href: "/hidden-gems" },
              { label: "Plan a Trip", href: "/plan" },
              { label: "Explore Map", href: "/explore" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-mono text-white/40 border border-white/[0.08] rounded-full px-3 py-1.5 hover:text-white/70 hover:border-white/20 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
