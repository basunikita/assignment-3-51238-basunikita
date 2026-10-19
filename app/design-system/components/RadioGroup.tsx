"use client";

import { useRecipe } from "../RecipeContext";

type RadioGroupProps = {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

export default function RadioGroup({ name, legend, options, value, onChange }: RadioGroupProps) {
  const recipe = useRecipe();
  return (
    <fieldset>
      <legend className={recipe.fieldLabel}>{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          return (
            <label key={option.value} htmlFor={id} className={recipe.choiceLabel}>
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
    </fieldset>
  );
}
