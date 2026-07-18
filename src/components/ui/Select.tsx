import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 rounded-control border border-hairline bg-white px-3 text-sm text-ink",
        "transition-colors duration-150 focus:border-brand",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
