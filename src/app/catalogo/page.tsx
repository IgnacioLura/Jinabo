"use client";

import { useRouter } from "next/navigation";

const MODOS = [
  {
    slug: "mayorista",
    label: "Mayorista",
    descripcion: "Precios por mayor",
    gradient: "from-emerald-500 to-green-600",
    bg: "from-emerald-50 to-green-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
  {
    slug: "minorista",
    label: "Minorista",
    descripcion: "Precios de venta directa",
    gradient: "from-amber-500 to-orange-500",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  {
    slug: "ml",
    label: "Mercado Libre",
    descripcion: "Precios publicados en ML",
    gradient: "from-blue-500 to-indigo-600",
    bg: "from-blue-50 to-indigo-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
];

export default function CatalogoSelectorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8f5f0] flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="flex flex-col items-center mb-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpg" alt="Jin Bao Importaciones" className="w-36 h-36 rounded-3xl shadow-xl object-cover mb-4" />
        <p className="text-sm text-gray-500 font-semibold uppercase tracking-widest">Catálogo de productos</p>
      </div>

      <p className="text-gray-600 font-semibold mb-6 text-center">
        Elegí la lista de precios que querés ver o compartir
      </p>

      <div className="w-full max-w-sm flex flex-col gap-3">
        {MODOS.map((m) => (
          <button
            key={m.slug}
            onClick={() => router.push(`/catalogo/${m.slug}`)}
            className={`w-full p-5 rounded-2xl border-2 bg-gradient-to-br ${m.bg} ${m.border} text-left transition-all hover:shadow-md active:scale-[0.98]`}
          >
            <p className={`font-extrabold text-lg ${m.text}`}>{m.label}</p>
            <p className="text-sm text-gray-500 mt-0.5">{m.descripcion}</p>
          </button>
        ))}
      </div>

      <p className="mt-10 text-xs text-gray-400">Jin Bao Importaciones</p>
    </div>
  );
}
