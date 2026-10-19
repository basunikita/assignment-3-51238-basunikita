export default function StreakBadge({ weeks }: { weeks: number }) {
  if (weeks === 0) return <p className="font-bold">Log a workout this week to start a streak.</p>;
  return (
    <p className="flex items-baseline gap-3">
      <span className="font-numbers text-6xl font-extrabold leading-none">{weeks}</span>
      <span className="font-label text-sm font-bold uppercase tracking-[0.14em]">{weeks === 1 ? "Week in a row" : "Weeks in a row"}</span>
    </p>
  );
}
