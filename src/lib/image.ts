const MAX_SIDE = 1280;
const THUMB_SIDE = 320;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new Error(
          `Impossible de lire « ${file.name} ». Essaie une photo JPEG ou PNG.`,
        ),
      );
    };
    img.src = url;
  });
}

function draw(img: HTMLImageElement, maxSide: number, quality: number): string {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Ton navigateur ne peut pas traiter les images.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

export type PreparedPhoto = {
  id: string;
  /** Photo réduite envoyée à l'IA. */
  dataUrl: string;
  /** Miniature gardée dans l'historique local. */
  thumbUrl: string;
};

/**
 * Les photos de téléphone font souvent plusieurs Mo : on les réduit avant
 * l'envoi pour accélérer l'analyse et ne pas saturer le localStorage.
 */
export async function preparePhoto(file: File): Promise<PreparedPhoto> {
  const img = await loadImage(file);
  return {
    id: crypto.randomUUID(),
    dataUrl: draw(img, MAX_SIDE, 0.85),
    thumbUrl: draw(img, THUMB_SIDE, 0.7),
  };
}
