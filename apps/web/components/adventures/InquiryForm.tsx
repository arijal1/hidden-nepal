"use client";

import { useState } from "react";

export function InquiryForm({
  adventureId,
  adventureName,
  buttonLabel = "Get a quote",
  buttonClassName = "bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-md text-sm font-medium tracking-wide transition-all inline-flex items-center gap-2",
}: {
  adventureId: string;
  adventureName: string;
  buttonLabel?: string;
  buttonClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError(null);

    const data = new FormData(e.currentTarget);
    const payload = {
      adventureId,
      inquiryType: "adventure",
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone") || undefined,
      whatsapp: data.get("whatsapp") || undefined,
      country: data.get("country") || undefined,
      preferredDate: data.get("preferredDate") || undefined,
      flexibleDates: data.get("flexibleDates") === "on",
      groupSize: Number(data.get("groupSize") ?? 1),
      message: data.get("message") || undefined,
      website: data.get("website") || undefined, // honeypot
    };

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "Submission failed");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Submission failed");
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className={buttonClassName}>
        {buttonLabel} <span>→</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-base-900 border border-white/10 rounded-2xl max-w-lg w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-brand-400 text-xs font-mono uppercase tracking-widest mb-1">Inquiry</p>
            <h3 className="text-white font-display text-2xl leading-tight">{adventureName}</h3>
          </div>
          <button onClick={() => { setOpen(false); setSuccess(false); setError(null); }} className="text-white/40 hover:text-white text-2xl leading-none">×</button>
        </div>

        {success ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-2xl">✓</div>
            <p className="text-white font-display text-xl mb-2">We've got your inquiry.</p>
            <p className="text-white/55 text-sm mb-5">We'll match you with a vetted operator and reply within 24 hours.</p>
            <button onClick={() => { setOpen(false); setSuccess(false); }} className="text-brand-400 text-sm hover:text-brand-300">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Name *" name="name" required />
              <Field label="Country" name="country" placeholder="e.g. Australia" />
            </div>
            <Field label="Email *" name="email" type="email" required />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" name="phone" type="tel" />
              <Field label="WhatsApp" name="whatsapp" type="tel" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Preferred date" name="preferredDate" type="date" />
              <Field label="Group size" name="groupSize" type="number" defaultValue="2" min={1} />
            </div>
            <label className="flex items-center gap-2 text-white/60 text-sm cursor-pointer">
              <input type="checkbox" name="flexibleDates" className="accent-brand-500" />
              I'm flexible with dates
            </label>
            <div>
              <label className="text-white/50 text-xs font-mono uppercase tracking-wider mb-1.5 block">Anything else?</label>
              <textarea
                name="message"
                rows={3}
                placeholder="Questions, dietary needs, fitness level…"
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-3 py-2 text-white text-sm focus:border-brand-500 outline-none"
              />
            </div>
            {/* Honeypot — hidden from users */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" disabled={sending} className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3 rounded-md font-medium disabled:opacity-50">
              {sending ? "Sending…" : "Send inquiry"}
            </button>
            <p className="text-white/30 text-xs text-center">No payment now. We'll quote within 24hr.</p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", required, placeholder, defaultValue, min }: any) {
  return (
    <div>
      <label className="text-white/50 text-xs font-mono uppercase tracking-wider mb-1.5 block">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        min={min}
        className="w-full bg-white/[0.04] border border-white/[0.1] rounded-md px-3 py-2 text-white text-sm focus:border-brand-500 outline-none"
      />
    </div>
  );
}
