// components/destinations/DestinationGallery.tsx

"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface DestinationGalleryProps {
  images: string[];
  coverImage: string;
  name: string;
}

export function DestinationGallery({ images, coverImage, name }: DestinationGalleryProps) {
  const allImages = [coverImage, ...images.filter((img) => img !== coverImage)].slice(0, 8);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {allImages.slice(0, 5).map((img, i) => (
          <div
            key={i}
            className={`relative rounded-xl overflow-hidden cursor-pointer group ${
              i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"
            }`}
            onClick={() => setLightboxIndex(i)}
          >
            <Image
              src={img}
              alt={`${name} photo ${i + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 300px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            {/* Show count on last visible */}
            {i === 4 && allImages.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xl font-semibold">
                  +{allImages.length - 5}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl p-2"
              onClick={() => setLightboxIndex(null)}
            >
              ✕
            </button>

            {/* Prev / Next */}
            {lightboxIndex > 0 && (
              <button
                className="absolute left-4 text-white/60 hover:text-white text-3xl p-4"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
              >
                ←
              </button>
            )}
            {lightboxIndex < allImages.length - 1 && (
              <button
                className="absolute right-4 text-white/60 hover:text-white text-3xl p-4"
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
              >
                →
              </button>
            )}

            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl max-h-[85vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImages[lightboxIndex]}
                alt={`${name} photo ${lightboxIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </motion.div>

            {/* Counter */}
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-sm font-mono">
              {lightboxIndex + 1} / {allImages.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
