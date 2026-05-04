"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Trash2, ArrowLeft, Upload, X, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { Articulo, Categoria } from "@/types/models";
import { calcularPrecios, formatearMoneda, MODO_LABEL } from "@/lib/precios";
import Spinner from "@/components/Spinner";

interface Props {
  articulo?: Articulo;
  categorias: Categoria[];
}

export default function ArticuloForm({ articulo, categorias }: Readonly<Props>) {
  const router = useRouter();
  const editing = !!articulo;
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [eliminar, setEliminar] = useState(false);

  const [nombre, setNombre] = useState(articulo?.nombre || "");
  const [sku, setSku] = useState(articulo?.sku || "");
  const [categoriaId, setCategoriaId] = useState<string>(
    articulo?.categoriaId?.toString() || "",
  );
  const [costo, setCosto] = useState(articulo?.costo ?? 0);
  const [markupBarato, setMarkupBarato] = useState(articulo?.markupBarato ?? 1.20);
  const [markupMedio, setMarkupMedio] = useState(articulo?.markupMedio ?? 2.00);
  const [markupCaro, setMarkupCaro] = useState(articulo?.markupCaro ?? 2.50);
  const [stock, setStock] = useState(articulo?.stock ?? 0);
  const [stockMinimo, setStockMinimo] = useState(articulo?.stockMinimo ?? 0);
  const [fotoUrl, setFotoUrl] = useState(articulo?.fotoUrl || "");
  const [notas, setNotas] = useState(articulo?.notas || "");
  const [subiendoFoto, setSubiendoFoto] = useState(false);

  const precios = calcularPrecios({
    costo, markupBarato, markupMedio, markupCaro,
  });

  async function subirFoto(file: File) {
    setSubiendoFoto(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: fd });
    setSubiendoFoto(false);
    if (res.ok) {
      const { url } = await res.json();
      setFotoUrl(url);
      toast.success("Foto subida");
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Error subiendo imagen");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEnviando(true);
    const payload = {
      nombre, sku: sku || null,
      categoriaId: categoriaId ? Number(categoriaId) : null,
      costo, markupBarato, markupMedio, markupCaro,
      stock: editing ? undefined : stock,
      stockMinimo, fotoUrl: fotoUrl || null, notas: notas || null,
    };
    const url = editing ? `/api/articulos/${articulo!.id}` : "/api/articulos";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setEnviando(false);
    if (res.ok) {
      const data = await res.json();
      toast.success(editing ? "Cambios guardados" : "Articulo creado");
      router.push(`/articulos/${data.id}`);
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Error al guardar");
    }
  }

  async function confirmarEliminar() {
    if (!articulo) return;
    setEnviando(true);
    const res = await fetch(`/api/articulos/${articulo.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Articulo eliminado");
      router.push("/articulos");
      router.refresh();
    } else {
      setError("Error al eliminar");
      setEnviando(false);
    }
  }

  const markupRows = [
    { label: MODO_LABEL.BARATO, m: markupBarato, set: setMarkupBarato, p: precios.precioBarato, gradient: "from-emerald-50 to-emerald-100", border: "border-emerald-200", text: "text-emerald-800" },
    { label: MODO_LABEL.MEDIO, m: markupMedio, set: setMarkupMedio, p: precios.precioMedio, gradient: "from-amber-50 to-amber-100", border: "border-amber-200", text: "text-amber-800" },
    { label: MODO_LABEL.CARO, m: markupCaro, set: setMarkupCaro, p: precios.precioCaro, gradient: "from-rose-50 to-rose-100", border: "border-rose-200", text: "text-rose-800" },
  ];

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
        <h2 className="font-bold text-lg mb-4">Informacion basica</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <label className="md:col-span-2 block">
            <span className="text-sm font-semibold">Nombre</span>
            <input
              required
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="mt-1.5 w-full h-12 px-4 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none transition-colors"
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">SKU (opcional)</span>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="mt-1.5 w-full h-12 px-4 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none transition-colors"
            />
          </label>
          <label className="block md:col-span-3">
            <span className="text-sm font-semibold">Categoria</span>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="mt-1.5 w-full h-12 px-4 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none bg-white transition-colors"
            >
              <option value="">Sin categoria</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
        <h2 className="font-bold text-lg mb-4">Foto</h2>
        <div className="flex items-start gap-4">
          <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[var(--surface-soft)] to-[#ede4d8] overflow-hidden grid place-items-center flex-shrink-0 shadow-sm">
            {fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[var(--foreground)]/30 text-xs">Sin foto</span>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--brand-soft)] text-[var(--brand)] font-semibold cursor-pointer hover:bg-orange-200 transition-colors">
              <Upload size={16} />
              Subir imagen
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && subirFoto(e.target.files[0])}
                className="hidden"
              />
            </label>
            {subiendoFoto && (
              <p className="text-xs text-[var(--foreground)]/50 flex items-center gap-1.5">
                <Spinner size={12} />
                Subiendo...
              </p>
            )}
            {fotoUrl && (
              <button
                type="button"
                onClick={() => setFotoUrl("")}
                className="flex items-center gap-1 text-xs text-rose-600 hover:underline"
              >
                <X size={12} />
                Quitar foto
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
        <h2 className="font-bold text-lg mb-1">Precios</h2>
        <p className="text-sm text-[var(--foreground)]/50 mb-4">
          Los 3 modos se calculan como costo x markup.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-semibold">Costo</span>
            <input
              type="number" step="0.01" min="0"
              value={costo}
              onChange={(e) => setCosto(parseFloat(e.target.value) || 0)}
              className="mt-1.5 w-full h-12 px-4 text-lg tabular-nums rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none transition-colors"
            />
          </label>
        </div>
        <div className="mt-4 grid md:grid-cols-3 gap-3">
          {markupRows.map((row) => (
            <div key={row.label} className={`p-4 rounded-2xl border bg-gradient-to-br ${row.gradient} ${row.border}`}>
              <div className={`text-xs uppercase font-bold tracking-wider ${row.text} opacity-70`}>{row.label}</div>
              <label className="block mt-2">
                <span className="text-xs font-medium">Markup x</span>
                <input
                  type="number" step="0.01" min="0"
                  value={row.m}
                  onChange={(e) => row.set(parseFloat(e.target.value) || 0)}
                  className="mt-1 w-full h-10 px-3 tabular-nums rounded-lg border border-white/60 bg-white/80 focus:bg-white focus:outline-none transition-colors"
                />
              </label>
              <div className={`mt-3 text-xl font-black tabular-nums ${row.text}`}>{formatearMoneda(row.p)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
        <h2 className="font-bold text-lg mb-4">Stock</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {!editing && (
            <label className="block">
              <span className="text-sm font-semibold">Stock inicial</span>
              <input
                type="number" min="0"
                value={stock}
                onChange={(e) => setStock(Math.max(0, parseInt(e.target.value) || 0))}
                className="mt-1.5 w-full h-12 px-4 text-lg tabular-nums rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none transition-colors"
              />
              <p className="mt-1 text-xs text-[var(--foreground)]/50">
                Se registra como movimiento de ingreso.
              </p>
            </label>
          )}
          <label className="block">
            <span className="text-sm font-semibold">Stock minimo (alerta)</span>
            <input
              type="number" min="0"
              value={stockMinimo}
              onChange={(e) => setStockMinimo(Math.max(0, parseInt(e.target.value) || 0))}
              className="mt-1.5 w-full h-12 px-4 text-lg tabular-nums rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none transition-colors"
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm">
        <h2 className="font-bold text-lg mb-4">Notas</h2>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none transition-colors"
          placeholder="Proveedor, observaciones, etc."
        />
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-sm text-rose-700 bg-rose-50 px-4 py-3 rounded-xl border border-rose-200 font-medium"
        >
          {error}
        </motion.p>
      )}

      <div className="flex flex-wrap gap-3 justify-between pt-2">
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => router.back()}
          className="tap px-5 py-3 rounded-xl bg-white border-2 border-[var(--border)] font-semibold flex items-center gap-2 hover:bg-[var(--surface-soft)] transition-colors"
        >
          <ArrowLeft size={16} />
          Cancelar
        </motion.button>
        <div className="flex gap-3">
          {editing && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => setEliminar(true)}
              className="tap px-5 py-3 rounded-xl bg-white border-2 border-rose-300 text-rose-700 font-semibold hover:bg-rose-50 flex items-center gap-2 transition-colors"
            >
              <Trash2 size={16} />
              Eliminar
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={enviando}
            className="tap px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-700 text-white font-bold disabled:opacity-40 shadow-md flex items-center gap-2 btn-glow"
          >
            {enviando ? <Spinner size={16} /> : <Save size={16} />}
            {enviando ? "Guardando..." : editing ? "Guardar cambios" : "Crear articulo"}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {eliminar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 grid place-items-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="font-extrabold text-lg text-center">Eliminar articulo</h3>
              <p className="mt-2 text-sm text-[var(--foreground)]/60 text-center">
                Se borraran todos sus movimientos. Esta accion no se puede deshacer.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => setEliminar(false)}
                  className="tap py-3 rounded-xl bg-white border-2 border-[var(--border)] font-semibold"
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={confirmarEliminar}
                  disabled={enviando}
                  className="tap py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white font-bold shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {enviando && <Spinner size={16} />}
                  {enviando ? "Eliminando..." : "Si, eliminar"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
