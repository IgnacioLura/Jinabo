import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { obtenerSesionDeRequest } from "@/lib/auth";

interface Params {
  params: Promise<{ id: string }>;
}

/** GET /api/articulos/[id]/asignar — retorna breakdown de stock por usuario (admin) */
export async function GET(req: NextRequest, { params }: Params) {
  const sesion = await obtenerSesionDeRequest(req);
  if (!sesion || sesion.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { id } = await params;
  const articuloId = Number(id);

  const stockUsuario = await prisma.stockUsuario.findMany({
    where: { articuloId },
    include: { user: { select: { id: true, username: true } } },
    orderBy: { cantidad: "desc" },
  });

  return NextResponse.json(stockUsuario);
}

/** POST /api/articulos/[id]/asignar — admin asigna stock a un usuario */
export async function POST(req: NextRequest, { params }: Params) {
  const sesion = await obtenerSesionDeRequest(req);
  if (!sesion || sesion.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const articuloId = Number(id);
  const body = await req.json();
  const userId = Number(body.userId);
  const cantidad = Math.max(1, Math.floor(Number(body.cantidad) || 0));

  if (!userId || cantidad <= 0) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const [articulo, usuario] = await Promise.all([
    prisma.articulo.findUnique({
      where: { id: articuloId },
      include: { stockUsuario: true },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
  ]);

  if (!articulo) {
    return NextResponse.json({ error: "Artículo no encontrado" }, { status: 404 });
  }
  if (!usuario) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const totalAsignado = articulo.stockUsuario.reduce((acc, s) => acc + s.cantidad, 0);
  const poolLibre = articulo.stock - totalAsignado;
  if (cantidad > poolLibre) {
    return NextResponse.json(
      { error: `Stock disponible insuficiente (pool libre: ${poolLibre})` },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.movimiento.create({
      data: { articuloId, userId, tipo: "ASIGNACION", cantidad },
    }),
    prisma.stockUsuario.upsert({
      where: { userId_articuloId: { userId, articuloId } },
      create: { userId, articuloId, cantidad },
      update: { cantidad: { increment: cantidad } },
    }),
  ]);

  const stockUsuario = await prisma.stockUsuario.findMany({
    where: { articuloId },
    include: { user: { select: { id: true, username: true } } },
    orderBy: { cantidad: "desc" },
  });

  return NextResponse.json({ ok: true, stockUsuario });
}
