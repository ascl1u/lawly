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

For Lawly’s pricing model (Free, Pro, Pay-As-You-Go), Stripe Billing is the best fit. It supports recurring subscriptions (Pro Tier) and usage-based pricing (Pay-As-You-Go), while also handling free trials and metered billing. Here's how to structure it:

Recommended Integration: Stripe Billing + Checkout
1. Pro Tier ($20/month)
Use Case: Recurring subscription for 30 documents/month.

Setup:

Create a subscription product in Stripe with a $20/month price.

Track document usage (e.g., count user’s document analyses) and enforce limits (30 docs/month) in your app’s backend.

Use Stripe Checkout to onboard users to the Pro plan.

2. Pay-As-You-Go ($1/analysis)
Use Case: Charge per document analyzed (no monthly commitment).

Setup:

Create a metered subscription with a $1/unit price.

Report usage to Stripe via the API whenever a user analyzes a document:

javascript
Copy
// Example: Report 1 unit (document) to Stripe
await stripe.subscriptionItems.createUsageRecord(
  'si_12345', // Subscription Item ID
  { quantity: 1, timestamp: 'now' }
);
Users are billed at the end of their billing cycle for total usage (e.g., 10 docs = $10).

3. Free Tier (1 document/month)
Use Case: Limited access without payment.

Setup:

Track document usage in your app’s database (no Stripe integration needed).

When the user exceeds 1 document, prompt them to upgrade via Stripe Checkout.

Implementation Steps
A. Backend (Subscription Logic)
Track Usage:

Store user document counts in your database.

For Pay-As-You-Go users, call Stripe’s API to report usage after each analysis.

Enforce Limits:

For Pro users, block document uploads after 30/month (or upsell to Pay-As-You-Go).

For Free users, block after 1 document and prompt upgrade.

B. Frontend (Payment Flow)
Use Stripe Checkout to handle upgrades:

javascript
Copy
// Redirect to Stripe Checkout for Pro Tier
const handleProCheckout = async () => {
  const response = await fetch('/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ priceId: 'price_PRO_TIER_ID' }),
  });
  const { id } = await response.json();
  const stripe = await loadStripe(STRIPE_PUBLIC_KEY);
  stripe.redirectToCheckout({ sessionId: id });
};

// Redirect for Pay-As-You-Go
const handlePaygCheckout = async () => {
  const response = await fetch('/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ priceId: 'price_PAYG_ID' }),
  });
  // ... same as above ...
};
C. Webhooks (Critical for Usage Tracking)
Listen for subscription events to grant/revoke access:

javascript
Copy
// Handle subscription updates (e.g., Pro Tier canceled)
app.post('/stripe-webhook', async (req, res) => {
  const event = req.body;
  switch (event.type) {
    case 'customer.subscription.deleted':
      const userId = event.data.object.metadata.userId;
      await downgradeUserToFreeTier(userId); // Revoke Pro access
      break;
    case 'invoice.paid':
      // Grant access to Pro/Pay-As-You-Go
      break;
  }
  res.sendStatus(200);
});
Why This Works for Lawly
Flexibility: Stripe Billing handles both recurring subscriptions and usage-based pricing.

Scalability: Metered billing automates charges for Pay-As-You-Go.

Speed: Stripe Checkout lets you launch in days, not weeks.

Compliance: Stripe handles SCA, taxes, and fraud detection (Radar).

Cost Optimization Tip
Use Stripe’s Tax feature to automatically calculate VAT/GST for international users.

Enable prorations so users who upgrade/downgrade mid-cycle pay fair amounts.

Final Architecture
Copy
Lawly App → Tracks Document Counts → Reports Usage to Stripe
                     ↑
Stripe Checkout (Pro/Pay-As-You-Go) ← Triggers → Stripe Webhooks
Start with Stripe Checkout + Billing, and expand to a custom UI with Stripe Elements later if needed.