import * as React from "react"
import { cn } from "@/lib/utils"

interface ResizableLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  mainContent: React.ReactNode
  sidebarContent: React.ReactNode
  defaultSidebarWidth?: number
  minWidth?: number
  maxWidth?: number
}

const ResizableLayout = React.forwardRef<HTMLDivElement, ResizableLayoutProps>(
  ({ 
    mainContent, 
    sidebarContent, 
    defaultSidebarWidth = 400,
    minWidth = 300,
    maxWidth = 800,
    className,
    ...props 
  }, ref) => {
    const [sidebarWidth, setSidebarWidth] = React.useState(defaultSidebarWidth)
    const [isResizing, setIsResizing] = React.useState(false)

    React.useEffect(() => {
      if (isResizing) {
        document.body.style.userSelect = 'none'
        document.body.style.cursor = 'col-resize'
      } else {
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
      }
    }, [isResizing])

    const startResizing = React.useCallback((e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
    }, [])

    const stopResizing = React.useCallback(() => {
      setIsResizing(false)
    }, [])

    const resize = React.useCallback((e: React.MouseEvent | MouseEvent) => {
      if (isResizing) {
        const newWidth = document.documentElement.clientWidth - e.clientX
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setSidebarWidth(newWidth)
        }
      }
    }, [isResizing, minWidth, maxWidth])

    return (
      <div 
        ref={ref}
        className={cn("flex h-full relative", className)}
        onMouseMove={resize}
        onMouseUp={stopResizing}
        onMouseLeave={stopResizing}
        {...props}
      >
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1">
            {mainContent}
          </div>
          
          <div
            className="w-6 cursor-col-resize flex items-center justify-center hover:bg-accent/10 group border-l border-border"
            onMouseDown={startResizing}
          >
            <div className={cn(
              "w-0.5 h-8 bg-muted-foreground group-hover:bg-accent transition-colors",
              isResizing && "bg-accent"
            )} />
          </div>
        </div>

        <div 
          className="h-full overflow-auto"
          style={{ width: sidebarWidth }}
        >
          <div className="h-full overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      </div>
    )
  }
)
ResizableLayout.displayName = "ResizableLayout"

export { ResizableLayout } 