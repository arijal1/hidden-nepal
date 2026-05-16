// app/api/admin/trek-import/route.ts
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { importCuratedTreks } from "@/lib/content/trekImport";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") {
    return new Response(JSON.stringify({ error: "Admin only" }), { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    dryRun = false,
    publishImmediately = true,
    fetchPhotos = true,
    filterCategory = "all",
  } = body;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of importCuratedTreks({
          dryRun,
          publishImmediately,
          fetchPhotos,
          filterCategory,
        })) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        }
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "fatal", error: err.message ?? String(err) })}\n\n`)
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
