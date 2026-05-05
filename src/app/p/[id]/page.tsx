"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ImageOff } from "lucide-react";
import { formatearMoneda } from "@/lib/precios";

type Modo = "BARATO" | "MEDIO" | "CARO";

interface ArticuloPublico {
  id: number;
  nombre: string;
  fotoUrl: string | null;
  descripcion: string | null;
  precioBarato: number;
  precioMedio: number;
  precioCaro: number;
  categoria: { nombre: string; color: string } | null;
}

const NUM_A_MODO: Record<string, Modo> = {
  "1": "BARATO",
  "2": "MEDIO",
  "3": "CARO",
  // backward compat
  BARATO: "BARATO",
  MEDIO: "MEDIO",
  CARO: "CARO",
};

function precioSegunModo(a: ArticuloPublico, modo: Modo) {
  if (modo === "BARATO") return a.precioBarato;
  if (modo === "MEDIO") return a.precioMedio;
  return a.precioCaro;
}

function textColorForBg(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? "#1a1a1a" : "#ffffff";
}

export default function PublicArticuloPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const modoParam = searchParams.get("modo");

  const [articulo, setArticulo] = useState<ArticuloPublico | null>(null);
  const [modo] = useState<Modo>(
    modoParam && NUM_A_MODO[modoParam] ? NUM_A_MODO[modoParam] : "MEDIO",
  );
  const [error, setError] = useState(false);

  // Limpiar ?modo= de la URL sin recargar
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    fetch(`/api/p/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setArticulo(data);
        document.title = `${data.nombre} — Jin Bao`;
      })
      .catch(() => setError(true));
  }, [id]);

  if (error) return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center text-center p-8">
      <p className="text-xl font-semibold text-gray-400">Artículo no encontrado</p>
    </div>
  );

  if (!articulo) return (
    <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const precio = precioSegunModo(articulo, modo);

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col">

      {/* Card */}
      <div className="flex-1 flex items-start justify-center p-4 pt-6 md:p-8 md:pt-10">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Logo dentro de la card */}
          <div className="bg-[#1a2332] px-6 py-4 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Jin Bao Importaciones" className="h-16 md:h-20 w-auto rounded-xl" />
          </div>

          {/* Foto */}
          <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
            {articulo.fotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={articulo.fotoUrl}
                alt={articulo.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageOff size={80} className="text-gray-300" />
            )}
            {articulo.categoria && (
              <span
                className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow"
                style={{
                  backgroundColor: articulo.categoria.color,
                  color: textColorForBg(articulo.categoria.color),
                }}
              >
                {articulo.categoria.nombre}
              </span>
            )}
          </div>

          <div className="p-6 md:p-8 space-y-5">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight">
              {articulo.nombre}
            </h1>
            {articulo.descripcion && (
              <p className="text-sm md:text-base text-gray-500 leading-relaxed">
                {articulo.descripcion}
              </p>
            )}

            {/* Precio */}
            <div className="text-center py-8 md:py-10 bg-orange-50 rounded-2xl">
              <p className="text-7xl md:text-8xl font-black text-orange-600 tracking-tight">
                {formatearMoneda(precio)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center py-4 text-xs text-gray-400">
        Jin Bao Importaciones
      </footer>
    </div>
  );
}
