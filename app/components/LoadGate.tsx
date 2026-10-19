"use client";

import type { ReactNode } from "react";
import type { Snapshot } from "@/lib/store-controller";
import { useStore } from "@/lib/store-client";
import StatePanel from "../design-system/components/StatePanel";

// Pages read localStorage, which only exists in the browser: show the loading state until then.
export default function LoadGate({ children }: { children: (data: Snapshot) => ReactNode }) {
  const { data } = useStore();
  if (!data) return <StatePanel kind="loading">Loading your log…</StatePanel>;
  return children(data);
}
