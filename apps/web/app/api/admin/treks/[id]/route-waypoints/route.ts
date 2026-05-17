import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const waypoints = body.waypoints;

  // Validate shape
  if (!Array.isArray(waypoints)) {
    return Response.json({ error: "waypoints must be an array" }, { status: 400 });
  }
  for (const w of waypoints) {
    if (typeof w.name !== "string" || typeof w.lng !== "number" || typeof w.lat !== "number" || typeof w.elevation !== "number") {
      return Response.json({ error: "Each waypoint needs name, lng, lat, elevation" }, { status: 400 });
    }
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("treks").update({ route_waypoints: waypoints }).eq("id", id);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true, count: waypoints.length });
}
