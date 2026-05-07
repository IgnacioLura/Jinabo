import type {
  Articulo as PrismaArticulo,
  Categoria as PrismaCategoria,
  Movimiento as PrismaMovimiento,
} from "@prisma/client";

export type Categoria = PrismaCategoria & {
  _count?: { articulos: number };
};

export type Articulo = PrismaArticulo & {
  categoria?: PrismaCategoria | null;
  miStock?: number; // stock asignado al usuario actual (no-admin)
};

export type ArticuloDetalle = Articulo & {
  movimientos: PrismaMovimiento[];
};

export type Movimiento = PrismaMovimiento;
