"use client";

import LoadGate from "./components/LoadGate";
import PageHeader from "./components/PageHeader";

// Placeholder until the Today screen is built (plan Task 7).
export default function Home() {
  return <LoadGate>{({ store }) => <PageHeader eyebrow="Plate Log" title="Today" meta={`${store.exercises.length} exercises loaded`} />}</LoadGate>;
}
