// components/destinations/DestinationHero.tsx

"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import type { Destination } from "@/types";

export function DestinationHero({ destination }: { destination: Destination }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <div ref={containerRef} className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {/* Parallax image */}
      <motion.div style={{ y }} className="absolute inset-0 will-change-transform">
        <Image
          src={destination.coverImageUrl}
          alt={destination.name}
          fill
          priority
          sizes="100vw"
          className="object-cover scale-110"
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-r from-base-950/30 via-transparent to-transparent" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="absolute inset-0 flex flex-col justify-end"
      >
        <div className="container max-w-[1200px] mx-auto px-5 pb-12">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-center gap-2 text-white/40 text-xs font-mono tracking-wider uppercase mb-6"
          >
            <a href="/" className="hover:text-white/70 transition-colors">Home</a>
            <span>/</span>
            <a href="/destinations" className="hover:text-white/70 transition-colors">Destinations</a>
            <span>/</span>
            <span className="text-white/70">{destination.name}</span>
          </motion.nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
            <div>
              {/* Badges */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap items-center gap-2 mb-4"
              >
                {destination.isHiddenGem && (
                  <span className="gem-badge">✦ Hidden Gem</span>
                )}
                <span className="text-white/40 text-xs font-mono tracking-wider uppercase border border-white/10 rounded-full px-3 py-1">
                  {destination.category.replace("_", " ")}
                </span>
                {destination.province && (
                  <span className="text-white/40 text-xs font-mono tracking-wider uppercase border border-white/10 rounded-full px-3 py-1">
                    {destination.province}
                  </span>
                )}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="text-display-xl text-white leading-none mb-4"
              >
                {destination.name}
                {destination.nameNepali && (
                  <span className="block text-white/30 font-nepali text-3xl mt-2 font-normal">
                    {destination.nameNepali}
                  </span>
                )}
              </motion.h1>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-white/60 text-lg font-light leading-relaxed max-w-xl"
              >
                {destination.tagline}
              </motion.p>
            </div>

            {/* Rating + Coordinates */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="lg:text-right space-y-3"
            >
              <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full">
                <span className="text-gold-400">★</span>
                <span className="text-white font-semibold text-lg">{destination.avgRating}</span>
                <span className="text-white/40 text-sm">({destination.reviewCount} reviews)</span>
              </div>
              {destination.coordinates && (
                <p className="text-white/25 text-xs font-mono tracking-wider">
                  {destination.coordinates.lat.toFixed(4)}°N · {destination.coordinates.lng.toFixed(4)}°E
                  {destination.elevationM && ` · ${destination.elevationM.toLocaleString()}m`}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
