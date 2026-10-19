import type { ReactNode } from "react";

type BannerProps = {
  tone: "warning" | "success";
  children: ReactNode;
  action?: ReactNode;
};

// A full-width notice: storage problems (warning) or a new best (success).
export default function Banner({ tone, children, action }: BannerProps) {
  const fill = tone === "success" ? "bg-accent text-on-accent" : "bg-surface text-ink";
  return (
    <div
      role={tone === "warning" ? "alert" : "status"}
      className={`flex flex-wrap items-center justify-between gap-3 border-2 border-ink p-3 font-bold ${fill}`}
    >
      <p className="min-w-0 flex-1">{children}</p>
      {action}
    </div>
  );
}
