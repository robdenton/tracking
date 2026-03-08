import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-zinc-900 text-white",
        secondary: "bg-zinc-100 text-zinc-700",
        outline: "border border-zinc-200 text-zinc-700",
        active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        dormant: "bg-amber-50 text-amber-700 border border-amber-200",
        watchlist: "bg-blue-50 text-blue-700 border border-blue-200",
        high: "bg-red-50 text-red-700 border border-red-200",
        medium: "bg-amber-50 text-amber-700 border border-amber-200",
        low: "bg-zinc-50 text-zinc-600 border border-zinc-200",
      },
    },
    defaultVariants: { variant: "secondary" },
  }
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
