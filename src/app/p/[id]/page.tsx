"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ImageOff } from "lucide-react";
import { formatearMoneda, MODO_LABEL } from "@/lib/precios";

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

const MODOS: { key: Modo; emoji: string }[] = [
  { key: "BARATO", emoji: "🏷️" },
  { key: "MEDIO", emoji: "🛍️" },
  { key: "CARO", emoji: "🛒" },
];

function precioSegunModo(a: ArticuloPublico, modo: Modo) {
  if (modo === "BARATO") return a.precioBarato;
  if (modo === "MEDIO") return a.precioMedio;
  return a.precioCaro;
}

export default function PublicArticuloPage() {
  const { id } = useParams<{ id: string }>();
  const [articulo, setArticulo] = useState<ArticuloPublico | null>(null);
  const [modo, setModo] = useState<Modo>("MEDIO");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/p/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setArticulo)
      .catch(() => setError(true));
  }, [id]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center text-center p-8">
      <p className="text-xl font-semibold text-gray-400">Artículo no encontrado</p>
    </div>
  );

  if (!articulo) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const precio = precioSegunModo(articulo, modo);

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Foto */}
        <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
          {articulo.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={articulo.fotoUrl} alt={articulo.nombre} className="w-full h-full object-cover" />
          ) : (
            <ImageOff size={64} className="text-gray-300" />
          )}
          {articulo.categoria && (
            <span
              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white shadow"
              style={{ backgroundColor: articulo.categoria.color }}
            >
              {articulo.categoria.nombre}
            </span>
          )}
        </div>

        <div className="p-6 space-y-5">
          <h1 className="text-2xl font-extrabold tracking-tight leading-tight">{articulo.nombre}</h1>

          {/* Selector de modo */}
          <div className="grid grid-cols-3 gap-2">
            {MODOS.map(({ key, emoji }) => (
              <button
                key={key}
                onClick={() => setModo(key)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border-2 ${
                  modo === key
                    ? "bg-gradient-to-br from-orange-500 to-red-600 text-white border-transparent shadow"
                    : "bg-white border-gray-200 text-gray-600 hover:border-orange-300"
                }`}
              >
                {emoji} {MODO_LABEL[key]}
              </button>
            ))}
          </div>

          {/* Precio */}
          <div className="text-center py-4 bg-orange-50 rounded-2xl">
            <p className="text-xs text-gray-400 mb-1 font-medium uppercase tracking-wide">{MODO_LABEL[modo]}</p>
            <p className="text-5xl font-black text-orange-600 tracking-tight">
              {formatearMoneda(precio)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
