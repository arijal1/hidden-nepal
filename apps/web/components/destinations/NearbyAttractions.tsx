// components/destinations/NearbyAttractions.tsx

import { getNearbyDestinations } from "@/lib/supabase/queries/destinations";
import Image from "next/image";
import Link from "next/link";

interface NearbyAttractionsProps {
  lat: number;
  lng: number;
  excludeId: string;
}

export async function NearbyAttractions({
  lat,
  lng,
  excludeId,
}: NearbyAttractionsProps) {
  const nearby = await getNearbyDestinations(lat, lng, 30, 6);
  const filtered = nearby.filter((d) => d.id !== excludeId).slice(0, 5);

  if (filtered.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
      {filtered.map((destination) => (
        <Link
          key={destination.id}
          href={`/destinations/${destination.slug}`}
          className="group"
        >
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden">
            <Image
              src={destination.coverImageUrl}
              alt={destination.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-card-gradient" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-sm font-medium leading-tight">
                {destination.name}
              </p>
              <p className="text-white/40 text-xs font-mono mt-0.5">
                {destination.category}
              </p>
            </div>
            {destination.isHiddenGem && (
              <div className="absolute top-2 left-2">
                <span className="gem-badge text-[8px]">Gem</span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
