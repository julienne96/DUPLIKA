import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import type { Category, Collection, Product, ShippingZone } from "./types";

/**
 * Jeu de démonstration local.
 * Il sert UNIQUEMENT de repli quand VITE_API_URL n'est pas configurée
 * (développement d'intégration). En production, toutes ces données
 * proviennent de l'API Laravel /api/v1 et des seeders Filament.
 */

export const demoCategories: Category[] = [
  {
    slug: "perruques-lace",
    name: "Perruques lace",
    description: "Lace frontal et closure, finitions invisibles et confort quotidien.",
  },
  {
    slug: "perruques-naturelles",
    name: "Perruques naturelles",
    description: "Cheveux 100 % naturels, densité élevée et longévité maximale.",
  },
  {
    slug: "tissages",
    name: "Tissages & mèches",
    description: "Bundles et mèches à coudre pour composer votre coiffure sur mesure.",
  },
  {
    slug: "accessoires",
    name: "Accessoires capillaires",
    description: "Colles, bonnets, brosses et soins pour entretenir vos pièces.",
  },
];

export const demoCollections: Collection[] = [
  {
    slug: "signature",
    name: "Signature",
    tagline: "Les pièces emblématiques DUPLIKA",
    image: p1,
  },
  { slug: "bouclees", name: "Bouclées", tagline: "Volume et mouvement naturel", image: p2 },
  { slug: "lumiere", name: "Lumière", tagline: "Blonds et nuances éclaircies", image: p3 },
];

const baseSections = (entretien: string) => [
  {
    title: "Description",
    content:
      "Chaque pièce DUPLIKA est montée à la main sur une base respirante, puis contrôlée individuellement avant expédition. La lace est teintée pour se fondre sur une large palette de carnations.",
  },
  {
    title: "Caractéristiques",
    content:
      "Base respirante avec bandes ajustables • Lace HD teintable • Densité 180 % • Implantation manuelle nœud par nœud • Peut être lissée, bouclée et colorée par un professionnel.",
  },
  { title: "Conseils d'entretien", content: entretien },
  {
    title: "Livraison & retours",
    content:
      "Préparation sous 24 à 48 h ouvrées. Livraison suivie. Retour possible sous 7 jours si la pièce n'a pas été portée, découpée ni colorée, et si son emballage d'origine est intact.",
  },
];

const faq = [
  {
    question: "Puis-je colorer ma perruque ?",
    answer:
      "Oui sur les pièces en cheveux naturels, en confiant la coloration à un professionnel. Les fibres synthétiques ne se colorent pas.",
  },
  {
    question: "Combien de temps dure une pièce ?",
    answer:
      "Entre 8 et 18 mois selon la fréquence de port et la régularité de l'entretien recommandé.",
  },
  {
    question: "Comment choisir ma taille de bonnet ?",
    answer:
      "Mesurez le tour de tête au ras du front. Moins de 54 cm : Small. 54–57 cm : Medium. Plus de 57 cm : Large.",
  },
];

function makeProduct(p: Partial<Product> & Pick<Product, "slug" | "name" | "sku">): Product {
  return {
    id: p.slug,
    shortDescription: "",
    description: "",
    categorySlug: "perruques-lace",
    collectionSlugs: ["signature"],
    media: [],
    options: [],
    variants: [],
    sections: baseSections(
      "Lavez à l'eau tiède avec un shampooing sans sulfate, tamponnez sans frotter, séchez à l'air libre sur une tête à perruque et rangez dans son filet.",
    ),
    faq,
    attributes: {},
    relatedSlugs: [],
    addOnSlugs: [],
    publishedAt: "2026-06-01",
    ...p,
  } as Product;
}

const longueur = {
  id: "opt-longueur",
  name: "Longueur",
  values: [
    { id: "l16", label: '16"' },
    { id: "l20", label: '20"' },
    { id: "l24", label: '24"' },
  ],
};

const bonnet = {
  id: "opt-bonnet",
  name: "Taille de bonnet",
  values: [
    { id: "s", label: "Small" },
    { id: "m", label: "Medium" },
    { id: "l", label: "Large" },
  ],
};

