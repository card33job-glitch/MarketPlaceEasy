"use client";

import { useState } from "react";
import {
  CheckIcon,
  InfoIcon,
  Loader2Icon,
  PencilIcon,
  RefreshCwIcon,
  TagIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { PhotoGallery } from "@/components/photo-gallery";
import { PriceEstimate } from "@/components/price-estimate";
import { CONFIDENCE_LABELS, type Listing } from "@/lib/listing";
import {
  CONDITIONS,
  MARKETPLACE_CATEGORIES,
  TITLE_MAX,
  formatPrice,
  getCategory,
  getConditionLabel,
  type ConditionId,
} from "@/lib/marketplace";

const QUICK_INSTRUCTIONS = [
  "Plus court",
  "Plus de détails",
  "Ton plus décontracté",
  "Prix plus bas pour vendre vite",
  "Prix plus haut, je ne suis pas pressé",
];

const categoryItems = MARKETPLACE_CATEGORIES.map((c) => ({ value: c.id, label: c.label }));
const conditionItems = CONDITIONS.map((c) => ({ value: c.id, label: c.label }));

type Props = {
  listing: Listing;
  photos: string[];
  isDemo: boolean;
  regenerating: boolean;
  onChange: (listing: Listing) => void;
  onRegenerate: (instruction: string) => void;
  onConfirm: () => void;
  onRestart: () => void;
};

export function ListingPreview({
  listing,
  photos,
  isDemo,
  regenerating,
  onChange,
  onRegenerate,
  onConfirm,
  onRestart,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);
  const [instruction, setInstruction] = useState("");

  const warnings = listing.warnings.filter((w) => !(isDemo && w.startsWith("Mode démo")));

  function update<K extends keyof Listing>(key: K, value: Listing[K]) {
    onChange({ ...listing, [key]: value });
  }

  function submitRegenerate(text: string) {
    setRegenOpen(false);
    setEditing(false);
    onRegenerate(text);
    setInstruction("");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Aperçu de ton annonce</h1>
        <p className="text-muted-foreground">
          Voici ce que l&apos;IA propose. Confirme, modifie ce que tu veux ou demande une autre version.
        </p>
      </div>

      {isDemo && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <InfoIcon />
          <AlertTitle>Mode démo</AlertTitle>
          <AlertDescription className="text-amber-800">
            Aucune clé OpenAI n&apos;est configurée : l&apos;annonce ci-dessous est un exemple réaliste qui ne
            correspond pas forcément à ta photo. Ajoute <code>OPENAI_API_KEY</code> dans{" "}
            <code>.env.local</code> pour l&apos;analyse réelle.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="md:sticky md:top-20 md:self-start">
          <PhotoGallery photos={photos} />
        </div>

        <div className={regenerating ? "pointer-events-none opacity-50 transition-opacity" : "transition-opacity"}>
          {editing ? (
            <div className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="title">Titre</Label>
                  <span className="text-xs text-muted-foreground">
                    {listing.title.length}/{TITLE_MAX}
                  </span>
                </div>
                <Input
                  id="title"
                  value={listing.title}
                  maxLength={TITLE_MAX}
                  onChange={(e) => update("title", e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="price">Prix (CAD)</Label>
                  <div className="relative">
                    <Input
                      id="price"
                      type="number"
                      inputMode="numeric"
                      min={0}
                      value={listing.price.suggested}
                      onChange={(e) =>
                        update("price", {
                          ...listing.price,
                          suggested: Math.max(0, Math.round(Number(e.target.value) || 0)),
                        })
                      }
                      className="h-10 pr-8"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                      $
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fourchette estimée : {formatPrice(listing.price.min)} à {formatPrice(listing.price.max)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label>État</Label>
                  <Select
                    items={conditionItems}
                    value={listing.condition}
                    onValueChange={(v) => v && update("condition", v as ConditionId)}
                  >
                    <SelectTrigger className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {conditionItems.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Catégorie Marketplace</Label>
                <Select
                  items={categoryItems}
                  value={listing.categoryId}
                  onValueChange={(v) => v && update("categoryId", v)}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryItems.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={listing.description}
                  onChange={(e) => update("description", e.target.value)}
                  className="min-h-56 text-sm leading-relaxed"
                />
              </div>

              <Button variant="outline" className="h-10 w-full" onClick={() => setEditing(false)}>
                <CheckIcon /> Terminer les modifications
              </Button>
            </div>
          ) : (
            <article className="space-y-4 rounded-2xl border bg-card p-4 sm:p-5">
              <div className="space-y-1">
                <h2 className="text-xl leading-snug font-semibold">{listing.title}</h2>
                <p className="text-2xl font-bold text-primary">{formatPrice(listing.price.suggested)}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">
                  <TagIcon /> {getCategory(listing.categoryId).label}
                </Badge>
                <Badge variant="secondary">{getConditionLabel(listing.condition)}</Badge>
                {listing.brand && <Badge variant="secondary">{listing.brand}</Badge>}
                <Badge variant="outline">{CONFIDENCE_LABELS[listing.confidence]}</Badge>
              </div>
              <Separator />
              <div className="space-y-1.5">
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">
                  {listing.description}
                </p>
              </div>
              <PriceEstimate price={listing.price} />
              {warnings.length > 0 && (
                <Alert>
                  <InfoIcon />
                  <AlertTitle>À vérifier avant de publier</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc space-y-1 pl-4">
                      {warnings.map((w) => (
                        <li key={w}>{w}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </article>
          )}

          <div className="sticky bottom-0 -mx-4 mt-4 space-y-2 border-t bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <Button size="lg" className="h-12 w-full text-base" onClick={onConfirm} disabled={regenerating}>
              <CheckIcon /> Oui, je la veux comme ça
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="lg"
                variant="outline"
                className="h-11"
                onClick={() => setEditing((e) => !e)}
                disabled={regenerating}
              >
                <PencilIcon /> {editing ? "Voir l'aperçu" : "Modifier"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11"
                onClick={() => setRegenOpen(true)}
                disabled={regenerating}
              >
                {regenerating ? <Loader2Icon className="animate-spin" /> : <RefreshCwIcon />}
                {regenerating ? "Régénération…" : "Régénérer"}
              </Button>
            </div>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={onRestart}>
              Recommencer avec d&apos;autres photos
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={regenOpen} onOpenChange={setRegenOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander une autre version</DialogTitle>
            <DialogDescription>
              Dis à l&apos;IA ce que tu veux changer, ou laisse vide pour une nouvelle formulation.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_INSTRUCTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setInstruction(q)}
                className="rounded-full border px-3 py-1 text-xs transition hover:border-primary hover:text-primary"
              >
                {q}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Ex. : mentionne que la housse est incluse, ton plus vendeur…"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            className="min-h-24"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRegenOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => submitRegenerate(instruction)}>
              <RefreshCwIcon /> Régénérer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
