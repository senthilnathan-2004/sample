import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "h-11 w-full rounded-control border bg-white px-3 text-sm text-ink placeholder:text-muted",
        "transition-colors duration-150 focus:border-brand",
        invalid ? "border-[color:var(--warning)]" : "border-hairline",
        className,
      )}
      {...props}
    />
  );
});
