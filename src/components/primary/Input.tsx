import * as React from "react";
import { twMerge } from "tailwind-merge";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {label?: React.ReactNode, helperText?: string}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, ...props }, ref) => {
    return (
      <div className="flex flex-col items-start">
        {label}
        <input
          type={type}
          className={twMerge(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
        <label className="text-[0.8em] text-red-600 italic mt-2">{helperText}</label>
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
