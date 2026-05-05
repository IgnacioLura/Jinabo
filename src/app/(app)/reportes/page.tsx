"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Package,
  ShoppingBag,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Search,
  Printer,
  FileText,
} from "lucide-react";
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
  esAdmin: boolean;
  stockValorizado: number;
  ventasMonto: number;
  ventasUnidades: number;
  cantidadArticulos: number;
  serieVentas: { dia: string; monto: number }[];
  topVendidos: { nombre: string; unidades: number; monto: number }[];
  stockBajo: {
    id: number;
    nombre: string;
    stock: number;
    stockMinimo: number;
    categoria: string | null;
  }[];
}

interface FilaLiquidacion {
  id: number;
  nombre: string;
  categoria: string | null;
  costo: number;
  entradas: number;
  salidas: number;
  ventas: number;
  totalCosto: number;
}

interface Liquidacion {
  desde: string;
  hasta: string;
  filas: FilaLiquidacion[];
  totalCosto: number;
}

function hoy(): string {
  return new Date().toISOString().slice(0, 10);
}

function primerDiaMes(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

export default function ReportesPage() {
  const [data, setData] = useState<Reporte | null>(null);
  const [cargando, setCargando] = useState(true);

  // Liquidación
  const [desde, setDesde] = useState(primerDiaMes());
  const [hasta, setHasta] = useState(hoy());
  const [liquidacion, setLiquidacion] = useState<Liquidacion | null>(null);
  const [cargandoLiq, setCargandoLiq] = useState(false);
  const [errorLiq, setErrorLiq] = useState("");

  useEffect(() => {
    fetch("/api/reportes")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setCargando(false);
      });
  }, []);

  async function buscarLiquidacion() {
    setErrorLiq("");
    setCargandoLiq(true);
    try {
      const res = await fetch(`/api/reportes/liquidacion?desde=${desde}&hasta=${hasta}`);
      if (!res.ok) throw new Error("Error");
      setLiquidacion(await res.json());
    } catch {
      setErrorLiq("Error al cargar el reporte");
    } finally {
      setCargandoLiq(false);
    }
  }

  function imprimir() {
    window.print();
  }

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

  const kpisBase = [
    {
      label: "Ventas (30 dias)",
      value: formatearMoneda(data.ventasMonto),
      icon: TrendingUp,
      gradient: "from-emerald-500 to-green-600",
      bg: "from-emerald-50 to-green-50",
      border: "border-emerald-200",
    },
    {
      label: "Unidades vendidas",
      value: String(data.ventasUnidades),
      icon: ShoppingBag,
      gradient: "from-amber-500 to-orange-500",
      bg: "from-amber-50 to-orange-50",
      border: "border-amber-200",
    },
  ];

  const kpisAdmin = [
    {
      label: "Stock valorizado",
      value: formatearMoneda(data.stockValorizado),
      icon: DollarSign,
      gradient: "from-blue-500 to-indigo-600",
      bg: "from-blue-50 to-indigo-50",
      border: "border-blue-200",
    },
    {
      label: "Total articulos",
      value: String(data.cantidadArticulos),
      icon: Package,
      gradient: "from-violet-500 to-purple-600",
      bg: "from-violet-50 to-purple-50",
      border: "border-violet-200",
    },
  ];

  const kpis = data.esAdmin ? [...kpisAdmin, ...kpisBase] : kpisBase;

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1400px] mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold tracking-tight mb-6 no-print"
      >
        {data.esAdmin ? "Reportes" : "Mis Ventas"}
      </motion.h1>

      {/* KPI Cards — ocultos en impresión */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 no-print">
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
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.gradient} grid place-items-center shadow-sm`}
                >
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-black tabular-nums">{kpi.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 no-print">
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
            <p className="text-[var(--foreground)]/40 py-12 text-center text-lg">
              Sin ventas en los ultimos 30 dias
            </p>
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
            <p className="text-[var(--foreground)]/40 py-12 text-center text-lg">
              Sin ventas registradas
            </p>
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
                  <span
                    className={`w-8 h-8 rounded-lg font-black text-sm grid place-items-center shrink-0 text-white shadow-sm ${
                      i === 0
                        ? "bg-gradient-to-br from-amber-400 to-yellow-600"
                        : i === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-500"
                          : i === 2
                            ? "bg-gradient-to-br from-orange-400 to-amber-700"
                            : "bg-gradient-to-br from-gray-200 to-gray-400"
                    }`}
                  >
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

      {/* Alertas de stock bajo — solo admin */}
      {data.esAdmin && <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm mb-8 no-print"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-amber-500" />
          <h2 className="text-lg font-bold">Alertas de stock bajo</h2>
          {data.stockBajo.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-sm font-bold bg-red-100 text-red-700 border border-red-200">
              {data.stockBajo.length}
            </span>
          )}
        </div>
        {data.stockBajo.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-emerald-600 font-semibold text-lg">Todo en orden</p>
            <p className="text-[var(--foreground)]/40 text-sm mt-1">
              No hay articulos con stock bajo
            </p>
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
                    <td className="py-3 pr-4 text-sm text-[var(--foreground)]/50">
                      {item.categoria || "—"}
                    </td>
                    <td
                      className={`py-3 pr-4 text-right font-bold tabular-nums ${
                        item.stock === 0 ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      {item.stock === 0 && (
                        <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5 pulse-soft" />
                      )}
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
      </motion.div>}

      {/* ─── LIQUIDACIÓN — solo admin ─────────────────────── */}
      {data.esAdmin && <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-sm"
        id="liquidacion"
      >
        {/* Controles — ocultos en impresión */}
        <div className="no-print">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-[var(--brand)]" />
            <h2 className="text-lg font-bold">Liquidación por período</h2>
          </div>
          <div className="flex flex-wrap items-end gap-3 mb-4">
            <label className="block">
              <span className="text-xs font-semibold text-[var(--foreground)]/60 block mb-1">
                Desde
              </span>
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="h-10 px-3 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none transition-colors text-sm"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-[var(--foreground)]/60 block mb-1">
                Hasta
              </span>
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="h-10 px-3 rounded-xl border-2 border-[var(--border)] focus:border-[var(--brand)] focus:outline-none transition-colors text-sm"
              />
            </label>
            <button
              onClick={buscarLiquidacion}
              disabled={cargandoLiq}
              className="tap h-10 px-5 rounded-xl bg-gradient-to-r from-orange-600 to-red-700 text-white font-bold text-sm flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Search size={15} />
              {cargandoLiq ? "Consultando..." : "Consultar"}
            </button>
            {liquidacion && (
              <button
                onClick={imprimir}
                className="tap h-10 px-5 rounded-xl bg-white border-2 border-[var(--border)] font-bold text-sm flex items-center gap-2 hover:bg-[var(--surface-soft)] transition-colors"
              >
                <Printer size={15} />
                Imprimir
              </button>
            )}
          </div>
          {errorLiq && (
            <p className="text-sm text-red-600 font-medium mb-3">{errorLiq}</p>
          )}
        </div>

        {/* Tabla de liquidación */}
        {liquidacion ? (
          <>
            {/* Header de impresión */}
            <div className="print-only mb-6">
              <h1 className="text-2xl font-black">Jin Bao Importaciones — Liquidación</h1>
              <p className="text-sm text-gray-500 mt-1">
                Período: {liquidacion.desde} al {liquidacion.hasta}
              </p>
            </div>

            {liquidacion.filas.length === 0 ? (
              <p className="text-center text-[var(--foreground)]/40 py-8 text-lg">
                Sin movimientos en ese período
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b-2 border-[var(--border)] text-xs text-[var(--foreground)]/50">
                      <th className="py-2.5 pr-3 font-semibold">Artículo</th>
                      <th className="py-2.5 pr-3 font-semibold">Categoría</th>
                      <th className="py-2.5 pr-3 font-semibold text-right">Ingresadas</th>
                      <th className="py-2.5 pr-3 font-semibold text-right">Vendidas</th>
                      <th className="py-2.5 pr-3 font-semibold text-right">Salidas</th>
                      <th className="py-2.5 pr-3 font-semibold text-right">Costo unit.</th>
                      <th className="py-2.5 font-semibold text-right">Total costo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liquidacion.filas.map((f) => (
                      <tr
                        key={f.id}
                        className="border-b border-[var(--border)]/40 hover:bg-[var(--surface-soft)]/40 transition-colors"
                      >
                        <td className="py-2.5 pr-3 font-semibold">{f.nombre}</td>
                        <td className="py-2.5 pr-3 text-[var(--foreground)]/50">
                          {f.categoria || "—"}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums font-medium text-emerald-700">
                          {f.entradas > 0 ? `+${f.entradas}` : "—"}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums font-medium text-orange-700">
                          {f.ventas > 0 ? f.ventas : "—"}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums font-medium text-[var(--foreground)]/50">
                          {f.salidas > 0 ? f.salidas : "—"}
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-[var(--foreground)]/60">
                          {formatearMoneda(f.costo)}
                        </td>
                        <td className="py-2.5 text-right tabular-nums font-bold text-[var(--brand)]">
                          {formatearMoneda(f.totalCosto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[var(--border)]">
                      <td colSpan={6} className="py-3 font-extrabold text-right pr-3">
                        TOTAL A PAGAR
                      </td>
                      <td className="py-3 text-right font-black text-xl tabular-nums text-[var(--brand)]">
                        {formatearMoneda(liquidacion.totalCosto)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <p className="print-only mt-6 text-xs text-gray-400 text-center">
              Jin Bao Importaciones · {new Date().toLocaleDateString("es-AR")}
            </p>
          </>
        ) : (
          !cargandoLiq && (
            <p className="text-center text-[var(--foreground)]/30 py-8 text-sm">
              Elegí un período y presioná Consultar
            </p>
          )
        )}
      </motion.div>}
    </div>
  );
}
