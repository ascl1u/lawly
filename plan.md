MVP Summary for Lawly (AI-Powered Legal Assistant)
Target Audience: individuals seeking accessible legal insights.
Platform: Web app built using Vercel and Next.js.

Tech Stack:
Backend: Supabase for storing user files, summaries, and insights.
AI Models:
Google Gemini for summarization, risk analysis, and simplification of legal jargon.
Document parsing and preprocessing via LangChain.
Frontend: Interactive, user-friendly UI built with Next.js.

Key MVP Features:

1. Document Upload and Parsing:

File upload functionality supporting formats like PDF, Word, and plain text.
Automatic text extraction and segmentation into readable sections.

2. Summarization and Simplification:

Generate concise summaries of legal documents (e.g., contracts, terms of service).
Simplify complex legal jargon into plain, understandable language.

3. Risk Analysis:

Identify potential risks, loopholes, and ambiguous clauses in legal documents.
Provide actionable insights to mitigate identified issues.

4. Contextual Q&A:

Allow users to ask specific questions about uploaded documents.
Provide context-aware answers based on document content.

5. Interactive UI:

Intuitive design for easy document uploads and navigation.
Highlighted annotations for identified risks and key clauses.
Responsive design for both desktop and mobile platforms.

TODO:

Move document processing to a background job service
Design: Client Uploads -> API -> Worker -> Client Polls
Job Queue: Upstash Redis
Job Status Storage: Supabase jobs table
Notifications: Client polling
