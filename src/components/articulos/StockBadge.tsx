"use client";

import { ESTADO_COLOR, ESTADO_LABEL, estadoStock } from "@/lib/stock";
import { AlertTriangle } from "lucide-react";

interface Props {
  stock: number;
  stockMinimo: number;
  showLabel?: boolean;
}

export default function StockBadge({ stock, stockMinimo, showLabel = false }: Readonly<Props>) {
  const estado = estadoStock(stock, stockMinimo);
  const isLow = estado === "bajo" || estado === "agotado";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-semibold shadow-sm ${ESTADO_COLOR[estado]} ${isLow ? "pulse-soft" : ""}`}
    >
      {isLow && <AlertTriangle size={13} />}
      <span className="font-bold tabular-nums">{stock}</span>
      {showLabel && <span className="text-xs opacity-80">{ESTADO_LABEL[estado]}</span>}
    </span>
  );
}
