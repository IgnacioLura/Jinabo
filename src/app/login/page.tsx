"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Spinner from "@/components/Spinner";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/articulos";
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
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push(from);
      router.refresh();
    } else {
      setError("Contrasena incorrecta");
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-orange-200/40 to-red-200/30 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-200/30 to-orange-200/20 blur-3xl" />
      </div>

      <motion.form
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onSubmit={submit}
        className="glass rounded-3xl p-8 w-full max-w-md shadow-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-700 text-white font-black grid place-items-center text-3xl mx-auto shadow-lg"
          aria-hidden="true"
        >
          J
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-5 mb-8"
        >
          <h1 className="text-3xl font-extrabold tracking-tight">Jinabo</h1>
          <p className="text-sm text-[var(--foreground)]/70 mt-1">Ingresá para continuar</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <label className="block">
            <span className="text-sm font-semibold flex items-center gap-1.5">
              <Lock size={14} aria-hidden="true" />
              Contraseña
            </span>
            <div className="relative mt-2">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                aria-describedby={error ? "login-error" : undefined}
                className="w-full px-4 py-3.5 pr-12 text-lg rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none focus:ring-2 focus:ring-orange-500/30 bg-white/80 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 text-[var(--foreground)]/40 hover:text-[var(--foreground)]"
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
              className="mt-3 text-sm text-rose-600 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200 font-medium"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !password}
            className="tap mt-6 w-full px-4 py-4 bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-xl font-bold text-lg disabled:opacity-40 shadow-md flex items-center justify-center gap-2 btn-glow"
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
