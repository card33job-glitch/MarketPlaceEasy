import { TrendingUpIcon } from "lucide-react";

import type { Listing } from "@/lib/listing";
import { formatPrice } from "@/lib/marketplace";

export function PriceEstimate({ price }: { price: Listing["price"] }) {
  const span = price.max - price.min;
  const position = span > 0 ? ((price.suggested - price.min) / span) * 100 : 50;

  return (
    <div className="space-y-3 rounded-xl border bg-muted/40 p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <TrendingUpIcon className="size-4 text-primary" />
        Estimation selon le marché
      </div>
      <div className="space-y-1.5">
        <div className="relative h-2 rounded-full bg-gradient-to-r from-emerald-200 via-primary/40 to-amber-200">
          <span
            className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary shadow"
            style={{ left: `${Math.min(100, Math.max(0, position))}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatPrice(price.min)} · vente rapide</span>
          <span>{formatPrice(price.max)} · patient</span>
        </div>
      </div>
      {price.justification && (
        <p className="text-sm leading-relaxed text-muted-foreground">{price.justification}</p>
      )}
    </div>
  );
}
