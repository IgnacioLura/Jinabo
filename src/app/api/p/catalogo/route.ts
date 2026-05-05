import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const articulos = await prisma.articulo.findMany({
    select: {
      id: true,
      nombre: true,
      fotoUrl: true,
      precioBarato: true,
      precioMedio: true,
      precioCaro: true,
      categoria: { select: { nombre: true, color: true } },
    },
    orderBy: { nombre: "asc" },
  });
  return NextResponse.json(articulos);
}
