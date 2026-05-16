"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils/formatters";

// ─── Types ────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  submenu?: SubItem[];
}

interface SubItem {
  label: string;
  href: string;
  description: string;
  icon: string;
}

// ─── Data ─────────────────────────────────────────────

const navItems: NavItem[] = [
  {
    label: "Explore",
    href: "/explore",
    submenu: [
      { label: "All Destinations", href: "/destinations", description: "Browse every place in Nepal", icon: "◈" },
      { label: "Hidden Gems", href: "/hidden-gems", description: "Places even locals keep secret", icon: "✦" },
      { label: "By Province", href: "/explore/provinces", description: "Filter by Nepal's 7 provinces", icon: "🗺" },
      { label: "Near Me", href: "/nearby", description: "Destinations close to your location", icon: "📍" },
    ],
  },
  {
    label: "Trekking",
    href: "/treks",
    submenu: [
      { label: "All Routes", href: "/treks", description: "Every major trekking route", icon: "🥾" },
      { label: "EBC Trek", href: "/treks/everest-base-camp", description: "The classic Everest journey", icon: "🏔️" },
      { label: "Annapurna Circuit", href: "/treks/annapurna-circuit", description: "Around the Annapurna massif", icon: "⛰️" },
      { label: "Manaslu Circuit", href: "/treks/manaslu-circuit", description: "Nepal's hidden trekking gem", icon: "🗻" },
    ],
  },
  { label: "Community", href: "/community" },
  { label: "Safety", href: "/safety" },
];

// ─── Search Bar ───────────────────────────────────────

function SearchBar({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-full left-0 right-0 mt-2 mx-4 z-50"
    >
      <div className="bg-base-950/95 backdrop-blur-2xl border border-white/[0.12] p-4 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-white/30 text-lg">🔍</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search destinations, treks, hidden gems..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-white placeholder:text-white/25 text-base outline-none font-body"
          />
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors text-sm">
            ESC
          </button>
        </div>

        {query.length > 0 ? (
          <p className="text-white/30 text-sm text-center py-4 font-mono">
            Searching for "{query}"...
          </p>
        ) : (
          <div className="space-y-1">
            <p className="text-white/25 text-xs font-mono tracking-wider uppercase mb-2">
              Popular
            </p>
            {["Rara Lake", "EBC Trek", "Upper Mustang", "Annapurna Circuit"].map((item) => (
              <Link
                key={item}
                href={`/search?q=${encodeURIComponent(item)}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
                onClick={onClose}
              >
                <span className="text-white/20 text-sm">↗</span>
                <span className="text-white/60 text-sm">{item}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Submenu ──────────────────────────────────────────

function Submenu({ items }: { items: SubItem[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 bg-base-950/95 backdrop-blur-2xl border border-white/[0.12] rounded-2xl p-2 shadow-2xl"
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.06] transition-all duration-200 group"
        >
          <span className="text-lg mt-0.5 w-6 text-center shrink-0">{item.icon}</span>
          <div>
            <p className="text-white/80 text-sm font-medium group-hover:text-white transition-colors">
              {item.label}
            </p>
            <p className="text-white/35 text-xs leading-snug mt-0.5">{item.description}</p>
          </div>
        </Link>
      ))}
    </motion.div>
  );
}

// ─── Mobile Menu ──────────────────────────────────────

function MobileMenu({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-50 w-80 bg-base-950 border-l border-white/[0.07] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/[0.07]">
              <span className="text-white font-display text-lg font-semibold">Menu</span>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white/80 transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.35 }}
                >
                  <Link
                    href={item.href}
                    className="block p-3 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.06] transition-all text-base"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                  {item.submenu && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="flex items-center gap-2 p-2 rounded-lg text-white/40 hover:text-white/70 transition-colors text-sm"
                          onClick={onClose}
                        >
                          <span className="text-xs">{sub.icon}</span>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </nav>

            {/* Footer actions */}
            <div className="p-4 border-t border-white/[0.07] space-y-3">
              <SignedOut>
                <SignInButton>
                  <button className="w-full btn-ghost py-3 text-sm rounded-xl">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <Link
                href="/plan"
                className="btn-primary w-full text-center block text-sm py-3 rounded-xl"
                onClick={onClose}
              >
                ✦ Plan My Trip
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Main Navbar ──────────────────────────────────────

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close submenu on route change
  useEffect(() => {
    setActiveSubmenu(null);
    setSearchOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveSubmenu(null);
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setActiveSubmenu(null);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const isTransparent = !scrolled && !searchOpen;

  return (
    <>
      {/* Prayer flag accent strip */}
      <div className="fixed top-0 left-0 right-0 z-[60] flex h-[3px] pointer-events-none">
        <div className="flex-1 bg-[#2a5d8f]" />
        <div className="flex-1 bg-[#f7f1e5]" />
        <div className="flex-1 bg-[#c84630]" />
        <div className="flex-1 bg-[#4a7c4e]" />
        <div className="flex-1 bg-[#e9a829]" />
      </div>
      <motion.header
        ref={navRef}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-400",
          scrolled || searchOpen
            ? "bg-base-950/92 backdrop-blur-2xl border-b border-white/[0.06]"
            : "bg-transparent"
        )}
        style={{ height: "var(--nav-height)", top: 3 }}
      >
        <div className="container max-w-[1440px] mx-auto px-5 h-full flex items-center justify-between gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="Hidden Nepal" className="h-12 w-auto object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center">
            <div className="nav-pill flex items-center gap-1 px-2 py-1.5">
              {navItems.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.submenu && setActiveSubmenu(item.label)}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm transition-all duration-200 flex items-center gap-1",
                      pathname.startsWith(item.href) && item.href !== "/"
                        ? "text-white bg-white/10"
                        : "text-white/55 hover:text-white/90"
                    )}
                  >
                    {item.label}
                    {item.submenu && (
                      <motion.span
                        animate={{ rotate: activeSubmenu === item.label ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[10px] opacity-50"
                      >
                        ↓
                      </motion.span>
                    )}
                  </Link>

                  {/* Submenu */}
                  <AnimatePresence>
                    {item.submenu && activeSubmenu === item.label && (
                      <Submenu items={item.submenu} />
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className={cn(
                "hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all duration-200",
                searchOpen
                  ? "bg-white/[0.08] border-white/20 text-white"
                  : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.07]"
              )}
            >
              <span>🔍</span>
              <span className="text-xs font-mono hidden md:block">⌘K</span>
            </button>

            {/* Auth */}
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-8 h-8",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton>
                <button className="hidden sm:block text-white/50 hover:text-white/80 text-sm transition-colors px-3 py-2">
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>

            {/* Plan CTA */}
            <Link
              href="/plan"
              className="btn-primary text-sm px-4 py-2 rounded-xl hidden md:flex items-center gap-2"
            >
              <span>✦</span>
              Plan Trip
            </Link>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden flex flex-col justify-center items-center gap-1.5 w-9 h-9"
              onClick={() => setMobileOpen(true)}
            >
              <span className="w-5 h-0.5 bg-white/60 rounded-full" />
              <span className="w-5 h-0.5 bg-white/60 rounded-full" />
              <span className="w-3 h-0.5 bg-white/60 rounded-full self-start" />
            </button>
          </div>
        </div>

        {/* Search dropdown */}
        <div className="relative">
          <AnimatePresence>
            {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
