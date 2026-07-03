"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) router.push(params.get("next") || "/");
    else setError(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center wallpaper-bg px-4">
      <form onSubmit={submit} className="glass-card w-full max-w-sm p-8 space-y-4">
        <h1 className="text-2xl font-semibold text-taupe">Coyot AI Idea Pool</h1>
        <p className="text-sm text-taupe/70">Enter the shared password to continue.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="glass-input w-full"
          autoFocus
        />
        {error && <p className="text-sm text-red-500">Wrong password, try again.</p>}
        <button type="submit" className="glass-button w-full">Enter</button>
      </form>
    </div>
  );
}
