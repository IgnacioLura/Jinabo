"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, X, Palette } from "lucide-react";
import { toast } from "sonner";
import type { Categoria } from "@/types/models";
import Spinner from "@/components/Spinner";

const COLORES = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899",
  "#f43f5e", "#78716c",
];

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [nuevo, setNuevo] = useState(false);
  const [form, setForm] = useState({ nombre: "", color: "#3b82f6", orden: 0 });
  const [guardando, setGuardando] = useState(false);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function cargar() {
    setCargando(true);
    const res = await fetch("/api/categorias");
    const data = await res.json();
    setCategorias(data);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  function abrirNuevo() {
    setEditando(null);
    setForm({ nombre: "", color: "#3b82f6", orden: 0 });
    setNuevo(true);
    setError("");
  }

  function abrirEditar(cat: Categoria) {
    setNuevo(false);
    setEditando(cat);
    setForm({ nombre: cat.nombre, color: cat.color, orden: cat.orden });
    setError("");
  }

  function cerrar() {
    setNuevo(false);
    setEditando(null);
    setError("");
  }

  async function guardar() {
    const nombre = form.nombre.trim();
    if (!nombre) { setError("El nombre es requerido"); return; }
    setGuardando(true);
    setError("");

    const body = JSON.stringify({ nombre, color: form.color, orden: form.orden });

    if (editando) {
      const res = await fetch(`/api/categorias/${editando.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
      if (!res.ok) { setError("Error al guardar"); setGuardando(false); return; }
      toast.success("Categoria actualizada");
    } else {
      const res = await fetch("/api/categorias", { method: "POST", headers: { "Content-Type": "application/json" }, body });
      if (!res.ok) { setError("Error al crear"); setGuardando(false); return; }
      toast.success("Categoria creada");
    }

    setGuardando(false);
    cerrar();
    cargar();
  }

  async function eliminar(cat: Categoria) {
    if (!confirm(`Eliminar "${cat.nombre}"? Los articulos asociados quedaran sin categoria.`)) return;
    setEliminandoId(cat.id);
    await fetch(`/api/categorias/${cat.id}`, { method: "DELETE" });
    toast.success("Categoria eliminada");
    await cargar();
    setEliminandoId(null);
  }

  const mostrarForm = nuevo || editando;

  return (
    <div className="px-4 md:px-8 py-6 max-w-[900px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Categorias</h1>
          <p className="text-[var(--foreground)]/50 mt-1">{categorias.length} categorias</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={abrirNuevo}
          className="tap inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-xl font-bold shadow-md btn-glow"
        >
          <Plus size={20} />
          Nueva
        </motion.button>
      </motion.div>

      {/* Form modal */}
      <AnimatePresence>
        {mostrarForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={cerrar}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold">
                  {editando ? "Editar categoria" : "Nueva categoria"}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={cerrar}
                  className="w-9 h-9 rounded-full hover:bg-[var(--surface-soft)] grid place-items-center text-[var(--foreground)]/60"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Nombre</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <Palette size={14} />
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {COLORES.map((c) => (
                      <motion.button
                        key={c}
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => setForm({ ...form, color: c })}
                        className={`w-10 h-10 rounded-full transition-all shadow-sm ${
                          form.color === c ? "ring-2 ring-offset-2 ring-[var(--foreground)] scale-110" : "hover:shadow-md"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1.5">Orden</label>
                  <input
                    type="number"
                    value={form.orden}
                    onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) || 0 })}
                    className="w-24 h-12 px-4 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-600 text-sm bg-red-50 px-4 py-2.5 rounded-xl border border-red-200"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="flex gap-3 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={guardar}
                    disabled={guardando}
                    className="tap flex-1 px-5 py-3 bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-xl font-bold shadow-md disabled:opacity-40 btn-glow flex items-center justify-center gap-2"
                  >
                    {guardando && <Spinner size={16} />}
                    {guardando ? "Guardando..." : "Guardar"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={cerrar}
                    className="tap px-5 py-3 rounded-xl font-semibold border-2 border-[var(--border)] hover:bg-[var(--surface-soft)]"
                  >
                    Cancelar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista */}
      {cargando ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-4 flex items-center gap-4">
              <div className="skeleton w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-5 w-1/3" />
                <div className="skeleton h-3 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : categorias.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-[var(--foreground)]/40">
          <Palette size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No hay categorias. Crea una para empezar.</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence>
            {categorias.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-[var(--border)] p-4 flex items-center gap-4 card-hover shadow-sm"
              >
                <div
                  className="w-12 h-12 rounded-full shrink-0 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg truncate">{cat.nombre}</p>
                  <p className="text-sm text-[var(--foreground)]/50">
                    {cat._count?.articulos ?? 0} articulos &middot; orden {cat.orden}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => abrirEditar(cat)}
                    className="tap w-10 h-10 rounded-xl grid place-items-center border border-[var(--border)] hover:bg-[var(--surface-soft)] transition-colors"
                  >
                    <Pencil size={16} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => eliminar(cat)}
                    disabled={eliminandoId === cat.id}
                    className="tap w-10 h-10 rounded-xl grid place-items-center text-red-500 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {eliminandoId === cat.id ? <Spinner size={14} /> : <Trash2 size={16} />}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
