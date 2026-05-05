"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ShoppingCart, ArrowDownToLine, ArrowUpFromLine, SlidersHorizontal, ImageOff, Share2, Check } from "lucide-react";
import { toast } from "sonner";
import type { ArticuloDetalle, Categoria } from "@/types/models";
import StockBadge from "./StockBadge";
import PrecioBadges from "./PrecioBadges";
import MovimientoModal from "./MovimientoModal";
import ArticuloForm from "./ArticuloForm";
import Spinner from "@/components/Spinner";
import { TIPO_COLOR, TIPO_LABEL } from "@/lib/stock";
import { formatearMoneda, MODO_LABEL, type ModoPrecio } from "@/lib/precios";

interface Props {
  articuloInicial: ArticuloDetalle;
  categorias: Categoria[];
}

type Tab = "datos" | "movimientos" | "stats";

export default function ArticuloDetalleClient({
  articuloInicial,
  categorias,
}: Readonly<Props>) {
  const [articulo, setArticulo] = useState(articuloInicial);
  const [tab, setTab] = useState<Tab>("datos");
  const [movModal, setMovModal] = useState<null | "VENTA" | "ENTRADA" | "SALIDA" | "AJUSTE">(null);
  const [refrescando, setRefrescando] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareCopiado, setShareCopiado] = useState<ModoPrecio | null>(null);

  async function refrescar() {
    setRefrescando(true);
    const res = await fetch(`/api/articulos/${articulo.id}`);
    if (res.ok) setArticulo(await res.json());
    setRefrescando(false);
  }

  function onConfirmado() {
    setMovModal(null);
    refrescar();
  }

  const totalVendido = articulo.movimientos
    .filter((m) => m.tipo === "VENTA")
    .reduce((acc, m) => acc + m.cantidad, 0);
  const totalIngresado = articulo.movimientos
    .filter((m) => m.tipo === "ENTRADA")
    .reduce((acc, m) => acc + m.cantidad, 0);
  const ingresosVentas = articulo.movimientos
    .filter((m) => m.tipo === "VENTA")
    .reduce((acc, m) => acc + (m.precioUnitario || 0) * m.cantidad, 0);

  const actionButtons = [
    { tipo: "VENTA" as const, label: "Vender", icon: ShoppingCart, gradient: "from-orange-600 to-red-700" },
    { tipo: "ENTRADA" as const, label: "Ingreso", icon: ArrowDownToLine, gradient: "from-emerald-500 to-green-600" },
    { tipo: "SALIDA" as const, label: "Salida", icon: ArrowUpFromLine, gradient: "from-orange-500 to-amber-600" },
    { tipo: "AJUSTE" as const, label: "Ajuste", icon: SlidersHorizontal, gradient: "from-violet-500 to-purple-600" },
  ];

  return (
    <div className="px-4 md:px-8 py-6 max-w-5xl mx-auto">
      {refrescando && (
        <div className="fixed top-4 right-4 z-40 bg-white/90 backdrop-blur border border-[var(--border)] rounded-full px-3 py-1.5 shadow-md flex items-center gap-2 text-xs font-semibold text-[var(--foreground)]/70">
          <Spinner size={12} />
          Actualizando...
        </div>
      )}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link href="/articulos" className="text-sm text-[var(--foreground)]/50 hover:text-[var(--brand)] transition-colors inline-flex items-center gap-1">
          <ArrowLeft size={14} />
          Volver
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 grid md:grid-cols-[220px_1fr] gap-6 items-start"
      >
        <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-[var(--surface-soft)] to-[#ede4d8] overflow-hidden shadow-md">
          {articulo.fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={articulo.fotoUrl} alt={articulo.nombre} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-[var(--foreground)]/20">
              <ImageOff size={56} strokeWidth={1} />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            {articulo.categoria && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: articulo.categoria.color }}
              >
                {articulo.categoria.nombre}
              </span>
            )}
            <StockBadge stock={articulo.stock} stockMinimo={articulo.stockMinimo} showLabel />
          </div>
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{articulo.nombre}</h1>
            <div className="relative shrink-0">
              <button
                onClick={() => setShareOpen((v) => !v)}
                className="tap p-2 rounded-xl border-2 border-[var(--border)] hover:bg-[var(--surface-soft)] transition-colors"
                title="Compartir"
              >
                <Share2 size={18} />
              </button>
              {shareOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShareOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-30 bg-white rounded-2xl border-2 border-[var(--border)] shadow-xl p-3 w-52">
                  <p className="text-xs font-bold text-[var(--foreground)]/50 mb-2 uppercase tracking-wide px-1">
                    Compartir como
                  </p>
                  {(["BARATO", "MEDIO", "CARO"] as ModoPrecio[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        const modoNum = m === "BARATO" ? "1" : m === "MEDIO" ? "2" : "3";
                        const url = `${window.location.origin}/p/${articulo.id}?modo=${modoNum}`;
                        navigator.clipboard.writeText(url);
                        setShareCopiado(m);
                        setTimeout(() => { setShareCopiado(null); setShareOpen(false); }, 1500);
                        toast.success(`Link ${MODO_LABEL[m]} copiado`);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--surface-soft)] transition-colors text-sm font-semibold text-left"
                    >
                      {MODO_LABEL[m]}
                      {shareCopiado === m && <Check size={14} className="text-emerald-600" />}
                    </button>
                  ))}
                  </div>
                </>
              )}
            </div>
          </div>
          {articulo.sku && <p className="text-sm text-[var(--foreground)]/50 mt-1 font-medium">SKU: {articulo.sku}</p>}
          <div className="mt-4 max-w-md">
            <PrecioBadges
              precioBarato={articulo.precioBarato}
              precioMedio={articulo.precioMedio}
              precioCaro={articulo.precioCaro}
            />
          </div>
          <p className="text-xs text-[var(--foreground)]/50 mt-2 font-medium">
            Costo: <strong className="tabular-nums">{formatearMoneda(articulo.costo)}</strong>
          </p>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-2">
            {actionButtons.map((btn) => {
              const Icon = btn.icon;
              return (
                <motion.button
                  key={btn.tipo}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setMovModal(btn.tipo)}
                  className={`tap py-3 rounded-xl bg-gradient-to-r ${btn.gradient} text-white font-bold shadow-sm flex items-center justify-center gap-1.5 btn-glow`}
                >
                  <Icon size={16} />
                  {btn.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <div className="mt-8 border-b-2 border-[var(--border)] flex gap-1">
        {([
          ["datos", "Datos"],
          ["movimientos", `Movimientos (${articulo.movimientos.length})`],
          ["stats", "Estadisticas"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`tap px-5 py-3 font-semibold text-sm -mb-px transition relative ${
              tab === k
                ? "text-[var(--brand)]"
                : "text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
            }`}
          >
            {label}
            {tab === k && (
              <motion.div
                layoutId="detail-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-600 to-red-700 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="mt-6"
      >
        {tab === "datos" && (
          <ArticuloForm articulo={articulo} categorias={categorias} />
        )}

        {tab === "movimientos" && (
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
            {articulo.movimientos.length === 0 ? (
              <p className="p-8 text-center text-[var(--foreground)]/40 text-lg">
                Aun no hay movimientos registrados.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border)]/60">
                {articulo.movimientos.map((m, i) => (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="p-4 flex flex-wrap items-center gap-3 hover:bg-[var(--surface-soft)]/40 transition-colors"
                  >
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${TIPO_COLOR[m.tipo]}`}>
                      {TIPO_LABEL[m.tipo]}
                    </span>
                    <span className="font-bold text-lg tabular-nums">
                      {m.tipo === "ENTRADA" ? "+" : m.tipo === "AJUSTE" ? "=" : "\u2212"}{m.cantidad}
                    </span>
                    {m.precioUnitario != null && (
                      <span className="text-sm text-[var(--foreground)]/60 tabular-nums">
                        &times; {formatearMoneda(m.precioUnitario)}{m.modoPrecio ? ` (${MODO_LABEL[m.modoPrecio]})` : ""}
                        {" = "}
                        <strong className="text-[var(--brand)]">{formatearMoneda(m.precioUnitario * m.cantidad)}</strong>
                      </span>
                    )}
                    <span className="ml-auto text-xs text-[var(--foreground)]/40 font-medium">
                      {new Date(m.fecha).toLocaleString("es-AR")}
                    </span>
                    {m.motivo && (
                      <p className="basis-full text-sm text-[var(--foreground)]/50 italic pl-1">
                        {m.motivo}
                      </p>
                    )}
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === "stats" && (
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { titulo: "Vendido (acumulado)", valor: totalVendido.toString(), hint: "unidades", gradient: "from-blue-50 to-indigo-50", border: "border-blue-200" },
              { titulo: "Ingresado (acumulado)", valor: totalIngresado.toString(), hint: "unidades", gradient: "from-emerald-50 to-green-50", border: "border-emerald-200" },
              { titulo: "Ingresos por ventas", valor: formatearMoneda(ingresosVentas), hint: "acumulado", gradient: "from-amber-50 to-orange-50", border: "border-amber-200" },
            ].map((card, i) => (
              <motion.div
                key={card.titulo}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-2xl border bg-gradient-to-br ${card.gradient} ${card.border} p-5 card-hover`}
              >
                <div className="text-xs uppercase font-bold text-[var(--foreground)]/50 tracking-wide">{card.titulo}</div>
                <div className="text-3xl font-black mt-2 tabular-nums">{card.valor}</div>
                {card.hint && <div className="text-xs text-[var(--foreground)]/40 mt-1 font-medium">{card.hint}</div>}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {movModal && (
        <MovimientoModal
          articulo={articulo}
          tipoInicial={movModal}
          onClose={() => setMovModal(null)}
          onConfirmado={onConfirmado}
        />
      )}
    </div>
  );
}
