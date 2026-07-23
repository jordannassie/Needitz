"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!pin) { setError("Enter your PIN."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Incorrect PIN.");
        setPin("");
        inputRef.current?.focus();
      }
    } catch {
      setError("A network error occurred. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-5">
      <div className="w-full max-w-xs bg-white rounded-2xl shadow-sm border border-[#D8D8D8] p-8">
        <div className="mb-8 text-center">
          <span className="text-2xl font-black text-[#050505]">NeedItz</span>
          <div className="h-[3px] w-10 bg-[#FFC400] rounded-full mt-1 mx-auto mb-5" />
          <h1 className="text-lg font-black text-[#050505]">Admin</h1>
          <p className="text-sm text-[#9A9DA5] mt-1">Enter PIN</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <label htmlFor="pin" className="sr-only">PIN</label>
          <input
            ref={inputRef}
            id="pin"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={8}
            value={pin}
            onChange={(e) => { setPin(e.target.value); if (error) setError(""); }}
            placeholder="••••"
            autoComplete="current-password"
            autoFocus
            aria-invalid={!!error}
            aria-describedby={error ? "pin-error" : undefined}
            className={`input-field text-center text-xl tracking-[0.5em] ${error ? "error" : ""}`}
          />
          {error && (
            <p id="pin-error" role="alert" className="text-sm text-red-500 text-center -mt-2">
              {error}
            </p>
          )}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying…</> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
