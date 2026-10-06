"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon, ExternalLinkIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import type { Listing } from "@/lib/listing";
import { formatPrice, getCategory, getConditionLabel } from "@/lib/marketplace";
import { cn } from "@/lib/utils";

function CopyField({
  label,
  value,
  display,
  multiline,
}: {
  label: string;
  value: string;
  display?: string;
  multiline?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (await copyText(value)) {
      setCopied(true);
      toast.success(`${label} copié`);
      setTimeout(() => setCopied(false), 1600);
    } else {
      toast.error("Impossible de copier. Sélectionne le texte et copie-le manuellement.");
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border bg-card p-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <p
          className={cn(
            "text-sm select-all",
            multiline ? "max-h-40 overflow-y-auto leading-relaxed whitespace-pre-line" : "truncate font-medium",
          )}
        >
          {display ?? value}
        </p>
      </div>
      <Button
        variant={copied ? "secondary" : "outline"}
        size="lg"
        className="h-10 shrink-0"
        onClick={copy}
        aria-label={`Copier ${label.toLowerCase()}`}
      >
        {copied ? <CheckIcon className="text-emerald-600" /> : <CopyIcon />}
        <span className="hidden sm:inline">{copied ? "Copié" : "Copier"}</span>
      </Button>
    </div>
  );
}

export function ConfirmedListing({ listing }: { listing: Listing }) {
  const category = getCategory(listing.categoryId);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <CopyField label="Titre" value={listing.title} />
        <CopyField
          label="Prix"
          value={String(listing.price.suggested)}
          display={formatPrice(listing.price.suggested)}
        />
        <CopyField label="Catégorie" value={category.label} />
        <CopyField label="État" value={getConditionLabel(listing.condition)} />
        {listing.brand && <CopyField label="Marque" value={listing.brand} />}
        <CopyField label="Description" value={listing.description} multiline />
      </div>

      <Button
        size="lg"
        className="h-12 w-full text-base"
        nativeButton={false}
        render={<a href={category.createUrl} target="_blank" rel="noopener noreferrer" />}
      >
        <ExternalLinkIcon /> Ouvrir Facebook Marketplace
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Facebook ne permet pas de publier automatiquement : colle chaque champ dans le formulaire et ajoute tes
        photos directement depuis ton téléphone.
      </p>
    </div>
  );
}
