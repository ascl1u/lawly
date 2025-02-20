import type { DocumentDetails } from "@/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface RiskSidebarProps {
  document: DocumentDetails
}

export function RiskSidebar({ document }: RiskSidebarProps) {
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(["high", "medium", "low"])

  // Group risks by severity with null check
  const risksBySeverity = document.risks?.reduce(
    (acc, risk) => {
      const severity = risk.risk_severity || "unknown"
      if (!acc[severity]) {
        acc[severity] = []
      }
      acc[severity].push(risk)
      return acc
    },
    {} as Record<string, typeof document.risks>,
  ) || {}

  const severityOrder = ["high", "medium", "low"]

  const handleSeverityToggle = (severity: string) => {
    setSelectedSeverities((prev) =>
      prev.includes(severity) ? prev.filter((s) => s !== severity) : [...prev, severity],
    )
  }

  return (
    <Card className="h-full bg-primary border-primary/20">
      <CardHeader className="border-b border-primary/20">
        <CardTitle className="text-primary-foreground">Risk Analysis</CardTitle>
        <div className="flex gap-2 mt-2">
          {severityOrder.map((severity) => (
            <Badge
              key={severity}
              variant="outline"
              className={cn(
                "cursor-pointer border-primary/20",
                selectedSeverities.includes(severity)
                  ? "bg-primary-foreground/10 text-primary-foreground"
                  : "text-primary-foreground/40 hover:text-primary-foreground/60"
              )}
              onClick={() => handleSeverityToggle(severity)}
            >
              {severity}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-16rem)]">
          <div className="p-6 space-y-4">
            {severityOrder.map((severity) => (
              selectedSeverities.includes(severity) && 
              risksBySeverity[severity]?.length > 0 && (
                <div key={severity} className="space-y-3">
                  <h3 className="text-lg font-semibold text-primary-foreground">
                    {severity.charAt(0).toUpperCase() + severity.slice(1)} Risks
                  </h3>
                  {risksBySeverity[severity]?.map((risk, index) => (
                    <Card 
                      key={index}
                      className={cn(
                        "border-l-4 bg-white",
                        {
                          'border-l-destructive': severity === 'high',
                          'border-l-warning': severity === 'medium',
                          'border-l-info': severity === 'low'
                        }
                      )}
                    >
                      <CardContent className="p-4">
                        <p className="font-medium text-primary">
                          {risk.risk_description}
                        </p>
                        {risk.suggested_action && (
                          <p className="mt-2 text-sm text-accent">
                            {risk.suggested_action}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

