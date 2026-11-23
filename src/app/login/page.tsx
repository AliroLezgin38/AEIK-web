"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Giriş zamanı xəta baş verdi.");
        setLoading(false);
        return;
      }

      localStorage.setItem("aeik_user", JSON.stringify(data.user));
      if (data.token) localStorage.setItem("aeik_token", data.token);

      router.push("/kabinet");
    } catch (err: any) {
      console.error("Login fetch error:", err);
      setError("Serverlə əlaqə qurulmadı. Zəhmət olmasa interneti və ya bazanı yoxlayın.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9FF] via-[#F4F1FD] to-[#EDE9FE] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-purple-950/5 border border-purple-100/80 p-8 sm:p-10 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="relative block w-36 h-9 mb-3">
            <Image
              src="/assets/logo-primary-trim.png"
              alt="AEİK"
              fill
              sizes="144px"
              className="object-contain"
              priority
            />
          </Link>
          <h2 className="text-xl font-bold text-slate-800">Şəxsi Kabinetə Giriş</h2>
          <p className="text-xs text-slate-500 mt-1">İdarə heyəti və könüllülər üçün vahid idarəetmə paneli</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Ünvanı
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ad@aeik.az"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Şifrə
              </label>
              <a href="#" className="text-xs text-brand-600 hover:underline">
                Şifrəni unutmusan?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand-600 focus:ring-2 focus:ring-brand-100 outline-none transition-all text-sm text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-full bg-brand-600 hover:bg-brand-700 active:scale-98 text-white font-medium text-sm shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Giriş edilir..." : "Daxil ol"}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Hesab yaratmaq yalnız admin tərəfindən edilir */}
        <div className="mt-8 text-center text-xs text-slate-500">
          Hesabınız yoxdur? Yeni hesab yalnız təşkilat admini tərəfindən yaradılır.
        </div>
      </div>
    </div>
  );
}
