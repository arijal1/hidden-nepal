import { NextRequest } from "next/server";
import { createInquiry } from "@/lib/supabase/queries/adventures";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.email || !body.inquiryType) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    // Honeypot anti-spam check
    if (body.website) {
      return Response.json({ success: true }, { status: 200 });
    }

    const inquiry = await createInquiry({
      adventureId: body.adventureId,
      destinationId: body.destinationId,
      inquiryType: body.inquiryType,
      name: body.name,
      email: body.email,
      phone: body.phone,
      whatsapp: body.whatsapp,
      country: body.country,
      preferredDate: body.preferredDate,
      flexibleDates: body.flexibleDates,
      groupSize: body.groupSize,
      budgetUsd: body.budgetUsd,
      durationDays: body.durationDays,
      message: body.message,
      source: "web",
      userAgent: req.headers.get("user-agent") ?? undefined,
      utmSource: body.utmSource,
      utmCampaign: body.utmCampaign,
    });

    return Response.json({ success: true, id: inquiry.id });
  } catch (err: any) {
    console.error("[/api/inquiries]", err);
    return Response.json({ error: err.message ?? "Server error" }, { status: 500 });
  }
}
