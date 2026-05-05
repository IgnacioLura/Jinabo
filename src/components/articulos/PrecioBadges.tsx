"use client";

import { formatearMoneda, MODO_LABEL } from "@/lib/precios";
import { motion } from "framer-motion";

function MercadoLibreIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size + 4} height={size} viewBox="0 0 36 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Cart body */}
      <path
        d="M2 4h4.5l5.5 15h16l4-12H10.5"
        stroke="#1A3A5C"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Wheels */}
      <circle cx="14" cy="25" r="2.5" fill="#1A3A5C" />
      <circle cx="26" cy="25" r="2.5" fill="#1A3A5C" />
    </svg>
  );
}

interface Props {
  precioBarato: number;
  precioMedio: number;
  precioCaro: number;
  compact?: boolean;
}

export default function PrecioBadges({
  precioBarato,
  precioMedio,
  precioCaro,
  compact = false,
}: Readonly<Props>) {
  const items = [
    {
      label: MODO_LABEL.BARATO,
      val: precioBarato,
      bg: "from-emerald-50 to-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200",
      icon: null,
    },
    {
      label: MODO_LABEL.MEDIO,
      val: precioMedio,
      bg: "from-amber-50 to-amber-100",
      text: "text-amber-800",
      border: "border-amber-200",
      icon: null,
    },
    {
      label: MODO_LABEL.CARO,
      val: precioCaro,
      bg: "from-[#fff9c4] to-[#fff176]",
      text: "text-[#1a3a5c]",
      border: "border-[#ffe600]/60",
      icon: <MercadoLibreIcon size={compact ? 12 : 14} />,
    },
  ];

  return (
    <div className={`grid grid-cols-3 ${compact ? "gap-1.5" : "gap-2"}`}>
      {items.map((it, i) => (
        <motion.div
          key={it.label}
          initial={!compact ? { opacity: 0, y: 5 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`px-2 py-1.5 rounded-xl border bg-gradient-to-br ${it.bg} ${it.border} ${it.text} text-center`}
        >
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-80 flex items-center justify-center gap-1">
            {it.icon}
            {it.icon ? "Meli" : it.label}
          </div>
          <div className={`font-black tabular-nums ${compact ? "text-base" : "text-lg"}`}>
            {formatearMoneda(it.val)}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
