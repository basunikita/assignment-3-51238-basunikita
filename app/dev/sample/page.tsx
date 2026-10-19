import { notFound } from "next/navigation";
import SampleScreen from "@/app/screens/SampleScreen";

// Read the environment on each request, so the live site (where neither is set) answers 404.
export const dynamic = "force-dynamic";

export default function Page() {
  const enabled = process.env.NODE_ENV === "development" || process.env.PLATE_LOG_SAMPLE === "1";
  if (!enabled) notFound();
  return <SampleScreen />;
}
