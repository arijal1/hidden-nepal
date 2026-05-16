// app/api/admin/transport-generator/route.ts
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateTransportForAll } from "@/lib/content/transportGenerator";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") {
    return new Response(JSON.stringify({ error: "Admin only" }), { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { dryRun = false, onlyMissing = true } = body;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of generateTransportForAll({ dryRun, onlyMissing })) {
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
