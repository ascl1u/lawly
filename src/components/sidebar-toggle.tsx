import { Button } from "@/components/ui/button"

interface SidebarToggleProps {
  activeView: 'risks' | 'summary' | 'chat'
  onToggle: (view: 'risks' | 'summary' | 'chat') => void
}

export function SidebarToggle({ activeView, onToggle }: SidebarToggleProps) {
  return (
    <div className="flex rounded-lg bg-muted p-1 space-x-1">
      <Button
        onClick={() => onToggle('risks')}
        variant={activeView === 'risks' ? 'default' : 'ghost'}
        className="flex-1"
        size="sm"
      >
        Risks
      </Button>
      <Button
        onClick={() => onToggle('summary')}
        variant={activeView === 'summary' ? 'default' : 'ghost'}
        className="flex-1"
        size="sm"
      >
        Summary
      </Button>
      <Button
        onClick={() => onToggle('chat')}
        variant={activeView === 'chat' ? 'default' : 'ghost'}
        className="flex-1"
        size="sm"
      >
        Chat
      </Button>
    </div>
  )
} 