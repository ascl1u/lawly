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

DONE:

Move document processing to a background job service
Design: Client Uploads -> API -> Worker -> Client Polls
Job Queue: Upstash Redis
Job Status Storage: Supabase jobs table
Notifications: Client polling

TODO:

Color scheme refactor:

Primary Colors:
Navy Blue (#002366)

Represents trust, authority, and professionalism.

Commonly associated with the legal field (e.g., law firm logos, legal documents).

Works well as a primary color for headers, buttons, and accents.

White (#FFFFFF)

Symbolizes clarity, simplicity, and neutrality.

Ideal for backgrounds and text to ensure readability and a clean, modern look.

Secondary Colors:
Gold (#FFD700) or Dark Yellow (#FFC72C)

Represents prestige, quality, and success.

Use sparingly for highlights, icons, or call-to-action buttons (e.g., "Upgrade to Pro").

Adds a touch of elegance without overwhelming the design.

Gray (#F5F5F5 for light gray, #333333 for dark gray)

Light gray for subtle backgrounds or dividers.

Dark gray for secondary text or less prominent elements.

Maintains a professional and balanced look.

Accent Colors:
Forest Green (#228B22) or Emerald Green (#008000)

Represents growth, stability, and reliability.

Use for secondary buttons, success messages, or progress indicators.

Burgundy (#800020) or Deep Red (#8B0000)

Adds a touch of sophistication and seriousness.

Use for warnings, errors, or important notifications.

Color Scheme Summary:
Primary: Navy Blue (#002366), White (#FFFFFF)

Secondary: Gold (#FFD700), Gray (#F5F5F5, #333333)

Accent: Forest Green (#228B22), Burgundy (#800020)

Stripe Integration

Pricing Model:
Free Tier: Limited analyses (1 document per month), use older llm model
Pro Tier (20$/month): More analyses (30 documents per month), SOTA llm model
Pay-As-You-Go (1$/analysis): Pay for each document you analyze, SOTA llm model

Then, plan the migration to @supabase/ssr in this order:
a. Update auth middleware (typescript:middleware.ts startLine: 1 endLine: 16)
b. Update server-side utils (typescript:src/lib/supabase-server.ts startLine: 1 endLine: 8)
c. Update client components (typescript:src/components/user-avatar-menu.tsx startLine: 1 endLine: 72)
d. Update auth hooks (typescript:src/hooks/useAuth.ts startLine: 1 endLine: 33)
e. Update auth routes (typescript:src/app/auth/callback/route.ts startLine: 1 endLine: 44)