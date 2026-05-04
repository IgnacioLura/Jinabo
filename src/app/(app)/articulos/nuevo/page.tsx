"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Categoria } from "@/types/models";
import ArticuloForm from "@/components/articulos/ArticuloForm";
import Spinner from "@/components/Spinner";

export default function NuevoArticuloPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then((c) => { setCategorias(c); setCargando(false); });
  }, []);

  return (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      <Link href="/articulos" className="text-sm text-[var(--foreground)]/60 hover:text-[var(--brand)]">
        ← Volver
      </Link>
      <h1 className="text-3xl font-bold mt-2 mb-6">Nuevo artículo</h1>
      {cargando ? (
        <div className="flex items-center justify-center gap-3 py-16 text-[var(--foreground)]/50">
          <Spinner size={24} />
          <span className="text-sm font-medium">Cargando...</span>
        </div>
      ) : (
        <ArticuloForm categorias={categorias} />
      )}
    </div>
  );
}
