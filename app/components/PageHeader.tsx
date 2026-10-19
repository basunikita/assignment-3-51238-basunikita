"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useRecipe } from "../design-system/RecipeContext";

type PageHeaderProps = {
  back?: { href: string; label: string };
  eyebrow?: string;
  title: string;
  badge?: ReactNode;
  meta?: string;
};

export default function PageHeader({ back, eyebrow, title, badge, meta }: PageHeaderProps) {
  const recipe = useRecipe();
  return (
    <header className="grid gap-2">
      {back && (
        <Link href={back.href} className={`${recipe.link} ${recipe.focus} inline-flex min-h-11 items-center self-start`}>
          ← {back.label}
        </Link>
      )}
      {eyebrow && <p className={recipe.label}>{eyebrow}</p>}
      <h1 className="font-display text-5xl font-black uppercase leading-none break-words">{title}</h1>
      {(badge || meta) && (
        <div className="flex flex-wrap items-center gap-2">
          {badge}
          {meta && <p className="font-bold text-muted">{meta}</p>}
        </div>
      )}
    </header>
  );
}
