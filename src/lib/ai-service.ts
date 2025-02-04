import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GOOGLE_AI_KEY
if (!apiKey) {
  throw new Error('GOOGLE_AI_KEY environment variable is not set')
}

console.log('AI Service - Environment variables configured')
const genAI = new GoogleGenerativeAI(apiKey)

interface AnalysisResult {
  summary: string
  risks: Array<{
    severity: 'low' | 'medium' | 'high'
    description: string
    recommendation: string
  }>
  simplifiedText: string
}

interface RiskResponse {
  severity: string
  description: string
  recommendation: string
}

function validateRisks(risks: RiskResponse[]): AnalysisResult['risks'] {
  return risks.map(risk => ({
    severity: (['low', 'medium', 'high'].includes(risk?.severity?.toLowerCase?.())
      ? risk.severity.toLowerCase()
      : 'medium') as 'low' | 'medium' | 'high',
    description: risk?.description || 'Risk description not provided',
    recommendation: risk?.recommendation || 'Consult legal expert'
  }))
}

function extractJSON(text: string): RiskResponse[] {
  try {
    const jsonStart = text.indexOf('[')
    const jsonEnd = text.lastIndexOf(']') + 1
    if (jsonStart === -1 || jsonEnd === 0) throw new Error('No JSON array found')
    return JSON.parse(text.slice(jsonStart, jsonEnd))
  } catch (error) {
    console.error('JSON extraction failed:', text, error)
    throw new Error('Failed to extract valid JSON')
  }
}

export async function analyzeDocument(text: string): Promise<AnalysisResult> {
  console.log('=== AI ANALYSIS START ===')
  console.time('total-ai-time')

  const model = genAI.getGenerativeModel({ 
    model: 'gemini-pro',
    generationConfig: { temperature: 0.2 }
  })

  const summaryPrompt = `Provide a concise summary of this legal document in 2-3 paragraphs: ${text}`
  
  const risksPrompt = `Analyze this legal document and list key risks.
Output MUST be a valid JSON array with EXACTLY this structure:
[
  {
    "severity": "low|medium|high",
    "description": "1-2 sentence risk explanation",
    "recommendation": "1-2 sentence mitigation steps"
  }
]
Document: ${text}
Respond ONLY with the JSON array, no other text.`

  const simplifiedPrompt = `Explain this legal document in simple, plain language, avoiding legal jargon: ${text}`

  try {
    // Run all AI tasks in parallel
    const [summaryResult, risksResult, simplifiedResult] = await Promise.all([
      model.generateContent(summaryPrompt),
      model.generateContent(risksPrompt),
      model.generateContent(simplifiedPrompt)
    ])

    // Process results
    const summary = summaryResult.response.text().trim()
    const risksText = risksResult.response.text().trim()
    const simplifiedText = simplifiedResult.response.text().trim()

    let risks: AnalysisResult['risks'] = []
    try {
      const parsedRisks = extractJSON(risksText)
      risks = validateRisks(parsedRisks)
    } catch (error) {
      console.error('Risk parsing failed:', error)
      risks = []
    }

    console.timeEnd('total-ai-time')
    console.log('=== AI ANALYSIS COMPLETE ===')
    return {
      summary,
      risks,
      simplifiedText
    }
  } catch (error) {
    console.timeEnd('total-ai-time')
    console.error('=== AI ANALYSIS FAILED ===', {
      error,
      type: typeof error,
      message: error instanceof Error ? error.message : 'Unknown error'
    })
    throw error
  }
}

export async function generateChatResponse(
  question: string, 
  documentContent: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `You are a legal assistant. Using only the context of this legal document, answer the following question.
    If you cannot answer based solely on the document content, say so.

    Document content:
    ${documentContent}

    Question: ${question}
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating chat response:', error)
    throw new Error('Failed to generate response')
  }
}