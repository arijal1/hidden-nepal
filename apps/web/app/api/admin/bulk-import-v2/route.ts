// app/api/admin/bulk-import-v2/route.ts
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { discoverCandidates, importSelected, type Candidate } from "@/lib/content/bulkImportV2";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== "admin") {
    return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { action } = body;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (action === "discover") {
          const { category, minScore = 30, maxResults = 25 } = body;
          for await (const event of discoverCandidates({ category, minScore, maxResults })) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }
        } else if (action === "import") {
          const { candidates, publish = false } = body;
          for await (const event of importSelected({ candidates: candidates as Candidate[], publish })) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
          }
        } else {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "fatal", error: "Unknown action" })}\n\n`)
          );
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
