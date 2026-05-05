"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageOff, Search } from "lucide-react";
import { formatearMoneda } from "@/lib/precios";

type Modo = "BARATO" | "MEDIO" | "CARO";

interface ArticuloPublico {
  id: number;
  nombre: string;
  fotoUrl: string | null;
  precioBarato: number;
  precioMedio: number;
  precioCaro: number;
  categoria: { nombre: string; color: string } | null;
}

const NUM_A_MODO: Record<string, Modo> = {
  "1": "BARATO",
  "2": "MEDIO",
  "3": "CARO",
  BARATO: "BARATO",
  MEDIO: "MEDIO",
  CARO: "CARO",
};

function precioSegunModo(a: ArticuloPublico, modo: Modo) {
  if (modo === "BARATO") return a.precioBarato;
  if (modo === "MEDIO") return a.precioMedio;
  return a.precioCaro;
}

function modoNum(m: Modo) {
  return m === "BARATO" ? "1" : m === "MEDIO" ? "2" : "3";
}

export default function ClientesPage() {
  const [modo] = useState<Modo>(() => {
    if (typeof window === "undefined") return "MEDIO";
    const m = new URLSearchParams(window.location.search).get("m") ?? "";
    return NUM_A_MODO[m] ?? "MEDIO";
  });
  const [articulos, setArticulos] = useState<ArticuloPublico[]>([]);
  const [q, setQ] = useState("");
  const [cargando, setCargando] = useState(true);

  // Strip ?m= from URL immediately
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(null, "", "/clientes");
    }
  }, []);

  useEffect(() => {
    fetch("/api/p/catalogo")
      .then((r) => r.json())
      .then((data) => {
        setArticulos(data);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  const filtrados = useMemo(() => {
    if (!q) return articulos;
    const lower = q.toLowerCase();
    return articulos.filter((a) => a.nombre.toLowerCase().includes(lower));
  }, [articulos, q]);

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-8">
        {/* Busqueda */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-2xl border-2 border-gray-200 bg-white focus:border-orange-400 focus:outline-none text-base shadow-sm transition-colors"
          />
        </div>

        {/* Grid */}
        {cargando ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-7 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium">Sin resultados</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {filtrados.map((a) => {
              const precio = precioSegunModo(a, modo);
              return (
                <a
                  key={a.id}
                  href={`/p/${a.id}?modo=${modoNum(modo)}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {a.fotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.fotoUrl} alt={a.nombre} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-gray-300">
                        <ImageOff size={40} strokeWidth={1} />
                      </div>
                    )}
                    {a.categoria && (
                      <span
                        className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow"
                        style={{
                          backgroundColor: a.categoria.color,
                          color: "#fff",
                        }}
                      >
                        {a.categoria.nombre}
                      </span>
                    )}
                  </div>
                  <div className="p-3 flex flex-col gap-1 flex-1">
                    <span className="font-semibold text-sm leading-tight line-clamp-2 min-h-[34px] text-gray-800">
                      {a.nombre}
                    </span>
                    <span className="text-2xl font-black tabular-nums text-orange-600">
                      {formatearMoneda(precio)}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
