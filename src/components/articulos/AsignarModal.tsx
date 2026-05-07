"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import Spinner from "@/components/Spinner";

interface Usuario {
  id: number;
  username: string;
  role: string;
}

interface StockUsuario {
  id: number;
  userId: number;
  cantidad: number;
  user: { id: number; username: string };
}

interface Props {
  articuloId: number;
  articuloNombre: string;
  stockTotal: number;
  onClose: () => void;
  onAsignado: () => void;
}

export default function AsignarModal({
  articuloId,
  articuloNombre,
  stockTotal,
  onClose,
  onAsignado,
}: Readonly<Props>) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [stockUsuario, setStockUsuario] = useState<StockUsuario[]>([]);
  const [userId, setUserId] = useState<number | "">("");
  const [cantidad, setCantidad] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/usuarios").then((r) => r.json()),
      fetch(`/api/articulos/${articuloId}/asignar`).then((r) => r.json()),
    ]).then(([u, s]) => {
      setUsuarios(u.filter((x: Usuario) => x.role !== "admin"));
      setStockUsuario(s);
      setCargando(false);
    });
  }, [articuloId]);

  const totalAsignado = stockUsuario.reduce((acc, s) => acc + s.cantidad, 0);
  const poolLibre = stockTotal - totalAsignado;

  async function asignar() {
    if (!userId || cantidad <= 0) {
      setError("Seleccioná un usuario y una cantidad válida");
      return;
    }
    if (cantidad > poolLibre) {
      setError(`Stock disponible insuficiente (pool libre: ${poolLibre})`);
      return;
    }
    setError("");
    setEnviando(true);
    const res = await fetch(`/api/articulos/${articuloId}/asignar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, cantidad }),
    });
    setEnviando(false);
    if (res.ok) {
      const data = await res.json();
      setStockUsuario(data.stockUsuario);
      setCantidad(1);
      setUserId("");
      toast.success("Stock asignado correctamente");
      onAsignado();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Error al asignar");
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-end md:place-items-center p-0 md:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="bg-white w-full md:max-w-lg md:rounded-3xl rounded-t-3xl flex flex-col max-h-[92vh] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--foreground)]/50 font-semibold">
                Asignar stock
              </div>
              <div className="font-bold text-lg leading-tight">{articuloNombre}</div>
            </div>
            <button
              onClick={onClose}
              className="tap w-10 h-10 rounded-full hover:bg-[var(--surface-soft)] grid place-items-center text-[var(--foreground)]/60"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            {/* Pool info */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: "Stock total", value: stockTotal, color: "text-[var(--foreground)]" },
                { label: "Total asignado", value: totalAsignado, color: "text-indigo-600" },
                { label: "Pool libre", value: poolLibre, color: poolLibre === 0 ? "text-rose-600" : "text-emerald-600" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[var(--surface-soft)] rounded-xl p-3 text-center"
                >
                  <div className="text-[10px] uppercase font-bold text-[var(--foreground)]/50 mb-1">
                    {item.label}
                  </div>
                  <div className={`text-2xl font-black tabular-nums ${item.color}`}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="space-y-4 mb-5">
              <label className="block">
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Users size={14} />
                  Usuario
                </span>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : "")}
                  className="mt-2 w-full h-12 px-4 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none bg-white"
                >
                  <option value="">Seleccionar usuario...</option>
                  {usuarios.map((u) => {
                    const asignado = stockUsuario.find((s) => s.userId === u.id)?.cantidad ?? 0;
                    return (
                      <option key={u.id} value={u.id}>
                        {u.username} (tiene: {asignado})
                      </option>
                    );
                  })}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold">Cantidad a asignar</span>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="tap w-14 h-14 rounded-xl bg-[var(--surface-soft)] grid place-items-center hover:bg-[var(--brand-soft)] transition-colors"
                  >
                    <Minus size={22} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={poolLibre}
                    value={cantidad}
                    onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 h-14 text-center text-3xl font-extrabold tabular-nums rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setCantidad(Math.min(poolLibre, cantidad + 1))}
                    className="tap w-14 h-14 rounded-xl bg-[var(--surface-soft)] grid place-items-center hover:bg-[var(--brand-soft)] transition-colors"
                  >
                    <Plus size={22} />
                  </button>
                </div>
              </label>
            </div>

            {/* Breakdown actual */}
            {!cargando && stockUsuario.length > 0 && (
              <div>
                <p className="text-xs uppercase font-bold text-[var(--foreground)]/50 mb-2 tracking-wide">
                  Distribución actual
                </p>
                <div className="space-y-1.5">
                  {stockUsuario.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-[var(--surface-soft)]"
                    >
                      <span className="font-semibold text-sm">{s.user.username}</span>
                      <span className="font-black tabular-nums text-indigo-700">{s.cantidad}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="mt-3 text-sm text-rose-700 bg-rose-50 px-4 py-2.5 rounded-xl border border-rose-200"
              >
                {error}
              </motion.p>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-[var(--border)] bg-gradient-to-t from-[var(--surface-soft)] to-white">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onClose}
                className="tap py-3 rounded-xl font-semibold bg-white border-2 border-[var(--border)] hover:bg-[var(--surface-soft)]"
              >
                Cerrar
              </button>
              <button
                onClick={asignar}
                disabled={enviando || poolLibre === 0 || !userId}
                className="tap py-3 rounded-xl font-black bg-gradient-to-r from-indigo-600 to-violet-700 text-white text-lg disabled:opacity-40 shadow-md"
              >
                {enviando ? <Spinner size={20} className="mx-auto" /> : "Asignar"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
