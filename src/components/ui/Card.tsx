export function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-gray-800 shadow rounded-lg ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ 
  title, 
  subtitle,
  className = ''
}: { 
  title: string
  subtitle?: string
  className?: string
}) {
  return (
    <div className={`px-4 py-5 sm:px-6 ${className}`}>
      <h3 className="text-lg font-medium leading-6 text-gray-100">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
      )}
    </div>
  )
}

export function CardSection({ 
  title, 
  children,
  className = ''
}: { 
  title: string
  children: React.ReactNode
  className?: string 
}) {
  return (
    <div className={className}>
      <h4 className="text-md font-medium text-gray-100 mb-2">{title}</h4>
      {children}
    </div>
  )
}

export function CardContent({ 
  children,
  className = ''
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`px-4 py-5 sm:px-6 ${className}`}>
      {children}
    </div>
  )
} 