import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesionDeRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const sesion = await obtenerSesionDeRequest(req);
  if (sesion?.role !== "admin") {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

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
        select: { id: true, nombre: true, costo: true, stock: true, categoria: { select: { nombre: true } } },
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
      stock: number;
      ventas: number;
    }
  >();

  for (const m of movimientos) {
    const cur = porArticulo.get(m.articuloId) ?? {
      id: m.articulo.id,
      nombre: m.articulo.nombre,
      categoria: m.articulo.categoria?.nombre ?? null,
      costo: m.articulo.costo,
      stock: m.articulo.stock,
      ventas: 0,
    };

    if (m.tipo === "VENTA") {
      cur.ventas += m.cantidad;
    }

    porArticulo.set(m.articuloId, cur);
  }

  // Solo artículos con ventas
  const filas = Array.from(porArticulo.values())
    .filter((f) => f.ventas > 0)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  const totalCostoGeneral = filas.reduce((acc, f) => acc + f.ventas * f.costo, 0);

  return NextResponse.json({
    desde: desdeParam,
    hasta: hastaParam,
    filas,
    totalCosto: Math.round(totalCostoGeneral * 100) / 100,
  });
}
