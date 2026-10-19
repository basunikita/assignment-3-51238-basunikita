import LogExerciseScreen from "@/app/screens/LogExerciseScreen";

export default async function Page({ params }: PageProps<"/workout/[day]/[exercise]">) {
  const { day, exercise } = await params;
  return <LogExerciseScreen dayId={day} exerciseId={exercise} />;
}
