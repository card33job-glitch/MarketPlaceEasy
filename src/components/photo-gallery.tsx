"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export function PhotoGallery({ photos }: { photos: string[] }) {
  const [active, setActive] = useState(0);
  const current = photos[Math.min(active, photos.length - 1)];

  return (
    <div className="space-y-2">
      <div className="aspect-square overflow-hidden rounded-2xl border bg-neutral-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt="Photo de l'objet" className="size-full object-contain" />
      </div>
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Voir la photo ${i + 1}`}
              className={cn(
                "size-14 shrink-0 overflow-hidden rounded-lg border-2 border-transparent opacity-70 transition",
                i === active && "border-primary opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
