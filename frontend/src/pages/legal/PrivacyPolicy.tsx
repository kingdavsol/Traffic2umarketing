import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: February 25, 2026</p>
        </div>

        <div className="legal-content">

          <section>
            <h2>1. Introduction</h2>
            <p>
              QuickSell ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your information when you use our
              AI-powered multi-marketplace listing service available at quicksell.monster and our mobile
              applications ("Service").
            </p>
            <p>
              By using our Service, you agree to the collection and use of information in accordance with
              this policy. If you do not agree, please do not use our Service.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>

            <h3>2.1 Account &amp; Identity Data</h3>
            <ul>
              <li><strong>Email address</strong> — used for account creation, authentication, and communications</li>
              <li><strong>Username / display name</strong> — shown on your profile and listings</li>
              <li><strong>Password</strong> — stored as a one-way hash; we never store it in plain text</li>
            </ul>

            <h3>2.2 Listing &amp; Content Data</h3>
            <ul>
              <li><strong>Photos you upload</strong> — product images submitted for AI analysis and marketplace posting</li>
              <li><strong>Listing details</strong> — titles, descriptions, prices, categories, and condition notes you provide or that our AI generates</li>
              <li><strong>Marketplace connections</strong> — OAuth tokens and API credentials for connected marketplaces (stored encrypted)</li>
            </ul>

            <h3>2.3 Usage &amp; Technical Data</h3>
            <ul>
              <li>Device type, operating system, browser type and version</li>
              <li>IP address and approximate location (country/region)</li>
              <li>Pages visited, features used, session duration</li>
              <li>Error logs and performance data</li>
            </ul>

            <h3>2.4 Payment Data</h3>
            <p>
              Payment transactions are processed by third-party payment processors (e.g., Stripe). We receive
              a transaction reference and subscription status, but we do not store full card numbers or bank
              account details.
            </p>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use your personal data to:</p>
            <ul>
              <li><strong>Provide the Service</strong> — create and manage your account, process listings, and post to marketplaces</li>
              <li><strong>AI Photo Analysis</strong> — your uploaded photos are sent to Anthropic (Claude AI) to generate product titles, descriptions, categories, and suggested prices. See Section 5.</li>
              <li><strong>Marketplace Posting</strong> — listing data (title, description, photos, price) is transmitted to the marketplaces you connect to</li>
              <li><strong>Authentication &amp; Security</strong> — verify identity, prevent fraud, detect abuse</li>
              <li><strong>Service Improvement</strong> — analyze usage patterns to improve features and fix bugs</li>
              <li><strong>Communications</strong> — send account notices, service updates, and (with consent) marketing emails</li>
              <li><strong>Legal compliance</strong> — meet regulatory obligations and respond to lawful requests</li>
            </ul>
          </section>

          <section>
            <h2>4. Legal Basis for Processing (GDPR — EU/EEA Users)</h2>
            <p>If you are located in the EU or EEA, we process your personal data under the following lawful bases:</p>
            <ul>
              <li><strong>Contract performance (Art. 6(1)(b))</strong> — processing necessary to provide the Service you signed up for</li>
              <li><strong>Legitimate interests (Art. 6(1)(f))</strong> — fraud prevention, security, service improvement, and analytics</li>
              <li><strong>Consent (Art. 6(1)(a))</strong> — marketing communications and optional analytics cookies (you may withdraw at any time)</li>
              <li><strong>Legal obligation (Art. 6(1)(c))</strong> — compliance with applicable law</li>
            </ul>
          </section>

          <section>
            <h2>5. Third-Party Services &amp; Data Sharing</h2>
            <p>We share your data only as described below. We <strong>never sell</strong> your personal information.</p>

            <h3>5.1 Anthropic (AI Processing)</h3>
            <p>
              Photos and listing metadata you submit are sent to Anthropic's Claude API for AI analysis.
              Anthropic processes this data according to their{' '}
              <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>. We do not permit Anthropic to use your data to train their models under our API agreement.
            </p>

            <h3>5.2 Marketplace APIs</h3>
            <p>
              When you post a listing, the relevant listing data (title, description, photos, price, category)
              is sent to the marketplace(s) you have connected (e.g., eBay, Facebook Marketplace, Depop, etc.).
              Each marketplace's own privacy policy governs their use of that data.
            </p>

            <h3>5.3 Payment Processors</h3>
            <p>
              Subscription payments are handled by third-party processors (Stripe). Your payment details
              are governed by their privacy policies. We receive only a payment confirmation and subscription status.
            </p>

            <h3>5.4 Analytics</h3>
            <p>
              We use PostHog for product analytics. Data is anonymized and aggregated where possible.
              Analytics help us understand feature usage and improve the product.
            </p>

            <h3>5.5 Legal Disclosure</h3>
            <p>
              We may disclose your data to law enforcement or regulatory authorities when required by law,
              court order, or to protect the rights, property, or safety of QuickSell, our users, or the public.
            </p>
          </section>

          <section>
            <h2>6. Your Rights</h2>

            <h3>6.1 GDPR Rights (EU/EEA Users)</h3>
            <p>Under the General Data Protection Regulation, you have the right to:</p>
            <ul>
              <li><strong>Access (Art. 15)</strong> — request a copy of all personal data we hold about you</li>
              <li><strong>Rectification (Art. 16)</strong> — request correction of inaccurate or incomplete data</li>
              <li><strong>Erasure / "Right to be Forgotten" (Art. 17)</strong> — request deletion of your personal data</li>
              <li><strong>Data Portability (Art. 20)</strong> — receive your data in a structured, machine-readable format</li>
              <li><strong>Restriction of Processing (Art. 18)</strong> — ask us to limit how we process your data in certain circumstances</li>
              <li><strong>Object to Processing (Art. 21)</strong> — object to processing based on legitimate interests or for direct marketing</li>
              <li><strong>Withdraw Consent (Art. 7(3))</strong> — withdraw consent at any time where processing is consent-based</li>
              <li><strong>Lodge a Complaint</strong> — file a complaint with your national supervisory authority (e.g., your country's Data Protection Authority or the Irish DPC)</li>
            </ul>
            <p>
              To exercise any of these rights, email <a href="mailto:privacy@quicksell.monster">privacy@quicksell.monster</a>.
              We will respond within 30 days.
            </p>

            <h3>6.2 CCPA Rights (California Residents)</h3>
            <p>Under the California Consumer Privacy Act (CCPA), you have the right to:</p>
            <ul>
              <li><strong>Right to Know</strong> — request disclosure of the categories and specific pieces of personal information we collect, use, and share</li>
              <li><strong>Right to Delete</strong> — request deletion of your personal information (subject to certain exceptions)</li>
              <li><strong>Right to Opt-Out of Sale</strong> — we do <strong>not</strong> sell personal information; this right does not apply</li>
              <li><strong>Right to Non-Discrimination</strong> — we will not discriminate against you for exercising your CCPA rights</li>
            </ul>
            <p>
              To submit a CCPA request, contact <a href="mailto:privacy@quicksell.monster">privacy@quicksell.monster</a>{' '}
              with the subject line "CCPA Request".
            </p>
          </section>

          <section>
            <h2>7. Google Play Data Safety Disclosure</h2>
            <p>As required by Google Play policy, here is a summary of data practices for our Android app:</p>
            <ul>
              <li><strong>Data collected:</strong> Email address, username, photos (user-uploaded), listing content, usage data</li>
              <li><strong>Data sharing:</strong> Listing data and photos are shared with third-party marketplaces at the user's explicit request. Photos are sent to Anthropic's Claude API for AI analysis.</li>
              <li><strong>Security:</strong> All data transmitted over encrypted connections (HTTPS/TLS 1.2+)</li>
              <li><strong>Data deletion:</strong> Users can request full account and data deletion at any time via the app or by emailing privacy@quicksell.monster</li>
              <li><strong>No ads:</strong> We do not serve advertisements or share data with ad networks</li>
              <li><strong>No data selling:</strong> We do not sell personal data</li>
            </ul>
          </section>

          <section>
            <h2>8. Apple App Store Privacy Labels</h2>
            <p>Our iOS app collects the following categories of data (as disclosed in the App Store):</p>
            <ul>
              <li><strong>Contact Info:</strong> Email address (linked to your identity, used for account management)</li>
              <li><strong>User Content:</strong> Photos and product listings (linked to your identity, used to provide core functionality)</li>
              <li><strong>Identifiers:</strong> User ID (linked to your identity, used for authentication)</li>
              <li><strong>Usage Data:</strong> App interaction data (not linked to your identity, used for analytics)</li>
            </ul>
            <p>Data is not used for tracking across third-party apps or websites.</p>
          </section>

          <section>
            <h2>9. Data Retention</h2>
            <p>We retain your data as follows:</p>
            <ul>
              <li><strong>Account data</strong> — retained while your account is active</li>
              <li><strong>Listing data &amp; photos</strong> — retained until you delete them or close your account</li>
              <li><strong>Payment records</strong> — retained for 7 years for tax and accounting purposes</li>
              <li><strong>Backup copies</strong> — deleted within 90 days after account deletion</li>
              <li><strong>Anonymized analytics</strong> — may be retained indefinitely in aggregate, non-identifiable form</li>
            </ul>
          </section>

          <section>
            <h2>10. Security</h2>
            <p>We implement industry-standard security measures including:</p>
            <ul>
              <li>TLS 1.2+ encryption for all data in transit</li>
              <li>AES-256 encryption for sensitive data at rest (marketplace credentials, tokens)</li>
              <li>Bcrypt hashing for passwords</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls with principle of least privilege</li>
            </ul>
            <p>
              No method of transmission over the Internet is 100% secure. In the event of a data breach
              affecting your rights, we will notify you and relevant authorities as required by law.
            </p>
          </section>

          <section>
            <h2>11. International Data Transfers</h2>
            <p>
              Our servers are located in the United States and European Union. If you are in the EU/EEA,
              your data may be transferred to and processed in the US. Where we transfer data outside the
              EEA, we use Standard Contractual Clauses (SCCs) approved by the European Commission, or
              other lawful transfer mechanisms to ensure adequate protection.
            </p>
          </section>

          <section>
            <h2>12. Children's Privacy</h2>
            <p>
              QuickSell is not directed to children under the age of 13 (or 16 in certain EU member states).
              We do not knowingly collect personal information from children under these ages. If you believe
              we have inadvertently collected data from a child, please contact us immediately at{' '}
              <a href="mailto:privacy@quicksell.monster">privacy@quicksell.monster</a> and we will delete it.
            </p>
          </section>

          <section>
            <h2>13. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management. We use analytics cookies
              (with your consent) to understand how our Service is used. You can manage cookie preferences
              in your browser settings. See our{' '}
              <Link to="/legal/cookie-policy">Cookie Policy</Link> for full details.
            </p>
          </section>

          <section>
            <h2>14. EU Representative</h2>
            <p>
              As required under GDPR Art. 27, our EU representative for data protection matters can be
              reached at: <a href="mailto:privacy@quicksell.monster">privacy@quicksell.monster</a>
            </p>
            <p>
              You also have the right to lodge a complaint with your local Data Protection Authority.
              Find your DPA at:{' '}
              <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer">
                edpb.europa.eu
              </a>
            </p>
          </section>

          <section>
            <h2>15. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes
              by email and/or by posting a prominent notice on our website at least 14 days before changes
              take effect. Your continued use of the Service after the effective date constitutes acceptance
              of the updated policy.
            </p>
          </section>

          <section>
            <h2>16. Contact Us</h2>
            <p>For privacy questions, requests, or complaints:</p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:privacy@quicksell.monster">privacy@quicksell.monster</a></li>
              <li><strong>Data Disclosure:</strong> <Link to="/disclosure">View full data disclosure</Link></li>
              <li><strong>EU Privacy Rights:</strong> <a href="#gdpr-rights">See Section 6.1 above</a></li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
