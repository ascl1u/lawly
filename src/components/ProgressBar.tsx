interface ProgressBarProps {
  status: 'pending' | 'parsing' | 'analyzed' | 'error'
}

export function ProgressBar({ status }: ProgressBarProps) {
  const progress = 
    status === 'pending' ? 0 :
    status === 'parsing' ? 50 :
    status === 'analyzed' ? 100 : 0

  const statusText = 
    status === 'pending' ? 'Preparing document...' :
    status === 'parsing' ? 'Analyzing document...' :
    status === 'analyzed' ? 'Analysis complete' :
    'Analysis failed'

  return (
    <div className="w-full p-6 bg-gray-800 border border-gray-700 rounded-lg">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">{statusText}</span>
        <span className="text-sm font-medium text-gray-300">{progress}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${
            status === 'error' ? 'bg-red-600' : 'bg-blue-600'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
} 