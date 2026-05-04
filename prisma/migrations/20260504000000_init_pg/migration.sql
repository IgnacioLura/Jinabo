-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('ENTRADA', 'SALIDA', 'VENTA', 'AJUSTE');

-- CreateEnum
CREATE TYPE "ModoPrecio" AS ENUM ('BARATO', 'MEDIO', 'CARO');

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#94a3b8',
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Articulo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "sku" TEXT,
    "categoriaId" INTEGER,
    "costo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "markupBarato" DOUBLE PRECISION NOT NULL DEFAULT 1.20,
    "markupMedio" DOUBLE PRECISION NOT NULL DEFAULT 2.00,
    "markupCaro" DOUBLE PRECISION NOT NULL DEFAULT 2.50,
    "precioBarato" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precioMedio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precioCaro" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precioBaratoOverride" BOOLEAN NOT NULL DEFAULT false,
    "precioMedioOverride" BOOLEAN NOT NULL DEFAULT false,
    "precioCaroOverride" BOOLEAN NOT NULL DEFAULT false,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "stockMinimo" INTEGER NOT NULL DEFAULT 0,
    "fotoUrl" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Articulo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimiento" (
    "id" SERIAL NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION,
    "modoPrecio" "ModoPrecio",
    "motivo" TEXT,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Movimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Articulo_sku_key" ON "Articulo"("sku");

-- CreateIndex
CREATE INDEX "Articulo_categoriaId_idx" ON "Articulo"("categoriaId");

-- CreateIndex
CREATE INDEX "Articulo_nombre_idx" ON "Articulo"("nombre");

-- CreateIndex
CREATE INDEX "Movimiento_articuloId_fecha_idx" ON "Movimiento"("articuloId", "fecha");

-- CreateIndex
CREATE INDEX "Movimiento_fecha_idx" ON "Movimiento"("fecha");

-- CreateIndex
CREATE INDEX "Movimiento_tipo_fecha_idx" ON "Movimiento"("tipo", "fecha");

-- AddForeignKey
ALTER TABLE "Articulo" ADD CONSTRAINT "Articulo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimiento" ADD CONSTRAINT "Movimiento_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
