"use client";

import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

const STEPS = [
  "Analyse des photos…",
  "Identification de l'objet et de la marque…",
  "Évaluation de l'état…",
  "Rédaction du titre et de la description…",
  "Estimation du prix selon le marché…",
];

export function Analyzing({ photo }: { photo?: string }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3">
        <Loader2Icon className="size-5 animate-spin text-primary" />
        <p className="font-medium">{STEPS[step]}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="relative aspect-square overflow-hidden rounded-2xl border bg-neutral-900">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="size-full object-contain opacity-60" />
          )}
          <div className="absolute inset-x-0 h-1/3 animate-[scan_2.2s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
        </div>
        <div className="space-y-4 rounded-2xl border bg-card p-5">
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-8 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="space-y-2 pt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-3.5" style={{ width: `${95 - i * 9}%` }} />
            ))}
          </div>
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
