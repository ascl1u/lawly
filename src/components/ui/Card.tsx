interface CardSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
}

export function CardSection({ title, children, className = '' }: CardSectionProps) {
  return (
    <div className={className}>
      {title && (
        <div className="px-4 py-4 sm:px-6">
          <h3 className="text-base font-medium text-gray-400">{title}</h3>
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}

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
      <h3 className="text-lg font-medium">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
      )}
    </div>
  )
}

export function CardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`px-4 py-5 sm:px-6 ${className}`}>
      {children}
    </div>
  )
} 