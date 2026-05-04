import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const data = await req.json();
  const cat = await prisma.categoria.update({
    where: { id: Number(id) },
    data: {
      nombre: String(data.nombre).trim(),
      color: data.color || "#94a3b8",
      orden: Number(data.orden) || 0,
    },
  });
  return NextResponse.json(cat);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.categoria.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
