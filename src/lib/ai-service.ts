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
  severity: string;
  description: string;
  recommendation: string;
}

export async function analyzeDocument(text: string): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  
  // First, get the summary
  const summaryResult = await model.generateContent(
    `Summarize this document in 3 short paragraphs:
    1. Purpose: What does this document do?
    2. Key obligations: List the top 3 responsibilities for the signer.
    3. Deadlines/consequences: Any urgent actions or risks?
    Use plain language. Document: ${text}`
  );
  
  // Then, get the risks
  const risksResult = await model.generateContent(
    `Analyze this agreement from the perspective of someone being asked to sign it and list the key risks. For each risk, provide:
    - Severity (must be exactly "low", "medium", or "high")
    - Description (brief explanation of the risk)
    - Recommendation (how to address it)
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
  )
  
  // Finally, get simplified text
  const simplifiedResult = await model.generateContent(
    `Rewrite this legal document section as if explaining it to a friend:
    1. Start with "This basically means..."
    2. Use a real-life analogy
    3. Highlight what's unusual about this clause
    4. End with "Watch out for..." 
    Original text: ${text}`
  )

  const summary = summaryResult.response.text()
  const risks = JSON.parse(risksResult.response.text())
  const simplifiedText = simplifiedResult.response.text()

  return {
    summary,
    risks: risks.map((risk: RiskResponse) => ({
      severity: risk.severity.toLowerCase() as 'low' | 'medium' | 'high',
      description: risk.description,
      recommendation: risk.recommendation
    })),
    simplifiedText
  }
}

export async function generateChatResponse(
  question: string, 
  documentContent: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `You're helping someone review a contract they're nervous about signing. 
    Answer their question strictly using the document text below. If unclear:
    - Explain why the document doesn't address this
    - Suggest 3 questions they should ask the other party

    Document: ${documentContent}
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