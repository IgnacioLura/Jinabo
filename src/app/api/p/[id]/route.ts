import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articulo = await prisma.articulo.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      nombre: true,
      fotoUrl: true,
      precioBarato: true,
      precioMedio: true,
      precioCaro: true,
      categoria: { select: { nombre: true, color: true } },
    },
  });
  if (!articulo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(articulo);
}
