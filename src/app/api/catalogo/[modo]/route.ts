import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// slug → ModoPrecio
const SLUG_MODO: Record<string, "BARATO" | "MEDIO" | "CARO"> = {
  mayorista: "BARATO",
  minorista: "MEDIO",
  ml: "CARO",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ modo: string }> },
) {
  const { modo: slug } = await params;
  const modo = SLUG_MODO[slug];
  if (!modo) {
    return NextResponse.json({ error: "Modo inválido" }, { status: 400 });
  }

  const articulos = await prisma.articulo.findMany({
    where: { stock: { gt: 0 } },
    select: {
      id: true,
      nombre: true,
      fotoUrl: true,
      descripcion: true,
      precioBarato: true,
      precioMedio: true,
      precioCaro: true,
      categoria: { select: { nombre: true, color: true } },
    },
    orderBy: [{ categoriaId: "asc" }, { nombre: "asc" }],
  });

  const resultado = articulos.map((a) => ({
    id: a.id,
    nombre: a.nombre,
    fotoUrl: a.fotoUrl,
    descripcion: a.descripcion,
    precio:
      modo === "BARATO" ? a.precioBarato : modo === "MEDIO" ? a.precioMedio : a.precioCaro,
    categoria: a.categoria,
  }));

  return NextResponse.json({ modo, articulos: resultado });
}
