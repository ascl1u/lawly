export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-800 shadow rounded-lg">
      {children}
    </div>
  )
}

export function CardHeader({ 
  title, 
  subtitle 
}: { 
  title: string
  subtitle?: string 
}) {
  return (
    <div className="px-4 py-5 sm:px-6">
      <h3 className="text-lg font-medium leading-6 text-white">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-300">{subtitle}</p>
      )}
    </div>
  )
}

export function CardSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-md font-medium text-white mb-2">{title}</h4>
      {children}
    </div>
  )
} 