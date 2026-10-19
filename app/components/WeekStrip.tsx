import type { StripDay } from "@/lib/stats";
import { TONE_FILL } from "./toneStyles";

// This week, Monday to Sunday. Trained days fill with the day's color; two workouts split the cell.
export default function WeekStrip({ days }: { days: StripDay[] }) {
  return (
    <ul aria-label="This week" className="grid grid-cols-7 gap-1.5">
      {days.map((day) => {
        const [first, second] = day.tones;
        const outline = day.isToday ? "outline-3 outline-offset-2 outline-ink" : "";
        const border = day.isFuture ? "border-line text-muted" : "border-ink";
        return (
          <li key={day.date} className={`relative grid aspect-[3/4] place-items-center overflow-hidden border-2 bg-surface ${border} ${outline}`}>
            <span className="sr-only">{day.label}</span>
            {first && <span aria-hidden="true" className={`absolute inset-0 ${TONE_FILL[first]}`} />}
            {second && <span aria-hidden="true" className={`absolute inset-y-0 right-0 w-1/2 border-l-2 border-ink ${TONE_FILL[second]}`} />}
            <span
              aria-hidden="true"
              className={`relative grid justify-items-center leading-none ${first ? "text-(--swatch-panel)" : ""}`}
            >
              <span className="font-label text-[11px] font-bold uppercase">{day.letter}</span>
              <span className="font-numbers text-xl font-extrabold">{day.dayNumber}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
