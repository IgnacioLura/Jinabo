"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingCart, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import type { Articulo } from "@/types/models";
import type { TipoMovimiento, ModoPrecio } from "@prisma/client";
import { formatearMoneda, MODO_LABEL, MODOS, precioPorModo } from "@/lib/precios";
import Spinner from "@/components/Spinner";

interface Props {
  articulo: Articulo;
  tipoInicial?: TipoMovimiento;
  onClose: () => void;
  onConfirmado: (a: Articulo) => void;
}

const TIPOS: { value: TipoMovimiento; label: string; icon: typeof ShoppingCart; gradient: string }[] = [
  { value: "VENTA", label: "Vender", icon: ShoppingCart, gradient: "from-sky-500 to-blue-600" },
  { value: "ENTRADA", label: "Ingreso", icon: ArrowDownToLine, gradient: "from-emerald-500 to-green-600" },
  { value: "SALIDA", label: "Salida", icon: ArrowUpFromLine, gradient: "from-orange-500 to-amber-600" },
  { value: "AJUSTE", label: "Ajuste", icon: SlidersHorizontal, gradient: "from-violet-500 to-purple-600" },
];

export default function MovimientoModal({
  articulo,
  tipoInicial = "VENTA",
  onClose,
  onConfirmado,
}: Readonly<Props>) {
  const [tipo, setTipo] = useState<TipoMovimiento>(tipoInicial);
  const [cantidad, setCantidad] = useState(1);
  const [modoPrecio, setModoPrecio] = useState<ModoPrecio>("MEDIO");
  const [precioUnitario, setPrecioUnitario] = useState<number>(articulo.precioMedio);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (tipo === "VENTA") {
      setPrecioUnitario(precioPorModo({
        precioBarato: articulo.precioBarato,
        precioMedio: articulo.precioMedio,
        precioCaro: articulo.precioCaro,
      }, modoPrecio));
    }
  }, [modoPrecio, tipo, articulo]);

  async function confirmar() {
    setError("");
    setEnviando(true);
    const body: Record<string, unknown> = { tipo, cantidad, motivo: motivo || null };
    if (tipo === "VENTA") {
      body.modoPrecio = modoPrecio;
      body.precioUnitario = precioUnitario;
    }
    const res = await fetch(`/api/articulos/${articulo.id}/movimientos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setEnviando(false);
    if (res.ok) {
      const actualizado = await res.json();
      const tipoLabel = TIPOS.find(t => t.value === tipo)?.label || tipo;
      toast.success(`${tipoLabel} registrado`, {
        description: `${articulo.nombre} x${cantidad}`,
      });
      onConfirmado(actualizado);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Error al registrar");
    }
  }

  const total = tipo === "VENTA" ? precioUnitario * cantidad : 0;
  const stockProyectado =
    tipo === "ENTRADA" ? articulo.stock + cantidad
    : tipo === "AJUSTE" ? cantidad
    : articulo.stock - cantidad;

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
          <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-[var(--foreground)]/50 font-semibold">
                {articulo.categoria?.nombre}
              </div>
              <div className="font-bold text-lg leading-tight">{articulo.nombre}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="tap w-10 h-10 rounded-full hover:bg-[var(--surface-soft)] grid place-items-center text-[var(--foreground)]/60"
              aria-label="Cerrar"
            >
              <X size={20} />
            </motion.button>
          </div>

          <div className="p-5 flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2 mb-5">
              {TIPOS.map((t) => {
                const Icon = t.icon;
                return (
                  <motion.button
                    key={t.value}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setTipo(t.value)}
                    className={`tap py-2.5 rounded-xl font-semibold text-sm transition-all flex flex-col items-center gap-1 ${
                      tipo === t.value
                        ? `bg-gradient-to-br ${t.gradient} text-white shadow-md`
                        : "bg-[var(--surface-soft)] text-[var(--foreground)]/60 hover:bg-[var(--brand-soft)]"
                    }`}
                  >
                    <Icon size={18} />
                    {t.label}
                  </motion.button>
                );
              })}
            </div>

            <label className="block mb-4">
              <span className="text-sm font-semibold">
                {tipo === "AJUSTE" ? "Stock final" : "Cantidad"}
              </span>
              <div className="mt-2 flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setCantidad(Math.max(0, cantidad - 1))}
                  className="tap w-14 h-14 rounded-xl bg-[var(--surface-soft)] grid place-items-center hover:bg-[var(--brand-soft)] transition-colors"
                >
                  <Minus size={22} />
                </motion.button>
                <input
                  type="number"
                  min="0"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(0, parseInt(e.target.value) || 0))}
                  className="flex-1 h-14 text-center text-3xl font-extrabold tabular-nums rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none"
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setCantidad(cantidad + 1)}
                  className="tap w-14 h-14 rounded-xl bg-[var(--surface-soft)] grid place-items-center hover:bg-[var(--brand-soft)] transition-colors"
                >
                  <Plus size={22} />
                </motion.button>
              </div>
              <p className="mt-2 text-xs text-[var(--foreground)]/50">
                Stock actual: <strong>{articulo.stock}</strong> &rarr; proyectado:{" "}
                <strong className={stockProyectado < 0 ? "text-rose-600" : "text-emerald-600"}>
                  {stockProyectado}
                </strong>
              </p>
            </label>

            {tipo === "VENTA" && (
              <>
                <div className="mb-4">
                  <span className="text-sm font-semibold">Modo de precio</span>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {MODOS.map((m) => {
                      const p = precioPorModo({
                        precioBarato: articulo.precioBarato,
                        precioMedio: articulo.precioMedio,
                        precioCaro: articulo.precioCaro,
                      }, m);
                      return (
                        <motion.button
                          key={m}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={() => setModoPrecio(m)}
                          className={`tap py-2.5 rounded-xl border-2 transition-all ${
                            modoPrecio === m
                              ? "border-[var(--brand)] bg-[var(--brand-soft)] shadow-sm"
                              : "border-[var(--border)] hover:bg-[var(--surface-soft)]"
                          }`}
                        >
                          <div className="text-[10px] uppercase font-bold opacity-60">
                            {MODO_LABEL[m]}
                          </div>
                          <div className="font-extrabold tabular-nums">{formatearMoneda(p)}</div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <label className="block mb-4">
                  <span className="text-sm font-semibold">Precio unitario</span>
                  <input
                    type="number"
                    step="0.01"
                    value={precioUnitario}
                    onChange={(e) => setPrecioUnitario(parseFloat(e.target.value) || 0)}
                    className="mt-2 w-full h-12 px-4 text-lg tabular-nums rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none"
                  />
                </label>
              </>
            )}

            <label className="block mb-2">
              <span className="text-sm font-semibold">Motivo (opcional)</span>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder={
                  tipo === "VENTA" ? "Cliente, observacion..."
                  : tipo === "ENTRADA" ? "Compra, recepcion..."
                  : tipo === "SALIDA" ? "Devolucion, rotura..."
                  : "Inventario fisico..."
                }
                className="mt-2 w-full h-12 px-4 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none"
              />
            </label>

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

          <div className="px-5 py-4 border-t border-[var(--border)] bg-gradient-to-t from-[var(--surface-soft)] to-white">
            {tipo === "VENTA" && (
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-sm font-semibold">Total</span>
                <motion.span
                  key={total}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-black tabular-nums text-[var(--brand)]"
                >
                  {formatearMoneda(total)}
                </motion.span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="tap py-3 rounded-xl font-semibold bg-white border-2 border-[var(--border)] hover:bg-[var(--surface-soft)]"
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={confirmar}
                disabled={enviando || cantidad === 0 && tipo !== "AJUSTE"}
                className="tap py-3 rounded-xl font-black bg-gradient-to-r from-orange-600 to-red-700 text-white text-lg disabled:opacity-40 shadow-md btn-glow"
              >
                {enviando ? <Spinner size={20} className="mx-auto" /> : "Confirmar"}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
