import { DocumentDetails } from '@/types'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card'

interface SummarySidebarProps {
  document: DocumentDetails
}

export function SummarySidebar({ document }: SummarySidebarProps) {
  return (
    <div className="h-full">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Document Summary</CardTitle>
          <CardDescription>AI-generated analysis</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Summary</h4>
            <div className="p-4 rounded-md border bg-card">
              <p className="text-sm">{document.summary?.summary_text || 'No summary available'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">Simplified Version</h4>
            <div className="p-4 rounded-md border bg-card">
              <p className="text-sm">{document.summary?.simplified_text || 'No simplified version available'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 