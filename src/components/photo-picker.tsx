"use client";

import { useRef, useState } from "react";
import { CameraIcon, ImagePlusIcon, Loader2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { preparePhoto, type PreparedPhoto } from "@/lib/image";
import { MAX_IMAGES } from "@/lib/listing";
import { cn } from "@/lib/utils";

type Props = {
  photos: PreparedPhoto[];
  onChange: (photos: PreparedPhoto[]) => void;
};

export function PhotoPicker({ photos, onChange }: Props) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(0);
  const [dragging, setDragging] = useState(false);

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/") || f.type === "");
    if (files.length === 0) return;

    const room = MAX_IMAGES - photos.length;
    if (room <= 0) {
      toast.warning(`Maximum ${MAX_IMAGES} photos par annonce.`);
      return;
    }
    if (files.length > room) {
      toast.warning(`Seules les ${room} premières photos ont été ajoutées (maximum ${MAX_IMAGES}).`);
    }

    const accepted = files.slice(0, room);
    setProcessing(accepted.length);
    const results = await Promise.allSettled(accepted.map(preparePhoto));
    setProcessing(0);

    const ok = results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    results.forEach((r) => {
      if (r.status === "rejected") toast.error((r.reason as Error).message);
    });
    if (ok.length) onChange([...photos, ...ok]);
  }

  const empty = photos.length === 0;

  return (
    <div className="space-y-3">
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {empty ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-card px-6 py-12 text-center transition-colors",
            dragging && "border-primary bg-accent",
          )}
        >
          <div className="grid size-14 place-items-center rounded-full bg-accent text-accent-foreground">
            {processing ? (
              <Loader2Icon className="size-6 animate-spin" />
            ) : (
              <ImagePlusIcon className="size-6" />
            )}
          </div>
          <div className="space-y-1">
            <p className="font-medium">Ajoute une ou plusieurs photos de l&apos;objet</p>
            <p className="text-sm text-muted-foreground">
              Vue d&apos;ensemble, étiquette ou marque, défauts éventuels. Jusqu&apos;à {MAX_IMAGES} photos.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button size="lg" className="h-11 px-5 sm:hidden" onClick={() => cameraRef.current?.click()}>
              <CameraIcon /> Prendre une photo
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-5"
              onClick={() => galleryRef.current?.click()}
            >
              <ImagePlusIcon /> Choisir des photos
            </Button>
          </div>
          <p className="hidden text-xs text-muted-foreground sm:block">
            ou glisse-dépose tes photos ici
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {photos.map((photo, i) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-xl border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.thumbUrl} alt={`Photo ${i + 1}`} className="size-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Principale
                </span>
              )}
              <button
                type="button"
                aria-label={`Retirer la photo ${i + 1}`}
                onClick={() => onChange(photos.filter((p) => p.id !== photo.id))}
                className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          ))}
          {Array.from({ length: processing }).map((_, i) => (
            <div key={`p${i}`} className="grid aspect-square place-items-center rounded-xl border bg-muted">
              <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
            </div>
          ))}
          {photos.length + processing < MAX_IMAGES && (
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <ImagePlusIcon className="size-5" />
              Ajouter
            </button>
          )}
        </div>
      )}
    </div>
  );
}
