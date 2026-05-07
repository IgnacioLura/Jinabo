"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, ImageOff } from "lucide-react";
import type { Articulo } from "@/types/models";
import StockBadge from "./StockBadge";
import PrecioBadges from "./PrecioBadges";
import { textColorForBg } from "@/lib/colors";

interface Props {
  articulo: Articulo;
  onVender: (a: Articulo) => void;
  index?: number;
  esAdmin?: boolean;
  miStock?: number;
}

export default function ArticuloCard({ articulo, onVender, index = 0, esAdmin = true, miStock }: Readonly<Props>) {
  const stockMostrado = !esAdmin && miStock !== undefined ? miStock : articulo.stock;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.35 }}
      className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden card-hover flex flex-col shadow-sm"
    >
      <Link
        href={`/articulos/${articulo.id}`}
        aria-label={articulo.nombre}
        className="block aspect-square bg-gradient-to-br from-[var(--surface-soft)] to-[#ede4d8] relative overflow-hidden group"
      >
        {articulo.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={articulo.fotoUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-[var(--foreground)]/20" aria-hidden="true">
            <ImageOff size={48} strokeWidth={1} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />

        <div className="absolute top-2 right-2">
          <StockBadge stock={stockMostrado} stockMinimo={esAdmin ? articulo.stockMinimo : 0} />
        </div>
        {articulo.categoria && (
          <span
            className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md backdrop-blur-sm"
            style={{ backgroundColor: `${articulo.categoria.color}dd`, color: textColorForBg(articulo.categoria.color) }}
          >
            {articulo.categoria.nombre}
          </span>
        )}
      </Link>

      <div className="p-3 flex flex-col gap-3 flex-1">
        <p className="font-bold text-[15px] leading-tight line-clamp-2 min-h-[36px]">
          {articulo.nombre}
        </p>
        <PrecioBadges
          precioBarato={articulo.precioBarato}
          precioMedio={articulo.precioMedio}
          precioCaro={articulo.precioCaro}
          compact
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onVender(articulo)}
          className="tap mt-auto w-full px-4 py-3.5 bg-gradient-to-r from-orange-600 to-red-700 text-white rounded-xl font-bold hover:shadow-md transition-shadow flex items-center justify-center gap-2 btn-glow"
        >
          <ShoppingCart size={16} aria-hidden="true" />
          Vender
        </motion.button>
      </div>
    </motion.div>
  );
}
