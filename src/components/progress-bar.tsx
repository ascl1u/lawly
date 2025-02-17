import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  status: 'pending' | 'parsing' | 'analyzed' | 'error'
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, status, ...props }, ref) => {
  const getProgress = () => {
    switch (status) {
      case 'pending': return 0
      case 'parsing': return 50
      case 'analyzed': return 100
      case 'error': return 100
      default: return 0
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'parsing': return 'bg-blue-600'
      case 'analyzed': return 'bg-green-600'
      case 'error': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-2.5 w-full overflow-hidden rounded-full bg-gray-700",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all duration-500",
          getStatusColor()
        )}
        style={{ transform: `translateX(-${100 - getProgress()}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
