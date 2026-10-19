"use client";

import { useRouter } from "next/navigation";
import { createSampleStore } from "@/lib/sample";
import { createSeed } from "@/lib/seed";
import { STORAGE_KEY } from "@/lib/storage";
import { useStore } from "@/lib/store-client";
import PageHeader from "../components/PageHeader";
import Button from "../design-system/components/Button";

// Review helper: swap in three weeks of past workouts, or go back to a first visit.
export default function SampleScreen() {
  const { today, update } = useStore();
  const router = useRouter();

  const backUp = () => {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current) window.localStorage.setItem(`plate-log:backup-${Date.now()}`, current);
  };

  const loadSample = () => {
    backUp();
    update(() => createSampleStore(today(), () => crypto.randomUUID()));
    router.push("/");
  };

  const clearAll = () => {
    backUp();
    update(() => createSeed());
    router.push("/");
  };

  return (
    <>
      <PageHeader eyebrow="For reviews only" title="Sample history" meta="Your current log is backed up in this browser first." />
      <p>Loads three weeks of past workouts (with a missed week) so you can see last time (each set prefilled at its old weight), new bests, the chart, the week strip and the streak.</p>
      <Button onClick={loadSample}>Load sample history</Button>
      <Button variant="secondary" onClick={clearAll}>
        Clear everything (back to a first visit)
      </Button>
    </>
  );
}
