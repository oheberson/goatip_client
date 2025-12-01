"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(
  ({ className, value, onValueChange, min = 0, max = 100, step = 0.1, ...props }, ref) => {
    const handleChange = (e) => {
      const newValue = parseFloat(e.target.value);
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="relative w-full">
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className={cn(
            "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md",
            "[&::-moz-range-thumb]:w-[18px] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-none",
            className
          )}
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${percentage}%, hsl(var(--muted)) ${percentage}%, hsl(var(--muted)) 100%)`,
          }}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";

export { Slider };

