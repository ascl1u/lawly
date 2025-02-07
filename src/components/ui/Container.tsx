interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
      <div className="mx-auto">
        {children}
      </div>
    </div>
  )
} 