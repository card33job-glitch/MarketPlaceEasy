"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { HistoryIcon, PlusIcon, SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  getHistorySnapshot,
  getServerHistorySnapshot,
  subscribeHistory,
} from "@/lib/history";
import type { AnalyzeMode } from "@/lib/listing";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();
  const history = useSyncExternalStore(
    subscribeHistory,
    getHistorySnapshot,
    getServerHistorySnapshot,
  );
  const [mode, setMode] = useState<AnalyzeMode | null>(null);

  useEffect(() => {
    fetch("/api/analyze")
      .then((r) => r.json())
      .then((d) => setMode(d.mode))
      .catch(() => setMode(null));
  }, []);

  const links = [
    { href: "/", label: "Nouvelle annonce", icon: PlusIcon },
    {
      href: "/historique",
      label: "Historique",
      icon: HistoryIcon,
      count: history.length,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <SparklesIcon className="size-4" />
          </span>
          <span className="hidden sm:inline">MarketPlaceEasy</span>
        </Link>
        {mode === "demo" && (
          <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
            Mode démo
          </Badge>
        )}
        <nav className="ml-auto flex items-center gap-1">
          {links.map(({ href, label, icon: Icon, count }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                pathname === href && "bg-accent text-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              <span className={cn(href === "/" && "hidden sm:inline")}>{label}</span>
              {count ? (
                <span className="rounded-full bg-primary px-1.5 text-xs leading-5 text-primary-foreground">
                  {count}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
