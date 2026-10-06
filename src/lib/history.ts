import type { AnalyzeMode, Listing } from "./listing";

export type SavedListing = {
  id: string;
  createdAt: string;
  mode: AnalyzeMode;
  listing: Listing;
  thumbnails: string[];
};

const KEY = "marketplace-easy:annonces";
const EVENT = "marketplace-easy:history";

export function loadHistory(): SavedListing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let cachedRaw: string | null = null;
let cachedItems: SavedListing[] = [];
const EMPTY: SavedListing[] = [];

/** Snapshot stable pour useSyncExternalStore. */
export function getHistorySnapshot(): SavedListing[] {
  const raw = window.localStorage.getItem(KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = loadHistory();
  }
  return cachedItems;
}

export function getServerHistorySnapshot(): SavedListing[] {
  return EMPTY;
}

function write(items: SavedListing[]) {
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

/** Retourne false si le stockage local est plein. */
export function saveListing(entry: SavedListing): boolean {
  const items = [entry, ...loadHistory().filter((i) => i.id !== entry.id)];
  try {
    write(items);
    return true;
  } catch {
    try {
      write([{ ...entry, thumbnails: entry.thumbnails.slice(0, 1) }, ...items.slice(1)]);
      return true;
    } catch {
      return false;
    }
  }
}

export function deleteListing(id: string) {
  write(loadHistory().filter((i) => i.id !== id));
}

export function subscribeHistory(callback: () => void): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) callback();
  };
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}
