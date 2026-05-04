import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticuloDetalleClient from "@/components/articulos/ArticuloDetalleClient";
import type { ArticuloDetalle, Categoria } from "@/types/models";

interface Params {
  params: Promise<{ id: string }>;
}

export default async function ArticuloDetallePage({ params }: Params) {
  const { id } = await params;
  const articulo = await prisma.articulo.findUnique({
    where: { id: Number(id) },
    include: {
      categoria: true,
      movimientos: { orderBy: { fecha: "desc" }, take: 100 },
    },
  });
  if (!articulo) notFound();

  const categorias = await prisma.categoria.findMany({
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });

  return (
    <ArticuloDetalleClient
      articuloInicial={articulo as unknown as ArticuloDetalle}
      categorias={categorias as unknown as Categoria[]}
    />
  );
}
