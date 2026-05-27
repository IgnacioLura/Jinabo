import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { obtenerSesion, AUTH_COOKIE } from "@/lib/auth";
import { aplicarMarkupUsuario } from "@/lib/markup";
import ArticuloDetalleClient from "@/components/articulos/ArticuloDetalleClient";
import type { ArticuloDetalle, Categoria } from "@/types/models";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ArticuloDetallePage({ params }: Params) {
  const { id } = await params;
  const articuloId = Number(id);

  const articulo = await prisma.articulo.findUnique({
    where: { id: articuloId },
    include: {
      categoria: true,
      movimientos: { orderBy: { fecha: "desc" }, take: 100 },
    },
  });
  if (!articulo) notFound();

  const categorias = await prisma.categoria.findMany({
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });

  // Aplicar markup del usuario al artículo
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  const sesion = token ? await obtenerSesion(token) : null;
  // Lee markupExtra de la DB para que stale JWTs no afecten la vista
  const markupExtra = sesion?.userId
    ? ((await prisma.user.findUnique({ where: { id: sesion.userId }, select: { markupExtra: true } }))?.markupExtra ?? 0)
    : 0;
  const esAdmin = sesion?.role === "admin";

  const articuloConMarkup = aplicarMarkupUsuario(
    articulo as unknown as Parameters<typeof aplicarMarkupUsuario>[0],
    markupExtra
  );

  // Para no-admin: cargar su stock asignado
  let miStock: number | undefined;
  if (!esAdmin && sesion?.userId) {
    try {
      const su = await prisma.stockUsuario.findUnique({
        where: { userId_articuloId: { userId: sesion.userId, articuloId } },
      });
      miStock = su?.cantidad ?? 0;
    } catch {
      miStock = 0;
    }
  }

  return (
    <ArticuloDetalleClient
      articuloInicial={{ ...articuloConMarkup, miStock } as unknown as ArticuloDetalle}
      categorias={categorias as unknown as Categoria[]}
    />
  );
}
