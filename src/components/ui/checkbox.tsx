"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer relative flex size-5 shrink-0 items-center justify-center rounded-[0.55rem] border border-[rgba(2,0,108,0.24)] bg-white text-white shadow-[0_0.55rem_1.2rem_rgba(16,22,33,0.07)] transition-[background-color,border-color,box-shadow,transform] duration-200 outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:-translate-y-px focus-visible:border-[#02006c] focus-visible:ring-[0.22rem] focus-visible:ring-[rgba(2,0,108,0.12)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-checked:border-[#02006c] data-checked:bg-[#02006c] data-checked:shadow-[0_0.7rem_1.5rem_rgba(2,0,108,0.22)] dark:data-checked:bg-primary",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
