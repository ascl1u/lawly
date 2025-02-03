import { DocumentDetails } from '@/types'

interface DocumentViewerProps {
  document: DocumentDetails
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  if (!document.content) return null

  // Split content into paragraphs
  const paragraphs = document.content.split('\n').filter(p => p.trim())

  return (
    <div className="prose prose-invert max-w-none">
      {paragraphs.map((paragraph, index) => {
        // Check if this paragraph contains any risks
        const relatedRisks = document.risks?.filter(risk => 
          paragraph.toLowerCase().includes(risk.risk_description?.toLowerCase() || '')
        )

        return (
          <div key={index} className="relative group">
            <p className={`mb-4 ${relatedRisks?.length ? 'bg-yellow-900/20 border border-yellow-700' : ''}`}>
              {paragraph}
            </p>
            
            {/* Risk Annotations */}
            {(relatedRisks?.length ?? 0) > 0 && (
              <div className="invisible group-hover:visible absolute right-0 translate-x-full px-4 top-0">
                <div className="bg-gray-800 shadow-lg rounded-lg p-4 max-w-sm border-l-4 border-yellow-600">
                  {(relatedRisks || []).map((risk, riskIndex) => (
                    <div key={riskIndex} className="mb-2 last:mb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          risk.risk_severity === 'high' ? 'bg-red-900/20 text-red-200' :
                          risk.risk_severity === 'medium' ? 'bg-yellow-900/20 text-yellow-200' :
                          'bg-green-900/20 text-green-200'
                        }`}>
                          {risk.risk_severity}
                        </span>
                        <span className="font-medium text-sm text-gray-200">{risk.risk_description}</span>
                      </div>
                      <p className="text-sm text-gray-400">{risk.suggested_action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
} 