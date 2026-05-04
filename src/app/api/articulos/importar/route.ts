import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { detectarCategoria } from "@/lib/categorias";
import { calcularPrecios } from "@/lib/precios";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const archivo = formData.get("archivo") as File | null;
  if (!archivo) return NextResponse.json({ error: "Falta archivo" }, { status: 400 });

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const wb = XLSX.read(buffer, { type: "buffer" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });

  const categorias = await prisma.categoria.findMany();
  const catMap = new Map(categorias.map((c) => [c.nombre, c.id]));

  let creados = 0;
  let omitidos = 0;
  const errores: string[] = [];

  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    const nombre = String(row[0] ?? "").trim();
    if (!nombre || nombre === "Articulo") continue;

    const cantidad = parseFloat(String(row[1] ?? "0")) || 0;
    const costo = parseFloat(String(row[2] ?? "0")) || 0;
    const precioMayor = parseFloat(String(row[3] ?? "")) || null;
    const precioMenor = parseFloat(String(row[4] ?? "")) || null;
    const precioML = parseFloat(String(row[5] ?? "")) || null;

    if (costo === 0 && precioMayor === null) continue;

    try {
      const existe = await prisma.articulo.findFirst({ where: { nombre } });
      if (existe) { omitidos++; continue; }

      const categoriaNombre = detectarCategoria(nombre);
      let categoriaId = catMap.get(categoriaNombre);
      if (!categoriaId) {
        const cat = await prisma.categoria.upsert({
          where: { nombre: categoriaNombre },
          update: {},
          create: { nombre: categoriaNombre, color: "#94a3b8", orden: 99 },
        });
        categoriaId = cat.id;
        catMap.set(categoriaNombre, categoriaId);
      }

      const markupBarato = costo > 0 && precioMayor ? Math.round((precioMayor / costo) * 100) / 100 : 1.20;
      const markupMedio = costo > 0 && precioMenor ? Math.round((precioMenor / costo) * 100) / 100 : 2.00;
      const markupCaro = costo > 0 && precioML ? Math.round((precioML / costo) * 100) / 100 : 2.50;
      const precios = calcularPrecios({ costo, markupBarato, markupMedio, markupCaro });
      const stock = Math.round(cantidad);

      await prisma.articulo.create({
        data: {
          nombre,
          categoriaId,
          costo,
          markupBarato,
          markupMedio,
          markupCaro,
          precioBarato: precios.precioBarato,
          precioMedio: precios.precioMedio,
          precioCaro: precios.precioCaro,
          stock,
          stockMinimo: 0,
          movimientos: stock > 0 ? {
            create: { tipo: "ENTRADA", cantidad: stock, motivo: "Stock inicial (importación Excel)" },
          } : undefined,
        },
      });
      creados++;
    } catch (e) {
      errores.push(`${nombre}: ${e instanceof Error ? e.message : "error"}`);
    }
  }

  return NextResponse.json({ creados, omitidos, errores });
}
