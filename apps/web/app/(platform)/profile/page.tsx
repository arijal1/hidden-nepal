import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { AnimatedSection } from "@/components/shared/AnimatedSection";

async function getUserData(userId: string) {
  const supabase = await createClient();
  const [{ data: profile }, { data: reviews, count: reviewCount }, { data: itineraries }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("reviews").select("id, rating, title, created_at, destinations(name, slug)", { count: "exact" }).eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
    supabase.from("itineraries").select("id, title, days, travel_style, created_at, share_token").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
  ]);
  return { profile, reviews: reviews ?? [], reviewCount, itineraries: itineraries ?? [] };
}

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const { profile, reviews, reviewCount, itineraries } = await getUserData(userId);

  return (
    <div className="min-h-screen bg-base-950 pb-24">
      {/* Profile header */}
      <section className="pt-12 pb-10 px-5 border-b border-white/[0.06]">
        <div className="container max-w-[1000px] mx-auto">
          <AnimatedSection className="flex items-start gap-6 flex-wrap">
            {user?.imageUrl && (
              <Image src={user.imageUrl} alt={user.fullName ?? ""} width={80} height={80} className="rounded-2xl" />
            )}
            <div className="flex-1">
              <h1 className="text-white font-display text-2xl font-medium">{user?.fullName ?? "Traveler"}</h1>
              <p className="text-white/40 text-sm mt-1">{user?.primaryEmailAddress?.emailAddress}</p>
              <div className="flex gap-4 mt-3">
                <Stat label="Reviews" value={reviewCount ?? 0} />
                <Stat label="Itineraries" value={itineraries.length} />
                <Stat label="Saved" value={profile?.saved_destinations?.length ?? 0} />
              </div>
            </div>
            <Link href="/user-profile" className="btn-ghost text-sm px-5 py-2.5 rounded-xl">
              Edit Profile
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <div className="container max-w-[1000px] mx-auto px-5 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* My Reviews */}
          <AnimatedSection>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white/70 font-display text-lg">My Reviews</h2>
              <Link href="/community/review" className="text-brand-400 text-xs">+ Write a review</Link>
            </div>
            {reviews.length === 0 ? (
              <EmptyState icon="★" text="No reviews yet" sub="Share your travel experiences with the community" />
            ) : (
              <div className="space-y-3">
                {reviews.map((r: any) => (
                  <div key={r.id} className="glass-card p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link href={`/destinations/${r.destinations?.slug}`} className="text-white/70 text-sm hover:text-white transition-colors">
                          {r.destinations?.name ?? "Unknown"}
                        </Link>
                        {r.title && <p className="text-white/50 text-xs mt-0.5">{r.title}</p>}
                      </div>
                      <span className="text-gold-400 text-sm">{"★".repeat(r.rating)}</span>
                    </div>
                    <p className="text-white/25 text-xs font-mono mt-2">
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </AnimatedSection>

          {/* My Itineraries */}
          <AnimatedSection delay={0.1}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white/70 font-display text-lg">My Itineraries</h2>
              <Link href="/plan" className="text-brand-400 text-xs">+ Create new</Link>
            </div>
            {itineraries.length === 0 ? (
              <EmptyState icon="✦" text="No itineraries yet" sub="Generate your first AI-powered Nepal journey" />
            ) : (
              <div className="space-y-3">
                {itineraries.map((it: any) => (
                  <div key={it.id} className="glass-card p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-white/75 text-sm font-medium">{it.title ?? `${it.days}-Day Trip`}</p>
                      <p className="text-white/30 text-xs font-mono mt-0.5 capitalize">{it.days} days · {it.travel_style}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link href={`/itineraries/${it.share_token}`} className="text-brand-400 text-xs hover:text-brand-300">View</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AnimatedSection>
        </div>

        {/* Saved destinations */}
        <AnimatedSection delay={0.15} className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white/70 font-display text-lg">Saved for Offline</h2>
            <Link href="/saved" className="text-brand-400 text-xs">View all</Link>
          </div>
          <div className="glass-card p-6 text-center">
            <p className="text-white/30 text-sm">
              Destinations you've saved offline are stored on this device. View them in the{" "}
              <Link href="/saved" className="text-brand-400 hover:text-brand-300">Saved page</Link>.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-white font-mono font-semibold">{value}</span>
      <span className="text-white/35 text-xs">{label}</span>
    </div>
  );
}

function EmptyState({ icon, text, sub }: { icon: string; text: string; sub: string }) {
  return (
    <div className="text-center py-10 border border-dashed border-white/[0.07] rounded-2xl">
      <p className="text-2xl mb-2" style={{ color: "rgba(255,255,255,0.2)" }}>{icon}</p>
      <p className="text-white/40 text-sm">{text}</p>
      <p className="text-white/20 text-xs mt-1">{sub}</p>
    </div>
  );
}
