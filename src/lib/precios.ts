export type ModoPrecio = "BARATO" | "MEDIO" | "CARO";

export const MODOS: ModoPrecio[] = ["BARATO", "MEDIO", "CARO"];

export const MODO_LABEL: Record<ModoPrecio, string> = {
  BARATO: "Mayorista",
  MEDIO: "Minorista",
  CARO: "Mercado Libre",
};

export const MODO_DESCRIPCION: Record<ModoPrecio, string> = {
  BARATO: "Precio para venta por mayor",
  MEDIO: "Precio para venta directa",
  CARO: "Precio publicado en Mercado Libre",
};

export interface Markups {
  markupBarato: number;
  markupMedio: number;
  markupCaro: number;
}

export interface PreciosInput extends Markups {
  costo: number;
  precioBarato?: number;
  precioMedio?: number;
  precioCaro?: number;
  precioBaratoOverride?: boolean;
  precioMedioOverride?: boolean;
  precioCaroOverride?: boolean;
}

export interface PreciosCalculados {
  precioBarato: number;
  precioMedio: number;
  precioCaro: number;
}

export function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function calcularPrecios(input: PreciosInput): PreciosCalculados {
  const base = input.costo;
  const barato = input.precioBaratoOverride && input.precioBarato !== undefined
    ? input.precioBarato
    : redondear(base * input.markupBarato);
  const medio = input.precioMedioOverride && input.precioMedio !== undefined
    ? input.precioMedio
    : redondear(base * input.markupMedio);
  const caro = input.precioCaroOverride && input.precioCaro !== undefined
    ? input.precioCaro
    : redondear(base * input.markupCaro);
  return { precioBarato: barato, precioMedio: medio, precioCaro: caro };
}

export function precioPorModo(
  precios: PreciosCalculados,
  modo: ModoPrecio,
): number {
  if (modo === "BARATO") return precios.precioBarato;
  if (modo === "MEDIO") return precios.precioMedio;
  return precios.precioCaro;
}

export function formatearMoneda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
}
