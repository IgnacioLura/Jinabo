"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ImageOff } from "lucide-react";
import type { Articulo, Categoria } from "@/types/models";
import type { ModoPrecio } from "@/lib/precios";
import { MODO_LABEL, MODOS, formatearMoneda, precioPorModo } from "@/lib/precios";

export default function ModoClientePage() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [modo, setModo] = useState<ModoPrecio>("MEDIO");
  const [q, setQ] = useState("");
  const [catId, setCatId] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
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
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    return articulos.filter((a) => {
      if (catId && a.categoriaId !== catId) return false;
      if (q) {
        const lower = q.toLowerCase();
        if (!a.nombre.toLowerCase().includes(lower)) return false;
      }
      return true;
    });
  }, [articulos, q, catId]);

  const modoStyles: Record<ModoPrecio, { gradient: string; text: string; glow: string; activeText?: string }> = {
    BARATO: { gradient: "from-emerald-500 to-green-600", text: "text-emerald-700", glow: "shadow-emerald-200/50" },
    MEDIO: { gradient: "from-amber-500 to-orange-500", text: "text-amber-700", glow: "shadow-amber-200/50" },
    CARO: { gradient: "from-[#FFE600] to-[#FFD000]", text: "text-[#1a3a5c]", glow: "shadow-yellow-200/60", activeText: "text-[#1a3a5c]" },
  };

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
      {/* Toggle de modo de precio */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-3 mb-6 shadow-sm"
      >
        <div className="grid grid-cols-3 gap-2">
          {MODOS.map((m) => (
            <motion.button
              key={m}
              whileTap={{ scale: 0.97 }}
              onClick={() => setModo(m)}
              className={`tap px-4 py-4 rounded-xl font-extrabold text-lg transition-all relative overflow-hidden ${
                modo === m
                  ? `bg-gradient-to-r ${modoStyles[m].gradient} ${modoStyles[m].activeText ?? "text-white"} shadow-lg ${modoStyles[m].glow}`
                  : "bg-white text-[var(--foreground)]/60 hover:bg-[var(--surface-soft)] border border-[var(--border)]"
              }`}
            >
              {modo === m && (
                <motion.div
                  layoutId="modo-indicator"
                  className="absolute inset-0 bg-gradient-to-r opacity-100"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {m === "CARO" && (
                  <svg width="18" height="14" viewBox="0 0 36 28" fill="none" aria-hidden="true">
                    <path d="M2 4h4.5l5.5 15h16l4-12H10.5" stroke={modo === m ? "#1A3A5C" : "#888"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <circle cx="14" cy="25" r="2.5" fill={modo === m ? "#1A3A5C" : "#888"}/>
                    <circle cx="26" cy="25" r="2.5" fill={modo === m ? "#1A3A5C" : "#888"}/>
                  </svg>
                )}
                {MODO_LABEL[m]}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Busqueda + categorias */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 mb-6 flex flex-col gap-3 shadow-sm"
      >
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/30" />
          <input
            type="search"
            placeholder="Buscar articulo..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full h-12 pl-10 pr-4 text-lg rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none bg-white/80 transition-colors"
          />
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
              {c.nombre}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {cargando ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden">
              <div className="skeleton aspect-square" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-4 w-3/4" />
                <div className="skeleton h-8 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-[var(--foreground)]/40">
          <p className="text-lg font-medium">No hay articulos para mostrar.</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={modo}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
          >
            {filtrados.map((a, i) => (
              <ClienteCard key={a.id} articulo={a} modo={modo} modoStyle={modoStyles[modo]} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function ClienteCard({
  articulo,
  modo,
  modoStyle,
  index,
}: {
  articulo: Articulo;
  modo: ModoPrecio;
  modoStyle: { text: string };
  index: number;
}) {
  const precio = precioPorModo(
    { precioBarato: articulo.precioBarato, precioMedio: articulo.precioMedio, precioCaro: articulo.precioCaro },
    modo,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.35 }}
      className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden flex flex-col card-hover shadow-sm"
    >
      <div className="aspect-square bg-gradient-to-br from-[var(--surface-soft)] to-[#ede4d8] relative overflow-hidden">
        {articulo.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={articulo.fotoUrl} alt={articulo.nombre} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-[var(--foreground)]/20">
            <ImageOff size={48} strokeWidth={1} />
          </div>
        )}
        {articulo.categoria && (
          <span
            className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-md backdrop-blur-sm"
            style={{ backgroundColor: `${articulo.categoria.color}dd` }}
          >
            {articulo.categoria.nombre}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <span className="font-bold text-[15px] leading-tight line-clamp-2 min-h-[36px]">
          {articulo.nombre}
        </span>
        <motion.span
          key={`${articulo.id}-${modo}`}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-2xl font-black tabular-nums ${modoStyle.text}`}
        >
          {formatearMoneda(precio)}
        </motion.span>
      </div>
    </motion.div>
  );
}