function variants(
  base: number,
  stocks: number[],
  compareAt?: number,
): Product["variants"] {
  const lens = ["l16", "l20", "l24"];
  const caps = ["s", "m", "l"];
  const out: Product["variants"] = [];
  let i = 0;
  for (const l of lens) {
    for (const c of caps) {
      const bump = l === "l20" ? 1500000 : l === "l24" ? 3000000 : 0;
      out.push({
        id: `${l}-${c}`,
        sku: `${l.toUpperCase()}-${c.toUpperCase()}`,
        options: { "opt-longueur": l, "opt-bonnet": c },
        price: base + bump,
        compareAtPrice: compareAt ? compareAt + bump : undefined,
        stock: stocks[i % stocks.length] ?? 0,
        lowStockThreshold: 3,
      });
      i++;
    }
  }
  return out;
}

export const demoProducts: Product[] = [
  makeProduct({
    slug: "perruque-lace-noir-lisse-eclat",
    name: "Éclat — Lace frontale lisse",
    sku: "DPK-ECL",
    shortDescription: "Lisse profond, lace HD invisible, densité 180 %.",
    categorySlug: "perruques-lace",
    collectionSlugs: ["signature"],
    media: [
      { id: "m1", url: p1, alt: "Perruque lace lisse noire sur tête à perruque", type: "image" },
      { id: "m2", url: p3, alt: "Détail de la lace frontale HD", type: "image" },
    ],
    options: [longueur, bonnet],
    variants: variants(12500000, [12, 6, 2, 9, 0, 4, 15, 3, 7]),
    attributes: {
      Matière: "Cheveux naturels Remy",
      Texture: "Lisse",
      Densité: "180 %",
      Base: "Lace HD frontale 13x4",
    },
    rating: { average: 4.8, count: 126 },
    isNew: true,
    relatedSlugs: ["perruque-bouclee-ambre", "perruque-blonde-solstice"],
    addOnSlugs: ["colle-lace-tenue-longue", "bonnet-satin-nuit"],
  }),
  makeProduct({
    slug: "perruque-bouclee-ambre",
    name: "Ambre — Bouclée volume",
    sku: "DPK-AMB",
    shortDescription: "Boucles rebondies châtain cuivré, effet volume immédiat.",
    categorySlug: "perruques-naturelles",
    collectionSlugs: ["bouclees", "signature"],
    media: [{ id: "m1", url: p2, alt: "Perruque bouclée châtain cuivré", type: "image" }],
    options: [longueur, bonnet],
    variants: variants(9800000, [5, 0, 1, 8, 11, 2, 0, 6, 4], 12500000),
    attributes: {
      Matière: "Cheveux naturels",
      Texture: "Bouclée 3B",
      Densité: "200 %",
      Base: "Closure 5x5",
    },
    rating: { average: 4.6, count: 84 },
    relatedSlugs: ["perruque-lace-noir-lisse-eclat", "perruque-blonde-solstice"],
    addOnSlugs: ["soin-hydratant-boucles", "brosse-demelante-douce"],
  }),
  makeProduct({
    slug: "perruque-blonde-solstice",
    name: "Solstice — Blond miel ondulé",
    sku: "DPK-SOL",
    shortDescription: "Ondulations souples, blond miel travaillé en dégradé.",
    categorySlug: "perruques-lace",
    collectionSlugs: ["lumiere"],
    media: [{ id: "m1", url: p3, alt: "Perruque ondulée blond miel", type: "image" }],
    options: [longueur, bonnet],
    variants: variants(14200000, [3, 2, 0, 0, 5, 1, 7, 2, 0]),
    attributes: {
      Matière: "Cheveux naturels",
      Texture: "Ondulée",
      Densité: "180 %",
      Base: "Lace frontale 13x4",
    },
    rating: { average: 4.9, count: 41 },
    isNew: true,
    relatedSlugs: ["perruque-lace-noir-lisse-eclat", "perruque-bouclee-ambre"],
    addOnSlugs: ["colle-lace-tenue-longue"],
  }),
  makeProduct({
    slug: "tissage-naturel-onde-douce",
    name: "Onde Douce — Tissage 3 bundles",
    sku: "DPK-OND",
    shortDescription: "Trois bundles assortis pour une pose sur mesure.",
    categorySlug: "tissages",
    collectionSlugs: ["signature"],
    media: [{ id: "m1", url: p2, alt: "Bundles de tissage ondulés", type: "image" }],
    options: [longueur],
    variants: [
      {
        id: "t16",
        sku: "OND-16",
        options: { "opt-longueur": "l16" },
        price: 6500000,
        stock: 14,
        lowStockThreshold: 3,
      },
      {
        id: "t20",
        sku: "OND-20",
        options: { "opt-longueur": "l20" },
        price: 7800000,
        compareAtPrice: 8900000,
        stock: 2,
        lowStockThreshold: 3,
      },
      {
        id: "t24",
        sku: "OND-24",
        options: { "opt-longueur": "l24" },
        price: 9100000,
        stock: 0,
        lowStockThreshold: 3,
      },
    ],
    attributes: { Matière: "Cheveux naturels", Texture: "Ondulée", Conditionnement: "3 bundles" },
    rating: { average: 4.5, count: 58 },
    relatedSlugs: ["perruque-bouclee-ambre"],
    addOnSlugs: ["brosse-demelante-douce"],
  }),
  makeProduct({
    slug: "colle-lace-tenue-longue",
    name: "Colle lace tenue longue 38 ml",
    sku: "DPK-COL",
    shortDescription: "Tenue jusqu'à 4 semaines, sans latex, waterproof.",
    categorySlug: "accessoires",
    collectionSlugs: [],
    media: [{ id: "m1", url: p1, alt: "Flacon de colle pour lace", type: "image" }],
    options: [],
    variants: [
      {
        id: "unique",
        sku: "COL-38",
        options: {},
        price: 1200000,
        stock: 40,
        lowStockThreshold: 5,
      },
    ],
    attributes: { Contenance: "38 ml", Tenue: "Jusqu'à 4 semaines", Formule: "Sans latex" },
    rating: { average: 4.4, count: 212 },
    relatedSlugs: ["bonnet-satin-nuit"],
  }),
  makeProduct({
    slug: "bonnet-satin-nuit",
    name: "Bonnet satin nuit",
    sku: "DPK-BON",
    shortDescription: "Protège vos pièces pendant la nuit et limite les frisottis.",
    categorySlug: "accessoires",
    collectionSlugs: [],
    media: [{ id: "m1", url: p3, alt: "Bonnet en satin", type: "image" }],
    options: [],
    variants: [
      { id: "unique", sku: "BON-U", options: {}, price: 750000, stock: 3, lowStockThreshold: 5 },
    ],
    attributes: { Matière: "Satin", Taille: "Unique ajustable" },
    rating: { average: 4.7, count: 96 },
    relatedSlugs: ["soin-hydratant-boucles"],
  }),
  makeProduct({
    slug: "soin-hydratant-boucles",
    name: "Soin hydratant boucles 200 ml",
    sku: "DPK-SOI",
    shortDescription: "Redéfinit les boucles et prolonge la vie de vos pièces.",
    categorySlug: "accessoires",
    collectionSlugs: ["bouclees"],
    media: [{ id: "m1", url: p2, alt: "Flacon de soin hydratant", type: "image" }],
    options: [],
    variants: [
      {
        id: "unique",
        sku: "SOI-200",
        options: {},
        price: 1450000,
        compareAtPrice: 1800000,
        stock: 22,
        lowStockThreshold: 5,
      },
    ],
    attributes: { Contenance: "200 ml", Usage: "2 à 3 fois par semaine" },
    rating: { average: 4.6, count: 73 },
    relatedSlugs: ["brosse-demelante-douce"],
  }),
  makeProduct({
    slug: "brosse-demelante-douce",
    name: "Brosse démêlante douce",
    sku: "DPK-BRO",
    shortDescription: "Picots souples, démêle sans arracher les nœuds.",
    categorySlug: "accessoires",
    collectionSlugs: [],
    media: [{ id: "m1", url: p1, alt: "Brosse démêlante", type: "image" }],
    options: [],
    variants: [
      { id: "unique", sku: "BRO-U", options: {}, price: 620000, stock: 0, lowStockThreshold: 5 },
    ],
    attributes: { Picots: "Nylon souple", Usage: "Cheveux humides ou secs" },
    rating: { average: 4.3, count: 34 },
    relatedSlugs: ["soin-hydratant-boucles"],
  }),
];

export const demoShippingZones: ShippingZone[] = [
  {
    id: "zone-abidjan",
    name: "Abidjan",
    methods: [
      {
        id: "abj-standard",
        name: "Livraison à domicile",
        price: 200000,
        delay: "24 à 48 h",
        freeAbove: 15000000,
      },
      { id: "abj-express", name: "Express same-day", price: 500000, delay: "Le jour même" },
    ],
  },
  {
    id: "zone-interieur",
    name: "Intérieur du pays",
    methods: [
      { id: "int-standard", name: "Transporteur partenaire", price: 350000, delay: "2 à 4 jours" },
    ],
  },
  {
    id: "zone-international",
    name: "International",
    methods: [{ id: "intl-standard", name: "Express international", price: 2500000, delay: "5 à 9 jours" }],
  },
];
