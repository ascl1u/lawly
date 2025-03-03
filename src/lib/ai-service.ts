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
}

interface RiskResponse {
  severity: string;
  description: string;
  recommendation: string;
}

function cleanJSONResponse(raw: string): string {
  let cleaned = raw.trim()
  // Remove code fences if present
  if (cleaned.startsWith("```") && cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "")
  }
  return cleaned
}

export async function analyzeDocument(text: string): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  
  // First, get the summary
  const summaryResult = await model.generateContent(
    `Summarize this document in 3 short paragraphs with clear Markdown formatting:
    
  **(Purpose):** What does this document do?  
  **(Key Obligations):** List the top 3 responsibilities for the signer as bullet points.  
  **(Deadlines/Consequences):** Describe any urgent actions or risks.
  
  Use plain language and format your response with Markdown for improved visual hierarchy.
  
  ### Document
  \`\`\`
  ${text}
  \`\`\`
  `
  );  
  
  // Then, get the risks
  const risksResult = await model.generateContent(
    `You are an expert contract reviewer. Analyze the following agreement from the perspective of a signer and identify the key risks. For each risk, return an object with exactly these keys:
  - "severity": a string that must be exactly "low", "medium", or "high"
  - "description": a brief 1-2 sentence explanation of the risk
  - "recommendation": a brief 1-2 sentence suggestion to mitigate the risk
  
  Return your answer as a JSON array containing one or more such objects. 
  
  IMPORTANT:
  - Output ONLY a JSON array. Do not include any additional text, explanation, or markdown formatting.
  - Do not include triple backticks, code fences, or any other formatting characters.
  - The output must be exactly valid JSON that can be parsed with JSON.parse().
  
  Document: ${text}`
  );
  

  const summary = summaryResult.response.text()
  const risksRaw = risksResult.response.text()
  console.log('Raw risks response:', risksRaw) // For debugging
  const cleanedRisks = cleanJSONResponse(risksRaw)
  console.log('Cleaned risks:', cleanedRisks)

  try {
    const risks = JSON.parse(cleanedRisks)
    return {
      summary,
      risks: risks.map((risk: RiskResponse) => ({
        severity: risk.severity.toLowerCase() as 'low' | 'medium' | 'high',
        description: risk.description,
        recommendation: risk.recommendation
      }))
    }
  } catch (error) {
    console.error('JSON parsing failed:', error)
    throw new Error('Failed to parse risk analysis. Please try again.')
  }
}

export async function generateChatResponse(
  question: string, 
  documentContent: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    const prompt = `Act as a contract review assistant. Your task:
    **1. FIRST:** Begin with "I'll suggest considerations, but this isn't legal advice."
    **2. BASE RESPONSE** on the user's document.
    **3. IF UNCLEAR:** Identify gaps and suggest 3 questions to ask the counterparty.
    **4. NEVER** assume jurisdiction/laws.
    
    Please format your response using Markdown with clear headings and bullet lists where appropriate.
    
    ### Document
    \`\`\`
    ${documentContent}
    \`\`\`
    
    ### Question
    \`\`\`
    ${question}
    \`\`\`
    `    

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating chat response:', error)
    throw new Error('Failed to generate response')
  }
}