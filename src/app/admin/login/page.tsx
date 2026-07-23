"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) { setError("Enter your password."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        const d = await res.json() as { error?: string };
        setError(d.error ?? "Invalid password.");
      }
    } catch {
      setError("A network error occurred.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7] px-5">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#D8D8D8] p-8">
        <div className="mb-6">
          <span className="text-2xl font-black text-[#050505]">NeedItz</span>
          <div className="h-[3px] w-10 bg-[#FFC400] rounded-full mt-1 mb-4" />
          <h1 className="text-lg font-black text-[#050505]">Admin Access</h1>
          <p className="text-sm text-[#9A9DA5] mt-1">Enter your admin password to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="relative">
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(""); }}
              placeholder="Password"
              autoComplete="current-password"
              aria-invalid={!!error}
              className={`input-field pr-10 ${error ? "error" : ""}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9DA5] hover:text-[#050505]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <><Loader2 size={18} className="animate-spin" /> Verifying…</> : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
