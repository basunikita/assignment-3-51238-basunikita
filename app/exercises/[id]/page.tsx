import ExerciseScreen from "@/app/screens/ExerciseScreen";

export default async function Page({ params }: PageProps<"/exercises/[id]">) {
  const { id } = await params;
  return <ExerciseScreen id={id} />;
}
