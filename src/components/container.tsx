import * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "px-4 py-6 sm:px-6 lg:px-8",
          "mx-auto max-w-7xl",
          className
        )}
        {...props}
      >
        <div className="mx-auto">{children}</div>
      </div>
    )
  }
)
Container.displayName = "Container"

export { Container } 