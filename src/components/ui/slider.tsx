import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value?: number[];
  onValueChange?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

function Slider({ value = [0], onValueChange, min = 0, max = 100, step = 1, className, disabled }: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange?.([Number(e.target.value)]);
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      disabled={disabled}
      className={cn(
        "w-full h-2 rounded-full appearance-none cursor-pointer accent-cyan-500",
        "bg-slate-200 dark:bg-slate-700",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    />
  );
}

export { Slider }
