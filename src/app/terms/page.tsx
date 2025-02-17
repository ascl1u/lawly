'use client'

import { PolicyContainer } from '@/components/policy-container'

export default function TermsOfService() {
  return (
    <PolicyContainer 
      title="Terms of Service" 
      lastUpdated="February 8, 2025"
    >
      <section>
        <h2>1. Introduction</h2>
        <p>Welcome to Lawly. Lawly is an AI-powered legal assistant that provides document summarization, risk analysis, and legal language simplification services. By accessing or using our web application (App), you agree to comply with these Terms of Service. If you do not agree, please do not use the App.</p>
      </section>


      <section className="mt-8">
        <h2>2. Not a Substitute for a Lawyer</h2>
        <p>Lawly is not a law firm, attorney, or substitute for a licensed legal professional. The information and responses provided by Lawly are for informational purposes only and do not constitute legal advice.</p>
        <p className="mt-4">You acknowledge that:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Lawly cannot and does not provide legally binding advice.</li>
          <li>Any decisions you make based on Lawly&apos;s outputs are your responsibility.</li>
          <li>You should consult a qualified attorney for legal matters.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>3. No Liability for AI-Generated Content</h2>
        <p>We do not guarantee the accuracy, completeness, or reliability of any AI-generated responses. You agree not to hold Lawly or its creators liable for any outcomes resulting from the use of the App.</p>
        <p className="mt-4">By using Lawly, you understand and accept that:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Lawly&apos;s responses may contain errors, outdated information, or misinterpretations.</li>
          <li>We are not responsible for any legal, financial, or personal consequences resulting from the use of Lawly.</li>
          <li>Use Lawly at your own risk.</li>
        </ul>
      </section>

      {/* Sections 4-9 */}
      <section className="mt-8">
        <h2>4. Privacy and Data Security</h2>
        <p>Your data is private and will not be shared with third parties. We do not sell, trade, or disclose user data to advertisers, law firms, or any other entities.</p>
      </section>

      <section className="mt-8">
        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 mt-2">
          <li>Use Lawly for illegal activities.</li>
          <li>Upload confidential or privileged legal documents.</li>
          <li>Misrepresent Lawly&apos;s AI-generated responses as official legal advice.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>6. Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, Lawly and its creators shall not be liable for any damages (direct, indirect, incidental, or consequential) arising from your use of the App.</p>
      </section>

      <section className="mt-8">
        <h2>7. Governing Law</h2>
        <p>These Terms are governed by the laws of the State of California, without regard to conflict of laws principles.</p>
      </section>

      <section className="mt-8">
        <h2>8. Changes to Terms</h2>
        <p>We may update these Terms from time to time. Your continued use of Lawly after updates constitutes acceptance of the new Terms.</p>
      </section>

      <section className="mt-8">
        <h2>9. Contact Us</h2>
        <p>If you have any questions, contact us at <a href="mailto:support@lawly.com" className="text-blue-400 hover:text-blue-300">support@lawly.com</a>.</p>
      </section>
    </PolicyContainer>
  )
} 