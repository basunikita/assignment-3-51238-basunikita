import NewExerciseScreen from "@/app/screens/NewExerciseScreen";
import { dayInfo } from "@/lib/routine";
import type { StrengthDayId } from "@/lib/types";
import { safeReturnTo } from "@/lib/validation";

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function Page({ searchParams }: PageProps<"/exercises/new">) {
  const params = await searchParams;
  const day = dayInfo(first(params.day) ?? "");
  // Only a strength day can be preselected; from cardio or rest the choice is left to her.
  const initialDay = day?.kind === "strength" ? (day.id as StrengthDayId) : null;
  return <NewExerciseScreen initialDay={initialDay} returnTo={safeReturnTo(first(params.returnTo))} />;
}
