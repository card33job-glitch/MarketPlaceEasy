import OpenAI from "openai";

import { aiListing, hasOpenAIKey } from "@/lib/ai";
import { demoListing } from "@/lib/demo";
import {
  MAX_IMAGES,
  type AnalyzeRequest,
  type AnalyzeResponse,
} from "@/lib/listing";

export const maxDuration = 60;

function fail(error: string, status: number) {
  return Response.json({ ok: false, error } satisfies AnalyzeResponse, {
    status,
  });
}

export async function GET() {
  return Response.json({ mode: hasOpenAIKey() ? "ia" : "demo" });
}

export async function POST(request: Request) {
  let body: AnalyzeRequest;
  try {
    body = await request.json();
  } catch {
    return fail("Requête invalide.", 400);
  }

  const images = Array.isArray(body.images)
    ? body.images.filter(
        (img) => typeof img === "string" && img.startsWith("data:image/"),
      )
    : [];
  if (images.length === 0) {
    return fail("Ajoute au moins une photo de l'objet.", 400);
  }
  if (images.length > MAX_IMAGES) {
    return fail(`Maximum ${MAX_IMAGES} photos par annonce.`, 400);
  }

  const req: AnalyzeRequest = { ...body, images };

  if (!hasOpenAIKey()) {
    await new Promise((r) => setTimeout(r, 1800));
    return Response.json({
      ok: true,
      mode: "demo",
      listing: demoListing(req),
    } satisfies AnalyzeResponse);
  }

  try {
    const listing = await aiListing(req);
    return Response.json({
      ok: true,
      mode: "ia",
      listing,
    } satisfies AnalyzeResponse);
  } catch (err) {
    console.error("[analyze]", err);
    if (err instanceof OpenAI.APIError) {
      if (err.status === 401) {
        return fail(
          "La clé OpenAI est invalide. Vérifie OPENAI_API_KEY dans .env.local.",
          502,
        );
      }
      if (err.status === 429) {
        return fail(
          "Limite OpenAI atteinte (quota ou trop de requêtes). Réessaie dans un moment.",
          502,
        );
      }
    }
    return fail(
      "L'analyse des photos a échoué. Réessaie, ou essaie avec d'autres photos.",
      502,
    );
  }
}
