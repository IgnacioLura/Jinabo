import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularPrecios } from "@/lib/precios";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const articulo = await prisma.articulo.findUnique({
    where: { id: Number(id) },
    include: {
      categoria: true,
      movimientos: { orderBy: { fecha: "desc" }, take: 50 },
    },
  });
  if (!articulo) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
  return NextResponse.json(articulo);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const data = await req.json();

  const costo = Number(data.costo) || 0;
  const markupBarato = Number(data.markupBarato) || 1.20;
  const markupMedio = Number(data.markupMedio) || 2.00;
  const markupCaro = Number(data.markupCaro) || 2.50;

  const precios = calcularPrecios({
    costo,
    markupBarato,
    markupMedio,
    markupCaro,
    precioBarato: data.precioBarato,
    precioMedio: data.precioMedio,
    precioCaro: data.precioCaro,
    precioBaratoOverride: !!data.precioBaratoOverride,
    precioMedioOverride: !!data.precioMedioOverride,
    precioCaroOverride: !!data.precioCaroOverride,
  });

  const articulo = await prisma.articulo.update({
    where: { id: Number(id) },
    data: {
      nombre: String(data.nombre).trim(),
      sku: data.sku ? String(data.sku).trim() : null,
      categoriaId: data.categoriaId ? Number(data.categoriaId) : null,
      costo,
      markupBarato,
      markupMedio,
      markupCaro,
      precioBarato: precios.precioBarato,
      precioMedio: precios.precioMedio,
      precioCaro: precios.precioCaro,
      precioBaratoOverride: !!data.precioBaratoOverride,
      precioMedioOverride: !!data.precioMedioOverride,
      precioCaroOverride: !!data.precioCaroOverride,
      stockMinimo: Math.max(0, Math.floor(Number(data.stockMinimo) || 0)),
      fotoUrl: data.fotoUrl || null,
      descripcion: data.descripcion || null,
      notas: data.notas || null,
    },
    include: { categoria: true },
  });

  return NextResponse.json(articulo);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await prisma.articulo.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
