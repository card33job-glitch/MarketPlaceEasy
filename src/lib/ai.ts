import "server-only";

import OpenAI from "openai";

import { normalizeListing, type AnalyzeRequest, type Listing } from "./listing";
import {
  CATEGORY_IDS,
  CONDITION_IDS,
  MARKETPLACE_CATEGORIES,
  TITLE_MAX,
} from "./marketplace";

const LISTING_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "description",
    "categoryId",
    "condition",
    "brand",
    "price",
    "confidence",
    "warnings",
  ],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    categoryId: { type: "string", enum: CATEGORY_IDS },
    condition: { type: "string", enum: CONDITION_IDS },
    brand: { type: ["string", "null"] },
    price: {
      type: "object",
      additionalProperties: false,
      required: ["suggested", "min", "max", "justification"],
      properties: {
        suggested: { type: "integer" },
        min: { type: "integer" },
        max: { type: "integer" },
        justification: { type: "string" },
      },
    },
    confidence: { type: "string", enum: ["elevee", "moyenne", "faible"] },
    warnings: { type: "array", items: { type: "string" } },
  },
} as const;

const SYSTEM_PROMPT = `Tu es un expert de la revente d'objets usagés sur Facebook Marketplace au Québec.
À partir des photos d'un objet, tu rédiges une annonce prête à publier, en français québécois naturel (pas de France : « magasiner », « char » est trop familier, reste neutre et clair).

Règles :
- title : ${TITLE_MAX} caractères maximum. Type d'objet + marque + modèle si visible + un détail clé (couleur, taille, état). Pas d'emoji, pas de majuscules criardes.
- description : 400 à 900 caractères. Commence par une phrase de présentation, puis une liste à puces (« • ») des caractéristiques VISIBLES (marque, modèle, matériaux, dimensions estimées, accessoires), l'état honnête (usure, égratignures visibles), puis une ligne pratique (ramassage, paiement). N'invente jamais une caractéristique qui n'est pas visible ou fournie par le vendeur.
- categoryId : choisis l'identifiant le plus approprié parmi : ${MARKETPLACE_CATEGORIES.map((c) => `${c.id} (${c.label})`).join(", ")}.
- condition : neuf, comme-neuf, bon ou passable, selon ce que montrent les photos.
- brand : la marque si elle est identifiable, sinon null.
- price : en dollars canadiens, nombres entiers. Estime le prix de revente réaliste sur Marketplace au Québec (pas le prix neuf). min et max forment la fourchette réaliste, suggested est le prix d'affichage recommandé. justification : 1 à 3 phrases citant le prix neuf approximatif au Canada et les facteurs (état, demande, saison).
- confidence : elevee si l'objet et le modèle sont clairement identifiables, moyenne si le modèle est incertain, faible si l'objet est difficile à identifier.
- warnings : points courts que le vendeur devrait vérifier ou préciser (modèle exact, défauts non visibles, accessoires inclus). Liste vide si rien.`;

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export async function aiListing(req: AnalyzeRequest): Promise<Listing> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o";

  let userText = "Voici les photos de l'objet à vendre.";
  if (req.notes?.trim()) {
    userText += `\n\nPrécisions du vendeur : ${req.notes.trim()}`;
  }
  if (req.previous) {
    userText += `\n\nVoici une version précédente de l'annonce. Propose une nouvelle version différente (formulation, angle) tout en restant fidèle aux photos :\n${JSON.stringify(req.previous)}`;
  }
  if (req.instruction?.trim()) {
    userText += `\n\nConsigne du vendeur pour cette nouvelle version : ${req.instruction.trim()}`;
  }

  const completion = await client.chat.completions.create({
    model,
    temperature: req.previous ? 0.9 : 0.4,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "annonce_marketplace",
        strict: true,
        schema: LISTING_SCHEMA as unknown as Record<string, unknown>,
      },
    },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          ...req.images.map((url) => ({
            type: "image_url" as const,
            image_url: { url, detail: "high" as const },
          })),
        ],
      },
    ],
  });

  const message = completion.choices[0]?.message;
  if (message?.refusal) {
    throw new Error(`Le modèle a refusé d'analyser les photos : ${message.refusal}`);
  }
  if (!message?.content) {
    throw new Error("Réponse vide du modèle.");
  }
  return normalizeListing(JSON.parse(message.content));
}
