"use client";

import { useRecipe } from "../RecipeContext";

type RadioGroupProps = {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  value: string | null;
  onChange: (value: string) => void;
  error?: string;
  // One option per line instead of wrapping in a row.
  stacked?: boolean;
};

export default function RadioGroup({ name, legend, options, value, onChange, error, stacked = false }: RadioGroupProps) {
  const recipe = useRecipe();
  const errorId = `${name}-error`;
  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className={recipe.fieldLabel}>{legend}</legend>
      <div className={`mt-2 flex gap-x-5 gap-y-2 ${stacked ? "flex-col" : "flex-wrap"}`}>
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <label key={option.value} htmlFor={id} className={`${recipe.choiceLabel} min-h-11`}>
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className={`${recipe.radio} ${recipe.focus}`}
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-2 flex gap-1.5 text-sm font-bold">
          <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center bg-(--swatch-red) text-xs text-(--swatch-panel)">
            !
          </span>
          {error}
        </p>
      )}
    </fieldset>
  );
}
