interface SidebarToggleProps {
  activeView: 'risks' | 'summary'
  onToggle: (view: 'risks' | 'summary') => void
}

export function SidebarToggle({ activeView, onToggle }: SidebarToggleProps) {
  return (
    <div className="flex rounded-lg bg-gray-800 p-1 border border-gray-700">
      <button
        onClick={() => onToggle('risks')}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          activeView === 'risks' 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        Risks
      </button>
      <button
        onClick={() => onToggle('summary')}
        className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          activeView === 'summary' 
            ? 'bg-blue-600 text-white' 
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        Summary
      </button>
    </div>
  )
} 