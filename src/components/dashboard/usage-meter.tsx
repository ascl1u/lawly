interface UsageMeterProps {
  usage: number
  limit: number
}

export function UsageMeter({ usage, limit }: UsageMeterProps) {
  const percentage = Math.min((usage / limit) * 100, 100)
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span>Analyses used</span>
        <span>{usage} / {limit}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
} 