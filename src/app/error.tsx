"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="wallpaper-bg flex items-center justify-center min-h-screen p-4">
      <div className="glass-card max-w-sm w-full p-6 text-center space-y-3">
        <p className="text-2xl">🦊💫</p>
        <h1 className="text-lg font-semibold text-taupe">Something went sideways</h1>
        <p className="text-sm text-taupe/70">
          {error.message || "An unexpected error occurred."}
        </p>
        <button onClick={reset} className="glass-button text-sm">Try again</button>
      </div>
    </div>
  );
}
