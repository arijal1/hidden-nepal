import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { DestinationEditClient } from "./DestinationEditClient";

export default async function EditDestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = createAdminClient();
  const { data: destination } = await supabase
    .from("destinations")
    .select("*")
    .eq("id", (await params).id)
    .single();

  if (!destination) notFound();

  return (
    <div>
      <h1 className="text-white font-display text-2xl font-semibold mb-2">Edit Destination</h1>
      <p className="text-white/35 text-sm mb-8 font-mono">{destination.slug}</p>
      <DestinationEditClient destination={destination} />
    </div>
  );
}
