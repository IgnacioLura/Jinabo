"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, AlertTriangle, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Articulo, Categoria } from "@/types/models";
import ArticuloCard from "@/components/articulos/ArticuloCard";
import MovimientoModal from "@/components/articulos/MovimientoModal";

export default function ArticulosPage() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [q, setQ] = useState("");
  const [catId, setCatId] = useState<number | null>(null);
  const [stockBajo, setStockBajo] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [vendiendo, setVendiendo] = useState<Articulo | null>(null);
  const [importando, setImportando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function importarExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    e.target.value = "";
    setImportando(true);
    const fd = new FormData();
    fd.append("archivo", archivo);
    try {
      const res = await fetch("/api/articulos/importar", { method: "POST", body: fd });
      const data = await res.json();
      toast.success(`Importado: ${data.creados} creados, ${data.omitidos} ya existían`);
      if (data.errores?.length) toast.error(`${data.errores.length} errores`);
      await cargar();
    } catch {
      toast.error("Error al importar");
    } finally {
      setImportando(false);
    }
  }

  async function cargar() {
    setCargando(true);
    const [aRes, cRes] = await Promise.all([
      fetch("/api/articulos"),
      fetch("/api/categorias"),
    ]);
    const [a, c] = await Promise.all([aRes.json(), cRes.json()]);
    setArticulos(a);
    setCategorias(c);
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = useMemo(() => {
    return articulos.filter((a) => {
      if (catId && a.categoriaId !== catId) return false;
      if (stockBajo && !(a.stock <= a.stockMinimo && a.stockMinimo > 0) && a.stock > 0) return false;
      if (q) {
        const lower = q.toLowerCase();
        if (!a.nombre.toLowerCase().includes(lower)) return false;
      }
      return true;
    });
  }, [articulos, q, catId, stockBajo]);

  function actualizarArticulo(actualizado: Articulo) {
    setArticulos((prev) => prev.map((a) => (a.id === actualizado.id ? { ...a, ...actualizado } : a)));
    setVendiendo(null);
  }

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Articulos</h1>
          <p className="text-[var(--foreground)]/50 mt-1">
            {filtrados.length} de {articulos.length} articulos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={importarExcel} />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => inputRef.current?.click()}
            disabled={importando}
            className="tap inline-flex items-center gap-2 px-5 py-3 bg-white border-2 border-[var(--border)] rounded-xl font-bold shadow-sm hover:bg-[var(--surface-soft)] disabled:opacity-50"
          >
            <Upload size={20} />
            {importando ? "Importando..." : "Importar Excel"}
          </motion.button>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/articulos/nuevo"
              className="tap inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-xl font-bold shadow-md btn-glow"
            >
              <Plus size={20} />
              Nuevo articulo
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 mb-6 flex flex-col gap-3 shadow-sm"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/30" />
            <input
              type="search"
              placeholder="Buscar por nombre..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full h-12 pl-10 pr-4 text-base rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none bg-white/80 transition-colors"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setStockBajo((v) => !v)}
            className={`tap px-4 py-2 rounded-xl font-semibold border-2 whitespace-nowrap flex items-center gap-2 transition-all ${
              stockBajo
                ? "bg-amber-100 border-amber-300 text-amber-900 shadow-sm"
                : "bg-white border-[var(--border)] hover:bg-[var(--surface-soft)]"
            }`}
          >
            <AlertTriangle size={16} />
            Stock bajo
          </motion.button>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCatId(null)}
            className={`tap px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
              catId === null
                ? "bg-gradient-to-r from-orange-600 to-red-700 text-white shadow-sm"
                : "bg-white border border-[var(--border)] hover:bg-[var(--brand-soft)]"
            }`}
          >
            Todas
          </button>
          {categorias.map((c) => (
            <button
              key={c.id}
              onClick={() => setCatId(c.id === catId ? null : c.id)}
              className={`tap px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                catId === c.id
                  ? "text-white border-transparent shadow-sm"
                  : "bg-white border-[var(--border)] hover:bg-[var(--surface-soft)]"
              }`}
              style={catId === c.id ? { backgroundColor: c.color } : { color: c.color }}
            >
              {c.nombre}{c._count ? ` ${c._count.articulos}` : ""}
            </button>
          ))}
        </div>
      </motion.div>

      {cargando ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton aspect-square" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-8" />
                <div className="skeleton h-10 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-[var(--foreground)]/40"
        >
          <div className="text-5xl mb-3">:/</div>
          <p className="text-lg font-medium">No hay articulos para los filtros aplicados.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {filtrados.map((a, i) => (
            <ArticuloCard key={a.id} articulo={a} onVender={setVendiendo} index={i} />
          ))}
        </div>
      )}

      {vendiendo && (
        <MovimientoModal
          articulo={vendiendo}
          tipoInicial="VENTA"
          onClose={() => setVendiendo(null)}
          onConfirmado={actualizarArticulo}
        />
      )}
    </div>
  );
}
