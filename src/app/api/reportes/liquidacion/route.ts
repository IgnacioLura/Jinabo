import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const desdeParam = searchParams.get("desde");
  const hastaParam = searchParams.get("hasta");

  if (!desdeParam || !hastaParam) {
    return NextResponse.json({ error: "Se requieren desde y hasta" }, { status: 400 });
  }

  const desde = new Date(desdeParam);
  const hasta = new Date(hastaParam);
  // hasta = fin del día
  hasta.setHours(23, 59, 59, 999);

  if (isNaN(desde.getTime()) || isNaN(hasta.getTime())) {
    return NextResponse.json({ error: "Fechas inválidas" }, { status: 400 });
  }

  const movimientos = await prisma.movimiento.findMany({
    where: {
      tipo: { in: ["ENTRADA", "SALIDA", "VENTA"] },
      fecha: { gte: desde, lte: hasta },
    },
    include: {
      articulo: {
        select: { id: true, nombre: true, costo: true, categoria: { select: { nombre: true } } },
      },
    },
    orderBy: { fecha: "asc" },
  });

  // Agrupar por artículo
  const porArticulo = new Map<
    number,
    {
      id: number;
      nombre: string;
      categoria: string | null;
      costo: number;
      entradas: number;
      salidas: number;
      ventas: number;
      totalCosto: number;
    }
  >();

  for (const m of movimientos) {
    const cur = porArticulo.get(m.articuloId) ?? {
      id: m.articulo.id,
      nombre: m.articulo.nombre,
      categoria: m.articulo.categoria?.nombre ?? null,
      costo: m.articulo.costo,
      entradas: 0,
      salidas: 0,
      ventas: 0,
      totalCosto: 0,
    };

    if (m.tipo === "ENTRADA") {
      cur.entradas += m.cantidad;
      cur.totalCosto += m.cantidad * m.articulo.costo;
    } else if (m.tipo === "SALIDA") {
      cur.salidas += m.cantidad;
    } else if (m.tipo === "VENTA") {
      cur.ventas += m.cantidad;
      // totalCosto incluye las vendidas también (para liquidar)
      cur.totalCosto += m.cantidad * m.articulo.costo;
    }

    porArticulo.set(m.articuloId, cur);
  }

  const filas = Array.from(porArticulo.values()).sort((a, b) =>
    a.nombre.localeCompare(b.nombre),
  );

  const totalCostoGeneral = filas.reduce((acc, f) => acc + f.totalCosto, 0);

  return NextResponse.json({
    desde: desdeParam,
    hasta: hastaParam,
    filas,
    totalCosto: Math.round(totalCostoGeneral * 100) / 100,
  });
}
