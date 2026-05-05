import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import * as bcrypt from "bcryptjs";
import path from "path";
import { CATEGORIAS_SEED, detectarCategoria } from "../src/lib/categorias";
import { calcularPrecios } from "../src/lib/precios";

const prisma = new PrismaClient();

const SEED_FILE = path.join(process.cwd(), "seed", "lista-interna.xlsx");

interface FilaExcel {
  nombre: string;
  cantidad: number;
  costo: number;
  precioMayor: number | null;
  precioMenor: number | null;
  precioML: number | null;
}

function parsearExcel(filePath: string): FilaExcel[] {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  const filas: FilaExcel[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row)) continue;
    const nombre = String(row[0] ?? "").trim();
    if (!nombre || nombre === "Articulo") continue;

    const cantidad = parseFloat(String(row[1] ?? "0")) || 0;
    const costo = parseFloat(String(row[2] ?? "0")) || 0;
    const precioMayor = parseFloat(String(row[3] ?? "")) || null;
    const precioMenor = parseFloat(String(row[4] ?? "")) || null;
    const precioML = parseFloat(String(row[5] ?? "")) || null;

    if (costo === 0 && precioMayor === null) continue;

    filas.push({
      nombre,
      cantidad: Math.round(cantidad),
      costo,
      precioMayor,
      precioMenor,
      precioML,
    });
  }
  return filas;
}

async function seedUsuarios() {
  const defaultUsers = [
    { username: "admin", password: "1234", role: "admin", markupExtra: 0 },
    { username: "VGarcia", password: "1234", role: "user", markupExtra: 20 },
  ];
  for (const u of defaultUsers) {
    const existing = await prisma.user.findUnique({ where: { username: u.username } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await prisma.user.create({
        data: { username: u.username, passwordHash, role: u.role, markupExtra: u.markupExtra },
      });
      console.log(`  Usuario creado: ${u.username}`);
    }
  }
}

async function main() {
  console.log("Sembrando usuarios...");
  await seedUsuarios();

  console.log("Sembrando categorías...");
  const catMap = new Map<string, number>();
  for (const cat of CATEGORIAS_SEED) {
    const c = await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: { color: cat.color, orden: cat.orden },
      create: { nombre: cat.nombre, color: cat.color, orden: cat.orden },
    });
    catMap.set(cat.nombre, c.id);
  }
  console.log(`  ${catMap.size} categorías listas`);

  console.log(`Leyendo ${SEED_FILE}...`);
  const filas = parsearExcel(SEED_FILE);
  console.log(`  ${filas.length} artículos detectados`);

  let creados = 0;
  let omitidos = 0;
  for (const fila of filas) {
    const categoriaNombre = detectarCategoria(fila.nombre);
    const categoriaId = catMap.get(categoriaNombre)!;

    const existente = await prisma.articulo.findFirst({
      where: { nombre: fila.nombre },
    });
    if (existente) {
      omitidos++;
      continue;
    }

    const markupBarato = fila.costo > 0 && fila.precioMayor
      ? Math.round((fila.precioMayor / fila.costo) * 100) / 100
      : 1.20;
    const markupMedio = fila.costo > 0 && fila.precioMenor
      ? Math.round((fila.precioMenor / fila.costo) * 100) / 100
      : 2.00;
    const markupCaro = fila.costo > 0 && fila.precioML
      ? Math.round((fila.precioML / fila.costo) * 100) / 100
      : 2.50;

    const precios = calcularPrecios({
      costo: fila.costo,
      markupBarato,
      markupMedio,
      markupCaro,
    });

    await prisma.articulo.create({
      data: {
        nombre: fila.nombre,
        categoriaId,
        costo: fila.costo,
        markupBarato,
        markupMedio,
        markupCaro,
        precioBarato: precios.precioBarato,
        precioMedio: precios.precioMedio,
        precioCaro: precios.precioCaro,
        stock: Math.round(fila.cantidad),
        stockMinimo: 0,
        movimientos: fila.cantidad > 0
          ? {
              create: {
                tipo: "ENTRADA",
                cantidad: Math.round(fila.cantidad),
                motivo: "Stock inicial (importación Excel)",
              },
            }
          : undefined,
      },
    });
    creados++;
  }

  console.log(`Importación finalizada: ${creados} creados, ${omitidos} ya existían`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
