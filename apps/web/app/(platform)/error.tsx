"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-5">
      <div className="text-center max-w-md">
        <p className="text-5xl mb-5">🏔️</p>
        <h2 className="text-white font-display text-2xl font-medium mb-3">
          Something went wrong
        </h2>
        <p className="text-white/40 text-sm leading-relaxed mb-8">
          An unexpected error occurred loading this page. Please try again.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-primary px-6 py-3 rounded-xl text-sm"
          >
            Try again
          </button>
          <a href="/" className="btn-ghost px-6 py-3 rounded-xl text-sm">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
