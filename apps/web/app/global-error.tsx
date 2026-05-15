"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#0a0f0a", margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", textAlign: "center" }}>
          <div style={{ maxWidth: 480 }}>
            <p style={{ fontSize: 80, marginBottom: 16 }}>⛰️</p>
            <h1 style={{ color: "white", fontSize: 28, fontWeight: 500, marginBottom: 12 }}>
              Something went wrong
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
              An unexpected error occurred. Our team has been notified.
              {error.digest && (
                <span style={{ display: "block", marginTop: 8, fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                  Error ID: {error.digest}
                </span>
              )}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{ padding: "12px 24px", borderRadius: 10, background: "linear-gradient(135deg,#2d6a4f,#52b788)", border: "none", color: "white", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Try again
              </button>
              <a
                href="/"
                style={{ padding: "12px 24px", borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none" }}
              >
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
