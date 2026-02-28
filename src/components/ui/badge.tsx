import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" }) {
  return (
    <div className={cn(
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
      variant === "default" && "border-transparent bg-slate-900 text-slate-50 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
      variant === "secondary" && "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
      variant === "outline" && "text-slate-900 dark:text-slate-100 dark:border-slate-700",
      className
    )} {...props} />
  )
}

export { Badge }
