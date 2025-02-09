'use client'

import { PolicyContainer } from '@/components/ui/PolicyContainer'

export default function PrivacyPolicy() {
  return (
    <PolicyContainer 
      title="Privacy Policy" 
      lastUpdated="February 8, 2025"
    >
      <section>
        <h2>1. Introduction</h2>
        <p>Lawly values your privacy. This Privacy Policy explains how we collect, use, and share information when you use our web application (App). By using the App, you consent to the data practices described in this Privacy Policy.</p>
      </section>

      <section className="mt-8">
        <h2>2. Information We Collect</h2>
        <h3>2.1. Personal Information</h3>
        <p>We collect the following personal information when you sign up or interact with our services:</p>
        <ul>
          <li>Account Information: Name, email address, and password.</li>
          <li>Usage Data: IP address, browser type, and interactions with the App.</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2>3. How We Use Your Information</h2>
        <h3>3.1. Personal Information</h3>
        <p>We use your personal information to provide and improve our services, communicate with you, and protect our rights.</p>
      </section>

      <section className="mt-8">
        <h2>4. Information Sharing</h2>
        <h3>4.1. Personal Information</h3>
        <p>We may share your personal information with third parties for their marketing purposes or to provide services on our behalf.</p>
      </section>

      <section className="mt-8">
        <h2>5. Data Security</h2>
        <p>We take reasonable measures to protect your information from unauthorized access or disclosure.</p>
      </section>

      <section className="mt-8">
        <h2>6. Your Choices</h2>
        <h3>6.1. Account Information</h3>
        <p>You can update your account information in the App settings.</p>
      </section>

      <section className="mt-8">
        <h2>8. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. If we make material changes, we will notify you by email or through the App.</p>
      </section>

      <section className="mt-8">
        <h2>9. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@lawly.com">privacy@lawly.com</a>.</p>
      </section>
    </PolicyContainer>
  )
} 