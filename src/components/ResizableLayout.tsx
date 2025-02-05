import { useState, useCallback, useEffect } from 'react'

interface ResizableLayoutProps {
  mainContent: React.ReactNode
  sidebarContent: React.ReactNode
  defaultSidebarWidth?: number
  minWidth?: number
  maxWidth?: number
}

export function ResizableLayout({
  mainContent,
  sidebarContent,
  defaultSidebarWidth = 400,
  minWidth = 300,
  maxWidth = 800
}: ResizableLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(defaultSidebarWidth)
  const [isResizing, setIsResizing] = useState(false)

  // Prevent text selection while resizing
  useEffect(() => {
    if (isResizing) {
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
    } else {
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isResizing])

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (isResizing) {
      const newWidth = document.documentElement.clientWidth - e.clientX
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setSidebarWidth(newWidth)
      }
    }
  }, [isResizing, minWidth, maxWidth])

  return (
    <div 
      className="flex h-full relative select-none"
      onMouseMove={resize}
      onMouseUp={stopResizing}
      onMouseLeave={stopResizing}
    >
      {/* Main content wrapper */}
      <div className="flex-1 flex">
        {/* Document content with scroll */}
        <div className="flex-1 overflow-auto bg-gray-900">
          {mainContent}
        </div>
        
        {/* Resize handle with border */}
        <div
          className="w-6 cursor-col-resize flex items-center justify-center hover:bg-gray-700/50 group border-l border-gray-700"
          onMouseDown={startResizing}
        >
          <div className={`w-0.5 h-8 bg-gray-600 group-hover:bg-blue-400 transition-colors ${isResizing ? 'bg-blue-400' : ''}`} />
        </div>
      </div>

      {/* Sidebar */}
      <div 
        className="h-full overflow-auto bg-gray-900"
        style={{ width: sidebarWidth }}
      >
        {sidebarContent}
      </div>
    </div>
  )
} 