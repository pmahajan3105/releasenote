import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const iconWithBackgroundVariants = cva(
  "inline-flex items-center justify-center rounded-lg",
  {
    variants: {
      size: {
        small: "h-8 w-8",
        medium: "h-10 w-10", 
        large: "h-16 w-16",
      },
      variant: {
        default: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        primary: "bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400",
        secondary: "bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-400",
      },
    },
    defaultVariants: {
      size: "medium",
      variant: "default",
    },
  }
)

export interface IconWithBackgroundProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconWithBackgroundVariants> {
  icon: React.ReactNode
}

const IconWithBackground = React.forwardRef<HTMLDivElement, IconWithBackgroundProps>(
  ({ className, size, variant, icon, ...props }, ref) => {
    return (
      <div
        className={cn(iconWithBackgroundVariants({ size, variant, className }))}
        ref={ref}
        {...props}
      >
        {React.cloneElement(icon as React.ReactElement, {
          className: cn(
            size === "small" ? "h-4 w-4" :
            size === "medium" ? "h-5 w-5" : 
            "h-8 w-8"
          )
        })}
      </div>
    )
  }
)
IconWithBackground.displayName = "IconWithBackground"

export { IconWithBackground, iconWithBackgroundVariants }
