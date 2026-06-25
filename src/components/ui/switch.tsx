"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border p-[0.1875rem] shadow-inner transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 data-[size=default]:h-[1.45rem] data-[size=default]:w-[2.75rem] data-[size=sm]:h-[1.15rem] data-[size=sm]:w-[2.1rem] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:shadow-primary/20 data-unchecked:border-border data-unchecked:bg-muted data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-background shadow-[0_0.2rem_0.6rem_rgba(16,22,33,0.2)] ring-0 transition-transform duration-200 ease-out group-data-[size=default]/switch:size-[0.95rem] group-data-[size=sm]/switch:size-[0.7rem] data-checked:translate-x-[1.3rem] data-checked:bg-primary-foreground group-data-[size=sm]/switch:data-checked:translate-x-[0.85rem] data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
