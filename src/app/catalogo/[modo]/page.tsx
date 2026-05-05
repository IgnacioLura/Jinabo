"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ImageOff, Share2, Check, Package } from "lucide-react";

const SLUG_LABEL: Record<string, string> = {
  mayorista: "Mayorista",
  minorista: "Minorista",
  ml: "Mercado Libre",
};

const SLUG_MODO: Record<string, "BARATO" | "MEDIO" | "CARO"> = {
  mayorista: "BARATO",
  minorista: "MEDIO",
  ml: "CARO",
};

interface ArticuloPublico {
  id: number;
  nombre: string;
  fotoUrl: string | null;
  descripcion: string | null;
  precio: number;
  categoria: { nombre: string; color: string } | null;
}

function textColorForBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1a1a1a" : "#ffffff";
}

function formatearMoneda(valor: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
}

export default function CatalogoModoPage() {
  const { modo: slug } = useParams<{ modo: string }>();
  const [articulos, setArticulos] = useState<ArticuloPublico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const label = SLUG_LABEL[slug] ?? slug;
  const modoKey = SLUG_MODO[slug];

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/catalogo/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setArticulos(data.articulos);
        document.title = `Catálogo ${label} — Jin Bao`;
        setCargando(false);
      })
      .catch(() => { setError(true); setCargando(false); });
  }, [slug, label]);

  function compartir() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-8 text-center">
      <p className="text-xl font-semibold text-gray-400">Catálogo no disponible</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      {/* Header */}
      <header className="bg-[#1a2332] text-white px-4 py-3 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Jin Bao Importaciones" className="h-10 w-auto rounded-lg" />
            <p className="text-sm font-semibold text-white/70">{label}</p>
          </div>
          <button
            onClick={compartir}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors font-semibold text-sm"
          >
            {copiado ? <Check size={15} /> : <Share2 size={15} />}
            {copiado ? "Copiado" : "Compartir"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {cargando ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gray-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-5 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : articulos.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-semibold">Sin productos disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {articulos.map((a) => (
              <a
                key={a.id}
                href={`/p/${a.id}?modo=${modoKey}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow block"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
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
                        color: textColorForBg(a.categoria.color),
                      }}
                    >
                      {a.categoria.nombre}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm leading-tight line-clamp-2 text-gray-800 min-h-[36px]">
                    {a.nombre}
                  </p>
                  {a.descripcion && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{a.descripcion}</p>
                  )}
                  <p className="text-base font-black text-orange-600 mt-1.5 tabular-nums">
                    {formatearMoneda(a.precio)}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-gray-400 mt-4">
        Jin Bao Importaciones
      </footer>
    </div>
  );
}
