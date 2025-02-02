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

export async function analyzeDocument(text: string): Promise<AnalysisResult> {
  console.log('AI Service - Starting document analysis')
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    console.log('AI Service - Model initialized')

    const prompt = `You are a legal document analyzer. Analyze this document and provide a JSON response.
    IMPORTANT: Return ONLY the JSON object, no other text or formatting.

    Document text:
    ${text}

    Response must be a valid JSON object with these exact fields:
    - summary: A brief overview
    - risks: An array of risk objects, each with:
      - severity: exactly "low", "medium", or "high"
      - description: risk description
      - recommendation: mitigation advice
    - simplifiedText: plain language version`

    console.log('AI Service - Sending prompt to Gemini')
    const result = await model.generateContent(prompt)
    console.log('AI Service - Received response from Gemini')
    
    const response = await result.response
    const responseText = response.text().trim()
    console.log('AI Service - Raw response:', responseText)

    // Clean up any potential markdown or code block formatting
    const cleanedText = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^{/m, '{')
      .replace(/}$/m, '}')
      .trim()

    try {
      const analysisResult = JSON.parse(cleanedText)
      
      // Validate the response structure
      if (!analysisResult.summary || !analysisResult.simplifiedText || !Array.isArray(analysisResult.risks)) {
        throw new Error('Invalid response structure from AI')
      }

      console.log('AI Service - Analysis complete')
      return analysisResult
    } catch (parseError) {
      console.error('AI Service - JSON parse error:', {
        originalText: responseText,
        cleanedText,
        error: parseError
      })
      throw new Error('Failed to parse AI response as JSON')
    }
  } catch (error) {
    console.error('AI Service - Error during analysis:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    throw error
  }
} 