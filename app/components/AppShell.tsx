"use client";

import type { ReactNode } from "react";
import { useStore } from "@/lib/store-client";
import Button from "../design-system/components/Button";
import Banner from "./Banner";
import TabBar from "./TabBar";

export default function AppShell({ children }: { children: ReactNode }) {
  const { data, dismissStatus } = useStore();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-40 border-2 border-ink bg-accent px-4 py-2 font-bold text-on-accent focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <div className="mx-auto grid max-w-[560px] gap-6 px-4 pt-6 pb-36">
        {data?.status === "recovered" && (
          <Banner
            tone="warning"
            action={
              <Button variant="secondary" className="px-3 py-1 text-base" onClick={dismissStatus}>
                OK
              </Button>
            }
          >
            We couldn&apos;t read your saved log, so we started a fresh one. Your old data is kept in this browser.
          </Banner>
        )}
        {data?.status === "unavailable" && (
          <Banner tone="warning">This browser isn&apos;t saving your log. It will be lost when you close the tab.</Banner>
        )}
        <main id="main" tabIndex={-1} className="grid gap-6 outline-none">
          {children}
        </main>
        <footer className="text-center text-sm font-bold text-muted">Saved on this device</footer>
      </div>
      <TabBar />
    </>
  );
}
