import { DocumentDetails } from '@/types'
import { Card, CardHeader, CardSection, CardContent } from '@/components/ui/Card'

interface RiskSidebarProps {
  document: DocumentDetails
}

export function RiskSidebar({ document }: RiskSidebarProps) {
  // Group risks by severity
  const risksBySeverity = document.risks?.reduce((acc, risk) => {
    const severity = risk.risk_severity || 'unknown'
    return {
      ...acc,
      [severity]: [...(acc[severity] || []), risk]
    }
  }, {} as Record<string, typeof document.risks>)

  const severityOrder = ['high', 'medium', 'low']

  return (
    <div className="h-full">
      <Card className="h-full rounded-none border-l border-gray-700">
        <CardHeader 
          title="Risk Analysis" 
          subtitle={`${document.risks?.length || 0} risks identified`}
          className="text-gray-100 border-b border-gray-700"
        />
        
        <CardContent className="space-y-6">
          {severityOrder.map(severity => {
            const risks = risksBySeverity?.[severity] || []
            if (risks.length === 0) return null

            return (
              <CardSection
                key={severity}
                title={`${severity.toUpperCase()} RISK (${risks.length})`}
                className="text-gray-100"
              >
                <div className="space-y-3 mt-3">
                  {risks.map((risk, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-md border transition-colors hover:bg-gray-800 ${
                        severity === 'high' ? 'border-red-700 text-red-200' :
                        severity === 'medium' ? 'border-yellow-700 text-yellow-200' :
                        'border-green-700 text-green-200'
                      }`}
                    >
                      <p className="font-medium text-sm">{risk.risk_description}</p>
                      <p className="mt-1 text-sm text-gray-400">{risk.suggested_action}</p>
                    </div>
                  ))}
                </div>
              </CardSection>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
} 