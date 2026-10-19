import HistoryDayScreen from "@/app/screens/HistoryDayScreen";

export default async function Page({ params }: PageProps<"/history/[date]">) {
  const { date } = await params;
  return <HistoryDayScreen date={date} />;
}
