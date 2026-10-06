export type MarketplaceCategory = {
  id: string;
  label: string;
  /** Page de création Facebook à ouvrir pour ce type d'annonce. */
  createUrl: string;
};

const ITEM_URL = "https://www.facebook.com/marketplace/create/item";
const VEHICLE_URL = "https://www.facebook.com/marketplace/create/vehicle";

/**
 * Catégories proposées par Facebook Marketplace au moment de créer une
 * annonce « Article à vendre » (plus « Véhicules », qui a son propre
 * formulaire). Libellés tels qu'affichés dans l'interface en français.
 */
export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  { id: "outils", label: "Outils", createUrl: ITEM_URL },
  { id: "meubles", label: "Meubles", createUrl: ITEM_URL },
  { id: "articles-menagers", label: "Articles ménagers", createUrl: ITEM_URL },
  { id: "jardin", label: "Jardin", createUrl: ITEM_URL },
  { id: "electromenagers", label: "Électroménagers", createUrl: ITEM_URL },
  { id: "jeux-video", label: "Jeux vidéo", createUrl: ITEM_URL },
  { id: "livres-films-musique", label: "Livres, films et musique", createUrl: ITEM_URL },
  { id: "sacs-bagages", label: "Sacs et bagages", createUrl: ITEM_URL },
  {
    id: "vetements-femmes",
    label: "Vêtements et chaussures pour femmes",
    createUrl: ITEM_URL,
  },
  {
    id: "vetements-hommes",
    label: "Vêtements et chaussures pour hommes",
    createUrl: ITEM_URL,
  },
  { id: "bijoux-accessoires", label: "Bijoux et accessoires", createUrl: ITEM_URL },
  { id: "sante-beaute", label: "Santé et beauté", createUrl: ITEM_URL },
  { id: "animaux", label: "Fournitures pour animaux", createUrl: ITEM_URL },
  { id: "bebes-enfants", label: "Bébés et enfants", createUrl: ITEM_URL },
  { id: "jouets-jeux", label: "Jouets et jeux", createUrl: ITEM_URL },
  {
    id: "electronique-ordinateurs",
    label: "Électronique et ordinateurs",
    createUrl: ITEM_URL,
  },
  { id: "telephones-mobiles", label: "Téléphones mobiles", createUrl: ITEM_URL },
  { id: "velos", label: "Vélos", createUrl: ITEM_URL },
  { id: "arts-artisanat", label: "Arts et artisanat", createUrl: ITEM_URL },
  { id: "sports-plein-air", label: "Sports et plein air", createUrl: ITEM_URL },
  { id: "pieces-auto", label: "Pièces automobiles", createUrl: ITEM_URL },
  { id: "instruments-musique", label: "Instruments de musique", createUrl: ITEM_URL },
  {
    id: "antiquites-collection",
    label: "Antiquités et objets de collection",
    createUrl: ITEM_URL,
  },
  { id: "vente-garage", label: "Vente de garage", createUrl: ITEM_URL },
  { id: "divers", label: "Divers", createUrl: ITEM_URL },
  { id: "vehicules", label: "Véhicules", createUrl: VEHICLE_URL },
];

export const CATEGORY_IDS = MARKETPLACE_CATEGORIES.map((c) => c.id);

export function getCategory(id: string): MarketplaceCategory {
  return (
    MARKETPLACE_CATEGORIES.find((c) => c.id === id) ??
    MARKETPLACE_CATEGORIES.find((c) => c.id === "divers")!
  );
}

/** États proposés par Facebook Marketplace pour un article. */
export const CONDITIONS = [
  { id: "neuf", label: "Neuf" },
  { id: "comme-neuf", label: "Usagé – Comme neuf" },
  { id: "bon", label: "Usagé – Bon état" },
  { id: "passable", label: "Usagé – État passable" },
] as const;

export type ConditionId = (typeof CONDITIONS)[number]["id"];

export const CONDITION_IDS = CONDITIONS.map((c) => c.id) as ConditionId[];

export function getConditionLabel(id: string): string {
  return CONDITIONS.find((c) => c.id === id)?.label ?? "Usagé – Bon état";
}

export const TITLE_MAX = 100;

const cadFormatter = new Intl.NumberFormat("fr-CA", {
  style: "currency",
  currency: "CAD",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return cadFormatter.format(value);
}
