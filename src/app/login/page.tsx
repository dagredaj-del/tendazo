"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${siteUrl}/auth/callback?next=/panel` },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function loginWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${siteUrl}/auth/callback?next=/panel` },
    });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <Link
          href="/"
          className="block text-center text-2xl font-extrabold text-brand"
        >
          Tendazo
        </Link>
        <h1 className="mt-4 text-center text-lg font-bold">
          Abre o administra tu tienda
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500">
          Ingresa con tu correo o con Google. Sin contraseñas.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl bg-brand-light p-4 text-center text-sm text-brand-dark">
            Te enviamos un enlace a <strong>{email}</strong>. Ábrelo desde este
            mismo dispositivo para entrar.
          </div>
        ) : (
          <>
            <form onSubmit={sendMagicLink} className="mt-6 space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-60 hover:bg-brand-dark"
              >
                {loading ? "Enviando…" : "Enviar enlace de acceso"}
              </button>
            </form>

            <div className="my-4 flex items-center gap-3 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />o
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              onClick={loginWithGoogle}
              className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 font-medium hover:bg-slate-50"
            >
              <GoogleIcon />
              Continuar con Google
            </button>
          </>
        )}

        {error && (
          <p className="mt-3 text-center text-sm text-red-500">{error}</p>
        )}
      </div>
    </main>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}
