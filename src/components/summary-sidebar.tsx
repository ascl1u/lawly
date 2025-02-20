import { DocumentDetails } from '@/types'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SummarySidebarProps {
  document: DocumentDetails
}

export function SummarySidebar({ document }: SummarySidebarProps) {
  return (
    <Card className="h-full bg-primary border-primary/20">
      <CardHeader className="border-b border-primary/20">
        <CardTitle className="text-primary-foreground">Document Summary</CardTitle>
        <p className="text-sm text-primary-foreground/60">AI-generated analysis</p>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="p-6 space-y-4">
            <Card className="bg-white">
              <CardContent className="p-4">
                <p className="text-primary">
                  {document.summary?.summary_text || 'No summary available'}
                </p>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
} 