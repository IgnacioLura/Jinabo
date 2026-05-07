import { redondear } from "./precios";

export function aplicarMarkupUsuario<T extends {
  costo: number;
  markupBarato: number;
  markupMedio: number;
  markupCaro: number;
  precioBarato: number;
  precioMedio: number;
  precioCaro: number;
  precioBaratoOverride: boolean;
  precioMedioOverride: boolean;
  precioCaroOverride: boolean;
}>(articulo: T, markupExtra: number): T {
  if (markupExtra === 0) return articulo;

  const factor = 1 + markupExtra / 100;
  const costoAjustado = redondear(articulo.costo * factor);

  // Los precios se recalculan desde el costo ajustado.
  // Si el precio tiene override manual, también se escala con el mismo factor.
  const precioBarato = articulo.precioBaratoOverride
    ? redondear(articulo.precioBarato * factor)
    : redondear(costoAjustado * articulo.markupBarato);

  const precioMedio = articulo.precioMedioOverride
    ? redondear(articulo.precioMedio * factor)
    : redondear(costoAjustado * articulo.markupMedio);

  // Meli (precioCaro) nunca se toca — siempre el valor original
  const precioCaro = articulo.precioCaro;

  return {
    ...articulo,
    costo: costoAjustado,
    precioBarato,
    precioMedio,
    precioCaro,
  };
}
