"use client";

import { formatearMoneda, MODO_LABEL } from "@/lib/precios";
import { motion } from "framer-motion";

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
    { label: MODO_LABEL.BARATO, val: precioBarato, bg: "from-emerald-50 to-emerald-100", text: "text-emerald-800", border: "border-emerald-200" },
    { label: MODO_LABEL.MEDIO, val: precioMedio, bg: "from-amber-50 to-amber-100", text: "text-amber-800", border: "border-amber-200" },
    { label: MODO_LABEL.CARO, val: precioCaro, bg: "from-rose-50 to-rose-100", text: "text-rose-800", border: "border-rose-200" },
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
          <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">
            {it.label}
          </div>
          <div className={`font-black tabular-nums ${compact ? "text-base" : "text-lg"}`}>
            {formatearMoneda(it.val)}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
