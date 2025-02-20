import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarToggleProps {
  activeView: 'risks' | 'summary' | 'chat'
  onToggle: (view: 'risks' | 'summary' | 'chat') => void
}

export function SidebarToggle({ activeView, onToggle }: SidebarToggleProps) {
  return (
    <div className="flex rounded-full bg-primary p-1 space-x-1">
      <Button
        onClick={() => onToggle('risks')}
        variant={activeView === 'risks' ? 'secondary' : 'ghost'}
        className={cn(
          "flex-1 text-sm font-medium",
          activeView === 'risks' 
            ? "text-primary bg-secondary hover:bg-secondary/90" 
            : "text-primary-foreground hover:bg-primary-foreground/10"
        )}
        size="sm"
      >
        Risks
      </Button>
      <Button
        onClick={() => onToggle('summary')}
        variant={activeView === 'summary' ? 'secondary' : 'ghost'}
        className={cn(
          "flex-1 text-sm font-medium",
          activeView === 'summary' 
            ? "text-primary bg-secondary hover:bg-secondary/90" 
            : "text-primary-foreground hover:bg-primary-foreground/10"
        )}
        size="sm"
      >
        Summary
      </Button>
      <Button
        onClick={() => onToggle('chat')}
        variant={activeView === 'chat' ? 'secondary' : 'ghost'}
        className={cn(
          "flex-1 text-sm font-medium",
          activeView === 'chat' 
            ? "text-primary bg-secondary hover:bg-secondary/90" 
            : "text-primary-foreground hover:bg-primary-foreground/10"
        )}
        size="sm"
      >
        Chat
      </Button>
    </div>
  )
} 