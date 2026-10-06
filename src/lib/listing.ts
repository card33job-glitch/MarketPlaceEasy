import {
  CATEGORY_IDS,
  CONDITION_IDS,
  TITLE_MAX,
  type ConditionId,
} from "./marketplace";

export type Confidence = "elevee" | "moyenne" | "faible";

export type Listing = {
  title: string;
  description: string;
  categoryId: string;
  condition: ConditionId;
  brand: string | null;
  price: {
    suggested: number;
    min: number;
    max: number;
    justification: string;
  };
  confidence: Confidence;
  /** Points à vérifier par Steve (ex. modèle illisible sur la photo). */
  warnings: string[];
};

export type AnalyzeMode = "ia" | "demo";

export type AnalyzeRequest = {
  images: string[];
  /** Précisions données par l'utilisateur (ex. « acheté en 2022, jamais utilisé »). */
  notes?: string;
  /** Annonce précédente, quand on demande une régénération. */
  previous?: Listing;
  /** Consigne de régénération (ex. « plus court », « prix plus bas »). */
  instruction?: string;
};

export type AnalyzeResponse =
  | { ok: true; mode: AnalyzeMode; listing: Listing }
  | { ok: false; error: string };

export const MAX_IMAGES = 6;

function toInt(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
}

/** Garantit une annonce cohérente, même si le modèle s'écarte du schéma. */
export function normalizeListing(raw: unknown): Listing {
  const r = (raw ?? {}) as Record<string, unknown>;
  const p = (r.price ?? {}) as Record<string, unknown>;

  const suggested = toInt(p.suggested, 0);
  let min = toInt(p.min, suggested);
  let max = toInt(p.max, suggested);
  if (min > max) [min, max] = [max, min];
  const clampedSuggested = Math.min(Math.max(suggested, min), max);

  const categoryId =
    typeof r.categoryId === "string" && CATEGORY_IDS.includes(r.categoryId)
      ? r.categoryId
      : "divers";
  const condition = CONDITION_IDS.includes(r.condition as ConditionId)
    ? (r.condition as ConditionId)
    : "bon";
  const confidence: Confidence = ["elevee", "moyenne", "faible"].includes(
    r.confidence as string,
  )
    ? (r.confidence as Confidence)
    : "moyenne";

  return {
    title: String(r.title ?? "Article à vendre").trim().slice(0, TITLE_MAX),
    description: String(r.description ?? "").trim(),
    categoryId,
    condition,
    brand:
      typeof r.brand === "string" && r.brand.trim() ? r.brand.trim() : null,
    price: {
      suggested: clampedSuggested,
      min,
      max,
      justification: String(p.justification ?? "").trim(),
    },
    confidence,
    warnings: Array.isArray(r.warnings)
      ? r.warnings.filter((w): w is string => typeof w === "string" && !!w.trim())
      : [],
  };
}

export const CONFIDENCE_LABELS: Record<Confidence, string> = {
  elevee: "Confiance élevée",
  moyenne: "Confiance moyenne",
  faible: "Confiance faible",
};
