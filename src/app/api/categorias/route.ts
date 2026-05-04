import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categorias = await prisma.categoria.findMany({
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
    include: { _count: { select: { articulos: true } } },
  });
  return NextResponse.json(categorias);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const nombre = String(data.nombre || "").trim();
  if (!nombre) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }
  const cat = await prisma.categoria.create({
    data: {
      nombre,
      color: data.color || "#94a3b8",
      orden: Number(data.orden) || 0,
    },
  });
  return NextResponse.json(cat, { status: 201 });
}
