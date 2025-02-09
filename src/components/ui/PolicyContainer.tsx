import { Container } from './Container'

interface PolicyContainerProps {
  title: string
  lastUpdated: string
  children: React.ReactNode
}

export function PolicyContainer({ title, lastUpdated, children }: PolicyContainerProps) {
  return (
    <Container>
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-4">{title}</h1>
        <p className="text-gray-400 mb-8">Last Updated: {lastUpdated}</p>
        
        <div className="prose prose-invert max-w-none">
          {children}
        </div>
      </div>
    </Container>
  )
} 