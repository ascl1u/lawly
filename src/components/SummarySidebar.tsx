import { DocumentDetails } from '@/types'
import { Card, CardHeader, CardSection, CardContent } from '@/components/ui/Card'

interface SummarySidebarProps {
  document: DocumentDetails
}

export function SummarySidebar({ document }: SummarySidebarProps) {
  return (
    <div className="h-full bg-gray-900">
      <Card className="h-full rounded-none border-l border-gray-700 bg-gray-900">
        <CardHeader 
          title="Document Summary" 
          subtitle="AI-generated analysis"
          className="text-gray-100 border-b border-gray-700"
        />
        
        <CardContent className="space-y-6">
          <CardSection
            title="SUMMARY"
            className="text-gray-100"
          >
            <div className="p-4 rounded-md border border-blue-700 text-blue-200 transition-colors hover:bg-gray-800">
              <p className="text-sm">{document.summary?.summary_text || 'No summary available'}</p>
            </div>
          </CardSection>

          <CardSection
            title="SIMPLIFIED VERSION"
            className="text-gray-100"
          >
            <div className="p-4 rounded-md border border-purple-700 text-purple-200 transition-colors hover:bg-gray-800">
              <p className="text-sm">{document.summary?.simplified_text || 'No simplified version available'}</p>
            </div>
          </CardSection>
        </CardContent>
      </Card>
    </div>
  )
} 