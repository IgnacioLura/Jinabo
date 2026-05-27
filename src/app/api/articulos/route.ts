import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcularPrecios } from "@/lib/precios";
import { obtenerSesionDeRequest } from "@/lib/auth";
import { aplicarMarkupUsuario } from "@/lib/markup";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q")?.trim();
  const categoriaId = searchParams.get("categoriaId");
  const stockBajo = searchParams.get("stockBajo") === "1";

  const articulos = await prisma.articulo.findMany({
    where: {
      ...(q ? { nombre: { contains: q } } : {}),
      ...(categoriaId ? { categoriaId: parseInt(categoriaId, 10) } : {}),
    },
    include: { categoria: true },
    orderBy: { nombre: "asc" },
  });

  const filtrados = stockBajo
    ? articulos.filter((a) => a.stock <= a.stockMinimo)
    : articulos;

  const sesion = await obtenerSesionDeRequest(req);
  const markupExtra = sesion?.userId
    ? ((await prisma.user.findUnique({ where: { id: sesion.userId }, select: { markupExtra: true } }))?.markupExtra ?? 0)
    : 0;
  const esAdmin = sesion?.role === "admin";

  // Para no-admin: cargar su stock asignado por artículo
  let miStockMap = new Map<number, number>();
  if (!esAdmin && sesion?.userId) {
    try {
      const stocks = await prisma.stockUsuario.findMany({
        where: { userId: sesion.userId },
        select: { articuloId: true, cantidad: true },
      });
      miStockMap = new Map(stocks.map((s) => [s.articuloId, s.cantidad]));
    } catch {
      // Tabla StockUsuario aún no existe (migración pendiente)
    }
  }

  return NextResponse.json(
    filtrados.map((a) => {
      const withMarkup = aplicarMarkupUsuario(a, markupExtra);
      if (!esAdmin) {
        return { ...withMarkup, miStock: miStockMap.get(a.id) ?? 0 };
      }
      return withMarkup;
    })
  );
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  const costo = Number(data.costo) || 0;
  const markupBarato = Number(data.markupBarato) || 1.20;
  const markupMedio = Number(data.markupMedio) || 2.00;
  const markupCaro = Number(data.markupCaro) || 2.50;
  const stockInicial = Math.max(0, Math.floor(Number(data.stock) || 0));

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

  const articulo = await prisma.articulo.create({
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
      stock: stockInicial,
      stockMinimo: Math.max(0, Math.floor(Number(data.stockMinimo) || 0)),
      fotoUrl: data.fotoUrl || null,
      descripcion: data.descripcion || null,
      notas: data.notas || null,
      movimientos: stockInicial > 0
        ? {
            create: {
              tipo: "ENTRADA",
              cantidad: stockInicial,
              motivo: "Stock inicial",
            },
          }
        : undefined,
    },
    include: { categoria: true },
  });

  return NextResponse.json(articulo, { status: 201 });
}
