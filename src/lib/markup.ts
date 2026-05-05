export function aplicarMarkupUsuario<T extends {
  costo: number;
  precioBarato: number;
  precioMedio: number;
  precioCaro: number;
}>(articulo: T, markupExtra: number): T {
  if (markupExtra === 0) return articulo;
  const factor = 1 + markupExtra / 100;
  const r = (v: number) => Math.round(v * factor * 100) / 100;
  return {
    ...articulo,
    costo: r(articulo.costo),
    precioBarato: r(articulo.precioBarato),
    precioMedio: r(articulo.precioMedio),
    // precioCaro is fixed — ML price never changes with user markup
  };
}
