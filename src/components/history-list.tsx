"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { HistoryIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmedListing } from "@/components/confirmed-listing";
import {
  deleteListing,
  getHistorySnapshot,
  getServerHistorySnapshot,
  subscribeHistory,
  type SavedListing,
} from "@/lib/history";
import { formatPrice, getCategory } from "@/lib/marketplace";

const dateFormatter = new Intl.DateTimeFormat("fr-CA", {
  dateStyle: "long",
  timeStyle: "short",
});

const subscribeNoop = () => () => {};

export function HistoryList() {
  const items = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerHistorySnapshot);
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((i) => i.id === openId) ?? null;

  function remove(item: SavedListing) {
    deleteListing(item.id);
    setOpenId(null);
    toast.success("Annonce retirée de l'historique");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Historique</h1>
        <p className="text-muted-foreground">
          Tes annonces confirmées, gardées sur cet appareil seulement.
        </p>
      </div>

      {!hydrated ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card px-6 py-14 text-center">
          <div className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <HistoryIcon className="size-5" />
          </div>
          <div className="space-y-1">
            <p className="font-medium">Aucune annonce pour l&apos;instant</p>
            <p className="text-sm text-muted-foreground">
              Quand tu confirmes une annonce, elle apparaît ici pour la recopier plus tard.
            </p>
          </div>
          <Button size="lg" className="h-11" nativeButton={false} render={<Link href="/" />}>
            <PlusIcon /> Créer ma première annonce
          </Button>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setOpenId(item.id)}
                className="flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-left transition hover:border-primary/50 hover:shadow-sm"
              >
                <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {item.thumbnails[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.thumbnails[0]} alt="" className="size-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="line-clamp-2 leading-snug font-medium">{item.listing.title}</p>
                  <p className="font-semibold text-primary">{formatPrice(item.listing.price.suggested)}</p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{getCategory(item.listing.categoryId).label}</span>
                    <span aria-hidden>·</span>
                    <span>{dateFormatter.format(new Date(item.createdAt))}</span>
                    {item.mode === "demo" && (
                      <Badge variant="outline" className="h-4 px-1 text-[10px]">
                        démo
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{open.listing.title}</DialogTitle>
                <DialogDescription>
                  Confirmée le {dateFormatter.format(new Date(open.createdAt))}
                </DialogDescription>
              </DialogHeader>
              <ConfirmedListing listing={open.listing} />
              <Button variant="destructive" onClick={() => remove(open)}>
                <Trash2Icon /> Retirer de l&apos;historique
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
