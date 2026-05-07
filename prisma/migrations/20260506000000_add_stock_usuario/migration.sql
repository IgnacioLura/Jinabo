-- Add ASIGNACION to TipoMovimiento enum
ALTER TYPE "TipoMovimiento" ADD VALUE 'ASIGNACION';

-- CreateTable StockUsuario
CREATE TABLE "StockUsuario" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StockUsuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StockUsuario_userId_articuloId_key" ON "StockUsuario"("userId", "articuloId");
CREATE INDEX "StockUsuario_userId_idx" ON "StockUsuario"("userId");
CREATE INDEX "StockUsuario_articuloId_idx" ON "StockUsuario"("articuloId");

-- AddForeignKey
ALTER TABLE "StockUsuario" ADD CONSTRAINT "StockUsuario_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "StockUsuario" ADD CONSTRAINT "StockUsuario_articuloId_fkey"
    FOREIGN KEY ("articuloId") REFERENCES "Articulo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
