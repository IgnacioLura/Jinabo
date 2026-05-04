import { TipoMovimiento } from "@prisma/client";

export const TIPO_LABEL: Record<TipoMovimiento, string> = {
  ENTRADA: "Ingreso",
  SALIDA: "Salida",
  VENTA: "Venta",
  AJUSTE: "Ajuste",
};

export const TIPO_COLOR: Record<TipoMovimiento, string> = {
  ENTRADA: "bg-emerald-100 text-emerald-800",
  SALIDA: "bg-orange-100 text-orange-800",
  VENTA: "bg-sky-100 text-sky-800",
  AJUSTE: "bg-violet-100 text-violet-800",
};

export interface AplicarMovimientoInput {
  stockActual: number;
  tipo: TipoMovimiento;
  cantidad: number;
}

export function calcularNuevoStock({
  stockActual,
  tipo,
  cantidad,
}: AplicarMovimientoInput): number {
  if (cantidad < 0) {
    throw new Error("La cantidad debe ser positiva");
  }
  if (tipo === "ENTRADA") return stockActual + cantidad;
  if (tipo === "SALIDA" || tipo === "VENTA") return stockActual - cantidad;
  return cantidad;
}

export type StockEstado = "ok" | "bajo" | "agotado";

export function estadoStock(stock: number, stockMinimo: number): StockEstado {
  if (stock <= 0) return "agotado";
  if (stockMinimo > 0 && stock <= stockMinimo) return "bajo";
  return "ok";
}

export const ESTADO_COLOR: Record<StockEstado, string> = {
  ok: "bg-emerald-100 text-emerald-800",
  bajo: "bg-amber-100 text-amber-800",
  agotado: "bg-rose-100 text-rose-800",
};

export const ESTADO_LABEL: Record<StockEstado, string> = {
  ok: "Disponible",
  bajo: "Stock bajo",
  agotado: "Sin stock",
};
