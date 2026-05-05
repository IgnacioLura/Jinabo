export function aplicarMarkupUsuario<T extends {
  precioBarato: number;
  precioMedio: number;
  precioCaro: number;
}>(articulo: T, markupExtra: number): T {
  if (markupExtra === 0) return articulo;
  const factor = 1 + markupExtra / 100;
  const r = (v: number) => Math.round(v * factor * 100) / 100;
  return {
    ...articulo,
    precioBarato: r(articulo.precioBarato),
    precioMedio: r(articulo.precioMedio),
    // costo and precioCaro are never touched by user markup
  };
}
