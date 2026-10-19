"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Today", matches: (path: string) => path === "/" || path.startsWith("/workout") },
  { href: "/history", label: "History", matches: (path: string) => path.startsWith("/history") },
  { href: "/exercises", label: "Exercises", matches: (path: string) => path.startsWith("/exercises") },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-ink bg-surface">
      <ul className="mx-auto grid max-w-[560px] grid-cols-3">
        {TABS.map((tab) => {
          const current = tab.matches(pathname);
          return (
            <li key={tab.href} className="border-l-2 border-ink first:border-l-0">
              <Link
                href={tab.href}
                aria-current={current ? "page" : undefined}
                className="flex min-h-14 items-center justify-center font-display text-xl font-extrabold uppercase text-ink transition-[color,background-color] focus-state:outline-3 focus-state:-outline-offset-5 focus-state:outline-focus hover-state:not-aria-[current=page]:bg-bg aria-[current=page]:bg-ink aria-[current=page]:text-(--swatch-panel) aria-[current=page]:focus-state:outline-(--swatch-panel)"
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
