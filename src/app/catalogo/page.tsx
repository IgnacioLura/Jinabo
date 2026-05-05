"use client";

import { useRouter } from "next/navigation";
import { Package } from "lucide-react";

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
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 grid place-items-center shadow-lg">
          <Package size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Jinabo</h1>
          <p className="text-sm text-gray-500 font-medium">Catálogo de productos</p>
        </div>
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

      <p className="mt-10 text-xs text-gray-400">Jinabo · Gestión de inventario</p>
    </div>
  );
}
