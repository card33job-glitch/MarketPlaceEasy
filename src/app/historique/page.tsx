import type { Metadata } from "next";

import { HistoryList } from "@/components/history-list";

export const metadata: Metadata = {
  title: "Historique – MarketPlaceEasy",
};

export default function HistoriquePage() {
  return <HistoryList />;
}
