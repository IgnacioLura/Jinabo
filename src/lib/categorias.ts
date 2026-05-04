export interface CategoriaSeed {
  nombre: string;
  color: string;
  orden: number;
  keywords: string[];
}

export const CATEGORIAS_SEED: CategoriaSeed[] = [
  {
    nombre: "Cocina",
    color: "#f59e0b",
    orden: 1,
    keywords: [
      "cocina", "cafetera", "tostadora", "mixer", "sandwichera", "sadwichera",
      "licuadora", "molinillo", "especiero", "filtro de agua", "bacha",
      "escurridor", "pinza", "rallador", "cuchillo", "sarten", "tetera",
      "vaso", "termo", "taper", "bols", "tabla", "individuales", "selladores",
      "waflera", "cubiertera", "cubiertos", "frutera", "huevera", "especieros",
      "maquina pasta", "maquina café", "jarra", "bandeja", "café", "cafe",
      "set cocina", "fanales",
    ],
  },
  {
    nombre: "Electrodomésticos",
    color: "#0ea5e9",
    orden: 2,
    keywords: [
      "aspiradora", "air fryer", "vitrola", "plancha", "kemei", "raf",
      "maquina rizos",
    ],
  },
  {
    nombre: "Iluminación",
    color: "#eab308",
    orden: 3,
    keywords: [
      "veladora", "vela", "luces", "difusor", "linterna", "farol", "foco",
      "fanales led",
    ],
  },
  {
    nombre: "Camping/Aire libre",
    color: "#22c55e",
    orden: 4,
    keywords: [
      "camping", "carpa", "sillon inflable", "colchon inflable", "banco plegable",
      "mesa plegable", "sombrilla", "carro feria", "canasta de picnic",
      "canasto picnic", "sillon", "puff",
    ],
  },
  {
    nombre: "Viaje",
    color: "#6366f1",
    orden: 5,
    keywords: [
      "valija", "candado valija", "cinta valija", "balanza valija", "porta pasapote",
      "plancha de viaje", "set frascos de viaje", "valizas", "bolsa de tela",
      "neceser", "pocho", "paraguas",
    ],
  },
  {
    nombre: "Peluquería/Belleza",
    color: "#ec4899",
    orden: 6,
    keywords: [
      "capa peluquero", "sobre peluquero", "peluquero", "rizos",
    ],
  },
  {
    nombre: "Bebé",
    color: "#f472b6",
    orden: 7,
    keywords: [
      "bebe", "bebé", "video baby", "camaora foto niño", "mochila bebe",
      "antigolpe", "camara con rosca",
    ],
  },
  {
    nombre: "Limpieza/Hogar",
    color: "#14b8a6",
    orden: 8,
    keywords: [
      "mopa", "rack lavarropa", "tender", "armario tela", "perchero",
      "percha", "alfombra", "jabonera",
    ],
  },
  {
    nombre: "Decoración",
    color: "#a855f7",
    orden: 9,
    keywords: [
      "buda", "reloj mapamundi", "pantalla bambu", "rack", "rollo yoga",
      "pelota pilates", "loncheras", "bolsas mango",
    ],
  },
  {
    nombre: "Electrónica",
    color: "#3b82f6",
    orden: 10,
    keywords: [
      "camara", "cámara", "timbre", "adaptador", "porta celular", "tag",
      "luz bicicleta",
    ],
  },
  {
    nombre: "Auto",
    color: "#ef4444",
    orden: 11,
    keywords: [
      "auto", "espejo parasol", "funnda para auto", "funda para auto",
    ],
  },
  {
    nombre: "Otros",
    color: "#94a3b8",
    orden: 99,
    keywords: [],
  },
];

export function detectarCategoria(nombre: string): string {
  const lower = nombre.toLowerCase();
  for (const cat of CATEGORIAS_SEED) {
    if (cat.nombre === "Otros") continue;
    if (cat.keywords.some((k) => lower.includes(k))) {
      return cat.nombre;
    }
  }
  return "Otros";
}
