import * as React from "react"
import { cn } from "@/lib/utils"
import { Container } from "@/components/ui/container"

interface PolicyContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

const PolicyContainer = React.forwardRef<HTMLDivElement, PolicyContainerProps>(
  ({ title, lastUpdated, children, className, ...props }, ref) => {
    return (
      <Container>
        <div
          ref={ref}
          className={cn("max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8", className)}
          {...props}
        >
          <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
          <p className="text-muted-foreground mb-8">Last Updated: {lastUpdated}</p>
          
          <div className="prose prose-invert max-w-none">
            {children}
          </div>
        </div>
      </Container>
    )
  }
)
PolicyContainer.displayName = "PolicyContainer"

export { PolicyContainer }