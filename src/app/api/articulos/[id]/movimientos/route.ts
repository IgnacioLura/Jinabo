import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularNuevoStock } from "@/lib/stock";
import { TipoMovimiento, ModoPrecio } from "@prisma/client";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const articuloId = Number(id);
  const body = await req.json();

  const tipo = body.tipo as TipoMovimiento;
  const cantidad = Math.max(0, Math.floor(Number(body.cantidad) || 0));
  const precioUnitario = body.precioUnitario != null ? Number(body.precioUnitario) : null;
  const modoPrecio = (body.modoPrecio as ModoPrecio | null) || null;
  const motivo = body.motivo ? String(body.motivo).trim() : null;

  if (!["ENTRADA", "SALIDA", "VENTA", "AJUSTE"].includes(tipo)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }
  if (cantidad < 0 || (tipo !== "AJUSTE" && cantidad === 0)) {
    return NextResponse.json({ error: "Cantidad inválida" }, { status: 400 });
  }

  const articulo = await prisma.articulo.findUnique({ where: { id: articuloId } });
  if (!articulo) {
    return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 });
  }

  const nuevoStock = calcularNuevoStock({
    stockActual: articulo.stock,
    tipo,
    cantidad,
  });

  if (nuevoStock < 0) {
    return NextResponse.json(
      { error: `Stock insuficiente (disponible: ${articulo.stock})` },
      { status: 400 },
    );
  }

  const [, actualizado] = await prisma.$transaction([
    prisma.movimiento.create({
      data: {
        articuloId,
        tipo,
        cantidad,
        precioUnitario,
        modoPrecio,
        motivo,
      },
    }),
    prisma.articulo.update({
      where: { id: articuloId },
      data: { stock: nuevoStock },
      include: { categoria: true },
    }),
  ]);

  return NextResponse.json(actualizado);
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const movimientos = await prisma.movimiento.findMany({
    where: { articuloId: Number(id) },
    orderBy: { fecha: "desc" },
  });
  return NextResponse.json(movimientos);
}
