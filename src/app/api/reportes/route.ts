import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const articulos = await prisma.articulo.findMany({
    include: { categoria: true },
  });

  const desde = new Date();
  desde.setDate(desde.getDate() - 30);

  const ventas = await prisma.movimiento.findMany({
    where: { tipo: "VENTA", fecha: { gte: desde } },
    include: { articulo: true },
    orderBy: { fecha: "asc" },
  });

  const stockValorizado = articulos.reduce(
    (acc, a) => acc + a.costo * a.stock,
    0,
  );
  const ventasMonto = ventas.reduce(
    (acc, v) => acc + (v.precioUnitario || 0) * v.cantidad,
    0,
  );
  const ventasUnidades = ventas.reduce((acc, v) => acc + v.cantidad, 0);

  const ventasPorDia = new Map<string, number>();
  for (const v of ventas) {
    const dia = v.fecha.toISOString().slice(0, 10);
    const monto = (v.precioUnitario || 0) * v.cantidad;
    ventasPorDia.set(dia, (ventasPorDia.get(dia) || 0) + monto);
  }
  const serieVentas = Array.from(ventasPorDia.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dia, monto]) => ({ dia, monto: Math.round(monto * 100) / 100 }));

  const porArticulo = new Map<number, { nombre: string; unidades: number; monto: number }>();
  for (const v of ventas) {
    const cur = porArticulo.get(v.articuloId) || {
      nombre: v.articulo.nombre,
      unidades: 0,
      monto: 0,
    };
    cur.unidades += v.cantidad;
    cur.monto += (v.precioUnitario || 0) * v.cantidad;
    porArticulo.set(v.articuloId, cur);
  }
  const topVendidos = Array.from(porArticulo.values())
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 10);

  const stockBajo = articulos
    .filter((a) => a.stock <= a.stockMinimo && a.stockMinimo > 0)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 20)
    .map((a) => ({
      id: a.id,
      nombre: a.nombre,
      stock: a.stock,
      stockMinimo: a.stockMinimo,
      categoria: a.categoria?.nombre || null,
    }));

  return NextResponse.json({
    stockValorizado: Math.round(stockValorizado * 100) / 100,
    ventasMonto: Math.round(ventasMonto * 100) / 100,
    ventasUnidades,
    cantidadArticulos: articulos.length,
    serieVentas,
    topVendidos,
    stockBajo,
  });
}
