import { DocumentDetails } from '@/types'

interface DocumentViewerProps {
  document: DocumentDetails
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  if (!document.content) return null

  // Split content into paragraphs
  const paragraphs = document.content.split('\n').filter(p => p.trim())

  return (
    <div className="relative">
      {/* Original Document */}
      <div className="prose max-w-none">
        {paragraphs.map((paragraph, index) => {
          // Check if this paragraph contains any risks
          const relatedRisks = document.risks?.filter(risk => 
            paragraph.toLowerCase().includes(risk.risk_description?.toLowerCase() || '')
          )

          return (
            <div key={index} className="relative group">
              <p className={`mb-4 ${relatedRisks?.length ? 'bg-yellow-50' : ''}`}>
                {paragraph}
              </p>
              
              {/* Risk Annotations */}
              {(relatedRisks?.length ?? 0) > 0 && (
                <div className="invisible group-hover:visible absolute right-0 translate-x-full px-4 top-0">
                  <div className="bg-white shadow-lg rounded-lg p-4 max-w-sm border-l-4 border-yellow-400">
                    {(relatedRisks || []).map((risk, riskIndex) => (
                      <div key={riskIndex} className="mb-2 last:mb-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            risk.risk_severity === 'high' ? 'bg-red-100 text-red-800' :
                            risk.risk_severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {risk.risk_severity}
                          </span>
                          <span className="font-medium text-sm">{risk.risk_description}</span>
                        </div>
                        <p className="text-sm text-gray-600">{risk.suggested_action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 