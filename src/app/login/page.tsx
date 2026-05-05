"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import Spinner from "@/components/Spinner";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/articulos";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(from);
      router.refresh();
    } else {
      setError("Usuario o contraseña incorrectos");
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 relative overflow-hidden" style={{ background: "var(--navy)" }}>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, var(--brand) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full opacity-10" style={{ background: "radial-gradient(circle, var(--brand) 0%, transparent 70%)" }} />
      </div>

      <motion.form
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onSubmit={submit}
        className="rounded-3xl p-8 w-full max-w-md shadow-2xl"
        style={{ background: "var(--navy-light)", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="w-28 h-28 rounded-2xl overflow-hidden mx-auto shadow-xl"
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="Jin Bao" className="w-full h-full object-cover" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-5 mb-8"
        >
          <h1 className="text-2xl font-black tracking-tight text-white">Jin Bao</h1>
          <p className="text-sm font-bold uppercase tracking-widest mt-0.5" style={{ color: "var(--brand)" }}>
            Importaciones
          </p>
          <p className="text-sm text-white/40 mt-3">Ingresá para continuar</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4"
        >
          <label className="block">
            <span className="text-sm font-semibold flex items-center gap-1.5 text-white/70">
              <User size={14} aria-hidden="true" />
              Usuario
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              className="mt-2 w-full px-4 py-3.5 text-lg rounded-xl border-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-colors"
              style={{
                background: "rgba(255,255,255,0.07)",
                borderColor: "rgba(255,255,255,0.15)",
              }}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold flex items-center gap-1.5 text-white/70">
              <Lock size={14} aria-hidden="true" />
              Contraseña
            </span>
            <div className="relative mt-2">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                aria-describedby={error ? "login-error" : undefined}
                className="w-full px-4 py-3.5 pr-12 text-lg rounded-xl border-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 transition-colors"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  borderColor: "rgba(255,255,255,0.15)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-white/30 hover:text-white/70"
              >
                {showPw ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
              </button>
            </div>
          </label>

          {error && (
            <motion.p
              id="login-error"
              role="alert"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-medium px-4 py-2.5 rounded-xl border"
              style={{ background: "rgba(230,57,0,0.15)", color: "#ff8c6b", borderColor: "rgba(230,57,0,0.3)" }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !username || !password}
            className="tap mt-2 w-full px-4 py-4 text-white rounded-xl font-bold text-lg disabled:opacity-40 shadow-md flex items-center justify-center gap-2 btn-glow"
            style={{ background: "var(--brand)" }}
          >
            {loading ? (
              <Spinner size={20} />
            ) : (
              <>
                Ingresar
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
