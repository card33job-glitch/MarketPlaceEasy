"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  CameraIcon,
  CircleCheckIcon,
  FileTextIcon,
  HistoryIcon,
  PlusIcon,
  TagIcon,
  TrendingUpIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Analyzing } from "@/components/analyzing";
import { ConfirmedListing } from "@/components/confirmed-listing";
import { ListingPreview } from "@/components/listing-preview";
import { PhotoPicker } from "@/components/photo-picker";
import { saveListing } from "@/lib/history";
import type { PreparedPhoto } from "@/lib/image";
import type { AnalyzeMode, AnalyzeRequest, AnalyzeResponse, Listing } from "@/lib/listing";

type Step = "photos" | "analyse" | "apercu" | "confirmee";

const FEATURES = [
  { icon: FileTextIcon, text: "Titre et description rédigés à partir de tes photos" },
  { icon: TagIcon, text: "La bonne catégorie Marketplace" },
  { icon: TrendingUpIcon, text: "Un prix estimé selon le marché, avec une fourchette" },
];

async function analyze(body: AnalyzeRequest): Promise<{ listing: Listing; mode: AnalyzeMode }> {
  let res: Response;
  try {
    res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Impossible de joindre le serveur. Vérifie ta connexion et réessaie.");
  }
  const data = (await res.json().catch(() => null)) as AnalyzeResponse | null;
  if (!data) throw new Error("Réponse inattendue du serveur. Réessaie.");
  if (!data.ok) throw new Error(data.error);
  return { listing: data.listing, mode: data.mode };
}

export function ListingWizard() {
  const [step, setStep] = useState<Step>("photos");
  const [photos, setPhotos] = useState<PreparedPhoto[]>([]);
  const [notes, setNotes] = useState("");
  const [listing, setListing] = useState<Listing | null>(null);
  const [mode, setMode] = useState<AnalyzeMode>("demo");
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  const images = photos.map((p) => p.dataUrl);

  async function start() {
    setError(null);
    setStep("analyse");
    window.scrollTo({ top: 0 });
    try {
      const result = await analyze({ images, notes });
      setListing(result.listing);
      setMode(result.mode);
      setStep("apercu");
    } catch (err) {
      setError((err as Error).message);
      setStep("photos");
    }
  }

  async function regenerate(instruction: string) {
    if (!listing) return;
    setRegenerating(true);
    try {
      const result = await analyze({ images, notes, previous: listing, instruction });
      setListing(result.listing);
      setMode(result.mode);
      toast.success("Nouvelle version prête");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setRegenerating(false);
    }
  }

  function confirm() {
    if (!listing) return;
    const saved = saveListing({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      mode,
      listing,
      thumbnails: photos.map((p) => p.thumbUrl),
    });
    if (!saved) {
      toast.warning("Annonce confirmée, mais l'historique local est plein : elle n'a pas été sauvegardée.");
    }
    setStep("confirmee");
    window.scrollTo({ top: 0 });
  }

  function restart() {
    setPhotos([]);
    setNotes("");
    setListing(null);
    setError(null);
    setStep("photos");
    window.scrollTo({ top: 0 });
  }

  if (step === "analyse") {
    return <Analyzing photo={images[0]} />;
  }

  if (step === "apercu" && listing) {
    return (
      <ListingPreview
        listing={listing}
        photos={images}
        isDemo={mode === "demo"}
        regenerating={regenerating}
        onChange={setListing}
        onRegenerate={regenerate}
        onConfirm={confirm}
        onRestart={restart}
      />
    );
  }

  if (step === "confirmee" && listing) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-start gap-3">
          <CircleCheckIcon className="mt-1 size-7 shrink-0 text-emerald-600" />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ton annonce est prête!</h1>
            <p className="text-muted-foreground">
              Copie chaque champ en un clic, puis colle-le dans le formulaire Facebook Marketplace. Elle est aussi
              gardée dans ton historique.
            </p>
          </div>
        </div>
        <ConfirmedListing listing={listing} />
        <div className="grid gap-2 sm:grid-cols-2">
          <Button size="lg" variant="outline" className="h-11" onClick={restart}>
            <PlusIcon /> Créer une autre annonce
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="h-11"
            nativeButton={false}
            render={<Link href="/historique" />}
          >
            <HistoryIcon /> Voir l&apos;historique
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Une photo, et ton annonce Marketplace est prête.
        </h1>
        <p className="text-lg text-muted-foreground">
          Prends ton objet en photo : l&apos;IA s&apos;occupe de toute la job.
        </p>
        <ul className="grid gap-2 pt-1 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
              {text}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangleIcon />
          <AlertTitle>L&apos;analyse n&apos;a pas fonctionné</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PhotoPicker photos={photos} onChange={setPhotos} />

      {photos.length > 0 && (
        <div className="space-y-1.5">
          <Label htmlFor="notes">Précisions (facultatif)</Label>
          <Textarea
            id="notes"
            placeholder="Ex. : acheté en 2022, jamais sorti dehors, la housse est incluse…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-20"
          />
          <p className="text-xs text-muted-foreground">
            Ce que la photo ne montre pas : âge, défauts cachés, accessoires inclus.
          </p>
        </div>
      )}

      <Button
        size="lg"
        className="h-12 w-full text-base"
        disabled={photos.length === 0}
        onClick={start}
      >
        {photos.length === 0 ? (
          <>
            <CameraIcon /> Ajoute une photo pour commencer
          </>
        ) : (
          <>
            Créer l&apos;annonce <ArrowRightIcon />
          </>
        )}
      </Button>
    </div>
  );
}
