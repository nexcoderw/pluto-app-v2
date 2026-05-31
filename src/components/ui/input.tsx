import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

type InputProps = React.ComponentProps<"input"> & {
  icon?: React.ReactNode
  endAdornment?: React.ReactNode
  shellClassName?: string
}

function Input({
  className,
  type,
  icon,
  endAdornment,
  shellClassName,
  ...props
}: InputProps) {
  const input = (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[2.95rem] w-full min-w-0 rounded-full border border-[rgba(2,0,108,0.34)] bg-[rgba(255,255,255,0.74)] px-4 py-1 text-base text-[#17171f] shadow-[0_0.8rem_2rem_rgba(16,22,33,0.06)] transition-[border-color,box-shadow,transform] duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-[#02006c] focus-visible:ring-[0.22rem] focus-visible:ring-[rgba(2,0,108,0.12)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[rgba(205,35,53,0.72)] aria-invalid:ring-[0.2rem] aria-invalid:ring-[rgba(205,35,53,0.1)] md:text-sm",
        (icon || endAdornment) &&
          "border-0 bg-transparent px-3 shadow-none focus-visible:ring-0 aria-invalid:ring-0",
        className
      )}
      {...props}
    />
  )

  if (!icon && !endAdornment) {
    return input
  }

  return (
    <div
      data-slot="input-shell"
      data-invalid={props["aria-invalid"] === true || props["aria-invalid"] === "true"}
      className={cn(
        "relative flex min-h-[3.15rem] w-full items-center rounded-full border border-[rgba(2,0,108,0.34)] bg-[rgba(255,255,255,0.74)] px-3 shadow-[0_0.8rem_2rem_rgba(16,22,33,0.06)] transition-[border-color,box-shadow,transform] duration-200 focus-within:-translate-y-px focus-within:border-[#02006c] focus-within:shadow-[0_0_0_0.22rem_rgba(2,0,108,0.12),0_1rem_2rem_rgba(16,22,33,0.08)] data-[invalid=true]:border-[rgba(205,35,53,0.72)] data-[invalid=true]:shadow-[0_0_0_0.2rem_rgba(205,35,53,0.1)]",
        shellClassName
      )}
    >
      {icon ? (
        <span
          data-slot="input-icon"
          className="flex shrink-0 text-[rgba(2,0,108,0.66)] [&_svg]:size-[1.08rem]"
        >
          {icon}
        </span>
      ) : null}
      {input}
      {endAdornment}
    </div>
  )
}

export { Input }
