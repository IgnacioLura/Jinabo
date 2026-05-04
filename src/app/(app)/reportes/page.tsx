"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Package, ShoppingBag, BarChart3, TrendingUp, AlertTriangle } from "lucide-react";
import { formatearMoneda } from "@/lib/precios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Reporte {
  stockValorizado: number;
  ventasMonto: number;
  ventasUnidades: number;
  cantidadArticulos: number;
  serieVentas: { dia: string; monto: number }[];
  topVendidos: { nombre: string; unidades: number; monto: number }[];
  stockBajo: { id: number; nombre: string; stock: number; stockMinimo: number; categoria: string | null }[];
}

export default function ReportesPage() {
  const [data, setData] = useState<Reporte | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    fetch("/api/reportes")
      .then((r) => r.json())
      .then((d) => { setData(d); setCargando(false); });
  }, []);

  if (cargando) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
        <h1 className="text-3xl font-extrabold tracking-tight mb-6">Reportes</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl p-5 space-y-3">
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-8 w-3/4" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-[350px] rounded-2xl" />
          <div className="skeleton h-[350px] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    { label: "Stock valorizado", value: formatearMoneda(data.stockValorizado), icon: DollarSign, gradient: "from-blue-500 to-indigo-600", bg: "from-blue-50 to-indigo-50", border: "border-blue-200" },
    { label: "Ventas (30 dias)", value: formatearMoneda(data.ventasMonto), icon: TrendingUp, gradient: "from-emerald-500 to-green-600", bg: "from-emerald-50 to-green-50", border: "border-emerald-200" },
    { label: "Unidades vendidas", value: String(data.ventasUnidades), icon: ShoppingBag, gradient: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50", border: "border-amber-200" },
    { label: "Total articulos", value: String(data.cantidadArticulos), icon: Package, gradient: "from-violet-500 to-purple-600", bg: "from-violet-50 to-purple-50", border: "border-violet-200" },
  ];

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold tracking-tight mb-6"
      >
        Reportes
      </motion.h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl border bg-gradient-to-br ${kpi.bg} ${kpi.border} p-5 card-hover`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold opacity-60">{kpi.label}</p>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.gradient} grid place-items-center shadow-sm`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-black tabular-nums">{kpi.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Grafico de ventas */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={20} className="text-[var(--brand)]" />
            <h2 className="text-lg font-bold">Ventas por dia (30 dias)</h2>
          </div>
          {data.serieVentas.length === 0 ? (
            <p className="text-[var(--foreground)]/40 py-12 text-center text-lg">Sin ventas en los ultimos 30 dias</p>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.serieVentas}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#c2410c" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#ea580c" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis
                    dataKey="dia"
                    tickFormatter={(v: string) => v.slice(5)}
                    tick={{ fontSize: 11, fill: "var(--foreground)" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "var(--foreground)" }} />
                  <Tooltip
                    formatter={(value) => [formatearMoneda(Number(value)), "Ventas"]}
                    labelFormatter={(label) => `Dia: ${label}`}
                    contentStyle={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      boxShadow: "var(--shadow-md)",
                    }}
                  />
                  <Bar dataKey="monto" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Top vendidos */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-[var(--brand)]" />
            <h2 className="text-lg font-bold">Top 10 mas vendidos</h2>
          </div>
          {data.topVendidos.length === 0 ? (
            <p className="text-[var(--foreground)]/40 py-12 text-center text-lg">Sin ventas registradas</p>
          ) : (
            <div className="flex flex-col gap-2">
              {data.topVendidos.map((item, i) => (
                <motion.div
                  key={item.nombre}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[var(--surface-soft)]/60 to-transparent hover:from-[var(--surface-soft)] transition-colors"
                >
                  <span className={`w-8 h-8 rounded-lg font-black text-sm grid place-items-center shrink-0 text-white shadow-sm ${
                    i === 0 ? "bg-gradient-to-br from-amber-400 to-yellow-600" :
                    i === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500" :
                    i === 2 ? "bg-gradient-to-br from-orange-400 to-amber-700" :
                    "bg-gradient-to-br from-gray-200 to-gray-400"
                  }`}>
                    {i + 1}
                  </span>
                  <span className="flex-1 font-semibold truncate">{item.nombre}</span>
                  <span className="text-sm text-[var(--foreground)]/50 whitespace-nowrap font-medium">
                    {item.unidades} uds
                  </span>
                  <span className="font-bold tabular-nums whitespace-nowrap text-[var(--brand)]">
                    {formatearMoneda(item.monto)}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Alertas de stock bajo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-amber-500" />
          <h2 className="text-lg font-bold">
            Alertas de stock bajo
          </h2>
          {data.stockBajo.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-red-100 text-red-700 border border-red-200">
              {data.stockBajo.length}
            </span>
          )}
        </div>
        {data.stockBajo.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-600 font-semibold text-lg">Todo en orden</p>
            <p className="text-[var(--foreground)]/40 text-sm mt-1">No hay articulos con stock bajo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-[var(--border)] text-sm text-[var(--foreground)]/50">
                  <th className="py-2.5 pr-4 font-semibold">Articulo</th>
                  <th className="py-2.5 pr-4 font-semibold">Categoria</th>
                  <th className="py-2.5 pr-4 font-semibold text-right">Stock</th>
                  <th className="py-2.5 font-semibold text-right">Minimo</th>
                </tr>
              </thead>
              <tbody>
                {data.stockBajo.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 + i * 0.03 }}
                    className="border-b border-[var(--border)]/40 hover:bg-[var(--surface-soft)]/50 transition-colors"
                  >
                    <td className="py-3 pr-4 font-semibold">{item.nombre}</td>
                    <td className="py-3 pr-4 text-sm text-[var(--foreground)]/50">{item.categoria || "\u2014"}</td>
                    <td className={`py-3 pr-4 text-right font-bold tabular-nums ${
                      item.stock === 0 ? "text-red-600" : "text-amber-600"
                    }`}>
                      {item.stock === 0 && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 pulse-soft" />}
                      {item.stock}
                    </td>
                    <td className="py-3 text-right tabular-nums text-[var(--foreground)]/50">
                      {item.stockMinimo}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
