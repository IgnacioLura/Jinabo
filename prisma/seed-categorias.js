const { PrismaClient } = require("@prisma/client");

const CATEGORIAS = [
  { nombre: "Cocina", color: "#f59e0b", orden: 1 },
  { nombre: "Electrodomésticos", color: "#0ea5e9", orden: 2 },
  { nombre: "Iluminación", color: "#eab308", orden: 3 },
  { nombre: "Camping/Aire libre", color: "#22c55e", orden: 4 },
  { nombre: "Viaje", color: "#6366f1", orden: 5 },
  { nombre: "Peluquería/Belleza", color: "#ec4899", orden: 6 },
  { nombre: "Bebé", color: "#f472b6", orden: 7 },
  { nombre: "Limpieza/Hogar", color: "#14b8a6", orden: 8 },
  { nombre: "Decoración", color: "#a855f7", orden: 9 },
  { nombre: "Electrónica", color: "#3b82f6", orden: 10 },
  { nombre: "Auto", color: "#ef4444", orden: 11 },
  { nombre: "Otros", color: "#94a3b8", orden: 99 },
];

const prisma = new PrismaClient();

async function main() {
  for (const cat of CATEGORIAS) {
    await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: { color: cat.color, orden: cat.orden },
      create: cat,
    });
  }
  console.log(`Categorías sembradas: ${CATEGORIAS.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
