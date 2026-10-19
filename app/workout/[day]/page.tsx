import WorkoutScreen from "@/app/screens/WorkoutScreen";

export default async function Page({ params }: PageProps<"/workout/[day]">) {
  const { day } = await params;
  return <WorkoutScreen dayId={day} />;
}
