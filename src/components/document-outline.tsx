import type { DocumentDetails } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface DocumentOutlineProps {
  document: DocumentDetails
}

export function DocumentOutline({ document }: DocumentOutlineProps) {
  const [sections, setSections] = useState<Array<{
    title: string
    riskCount: number
  }>>([])

  useEffect(() => {
    if (!document.content || !document.risks) return

    // Split content into sections (matching DocumentViewer logic)
    const lines = document.content.split("\n")
    const parsedSections: { title: string; content: string }[] = []
    let currentSection = { title: "Introduction", content: "" }

    lines.forEach(line => {
      if (line.startsWith("#") || line.match(/^[A-Z][A-Za-z\s]{2,}:$/)) {
        if (currentSection.content) {
          parsedSections.push({ ...currentSection })
        }
        currentSection = {
          title: line.replace(/#/g, "").trim(),
          content: ""
        }
      } else {
        currentSection.content += line + "\n"
      }
    })

    if (currentSection.content) {
      parsedSections.push(currentSection)
    }

    // Count risks per section
    const sectionsWithRisks = parsedSections.map(section => {
      const riskCount = document.risks?.filter(risk => 
        section.content.toLowerCase().includes(risk.risk_description?.toLowerCase() || "")
      ).length || 0

      return {
        title: section.title,
        riskCount
      }
    })

    setSections(sectionsWithRisks)
  }, [document.content, document.risks])

  return (
    <ScrollArea className="h-full w-64 bg-gray-900 p-4">
      <h2 className="text-lg font-semibold mb-4 text-gray-200">Document Outline</h2>
      <div className="space-y-2">
        {sections.map((section, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              const element = window.document.getElementById(`section-${index}`)
              element?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            <span className="truncate">{section.title}</span>
            {section.riskCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-red-600 rounded-full">
                {section.riskCount}
              </span>
            )}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}

