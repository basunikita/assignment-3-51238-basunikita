import { chartScale, labelIndexes } from "@/lib/chart";
import { formatShort } from "@/lib/dates";

type MaxWeightChartProps = {
  series: { date: string; max: number }[];
  summary: string;
};

const WIDTH = 320;
const HEIGHT = 190;
const PAD = { left: 38, right: 14, top: 26, bottom: 30 };
const MARKER = 9;

// Hand-drawn SVG: one point per date at the heaviest set that day, evenly spaced.
export default function MaxWeightChart({ series, summary }: MaxWeightChartProps) {
  if (series.length && series.every((point) => point.max === 0)) {
    return <p className="border-2 border-ink bg-surface p-4 font-bold">Bodyweight exercise: no weight to chart.</p>;
  }
  if (!series.length) return null;

  const { min, max, ticks } = chartScale(series.map((point) => point.max));
  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const x = (index: number) => PAD.left + (series.length === 1 ? plotWidth / 2 : (index / (series.length - 1)) * plotWidth);
  const y = (value: number) => PAD.top + plotHeight - ((value - min) / (max - min)) * plotHeight;
  const points = series.map((point, index) => ({ ...point, cx: x(index), cy: y(point.max) }));
  const labelled = new Set(labelIndexes(series.length));

  return (
    <figure className="grid gap-2 border-2 border-ink bg-surface p-3">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={summary} className="w-full">
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} className="stroke-line" strokeWidth={1} />
            <text x={PAD.left - 6} y={y(tick)} textAnchor="end" dominantBaseline="middle" className="fill-muted font-label text-[10px] font-bold">
              {tick}
            </text>
          </g>
        ))}
        <text x={PAD.left - 6} y={10} textAnchor="end" className="fill-muted font-label text-[10px] font-bold">
          lb
        </text>
        <line x1={PAD.left} x2={WIDTH - PAD.right} y1={HEIGHT - PAD.bottom} y2={HEIGHT - PAD.bottom} className="stroke-ink" strokeWidth={2} />
        {points.length > 1 && (
          <polyline points={points.map((point) => `${point.cx},${point.cy}`).join(" ")} fill="none" className="stroke-ink" strokeWidth={3} />
        )}
        {points.map((point, index) => {
          const latest = index === points.length - 1;
          return (
            <g key={point.date}>
              <rect
                x={point.cx - MARKER / 2}
                y={point.cy - MARKER / 2}
                width={MARKER}
                height={MARKER}
                className={`stroke-ink ${latest ? "fill-accent" : "fill-ink"}`}
                strokeWidth={2}
              />
              {labelled.has(index) && (
                <text x={point.cx} y={HEIGHT - PAD.bottom + 16} textAnchor="middle" className="fill-ink font-label text-[10px] font-bold">
                  {formatShort(point.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="text-sm font-bold">
        {summary}
        {series.length === 1 && " Log it again to see your line."}
      </figcaption>
    </figure>
  );
}
