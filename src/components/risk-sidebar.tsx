import type { DocumentDetails } from "@/types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useState } from "react"

interface RiskSidebarProps {
  document: DocumentDetails
}

export function RiskSidebar({ document }: RiskSidebarProps) {
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(["high", "medium", "low"])

  // Group risks by severity
  const risksBySeverity = document.risks?.reduce(
    (acc, risk) => {
      const severity = risk.risk_severity || "unknown"
      return {
        ...acc,
        [severity]: [...(acc[severity] || []), risk],
      }
    },
    {} as Record<string, typeof document.risks>,
  )

  const severityOrder = ["high", "medium", "low"]

  const handleSeverityToggle = (severity: string) => {
    setSelectedSeverities((prev) =>
      prev.includes(severity) ? prev.filter((s) => s !== severity) : [...prev, severity],
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Risk Analysis</CardTitle>
        <CardDescription>{`${document.risks?.length || 0} risks identified`}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Filter by Severity</h4>
          <div className="flex space-x-4">
            {severityOrder.map((severity) => (
              <div key={severity} className="flex items-center">
                <Checkbox
                  id={`severity-${severity}`}
                  checked={selectedSeverities.includes(severity)}
                  onCheckedChange={() => handleSeverityToggle(severity)}
                />
                <label htmlFor={`severity-${severity}`} className="ml-2 text-sm capitalize">
                  {severity}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {severityOrder.map((severity) => {
            const risks = risksBySeverity?.[severity] || []
            if (risks.length === 0 || !selectedSeverities.includes(severity)) return null

            return (
              <div key={severity} className="space-y-2">
                <h4 className="text-sm font-medium">{`${severity.toUpperCase()} RISK (${risks.length})`}</h4>
                <div className="space-y-3">
                  {risks.map((risk, index) => (
                    <div key={index} className="p-4 rounded-md border bg-card">
                      <p className="font-medium text-sm">{risk.risk_description}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{risk.suggested_action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

