import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const TermsOfService: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Terms of Service</h1>
          <p className="last-updated">Last Updated: February 25, 2026</p>
        </div>

        <div className="legal-content">

          <section>
            <h2>1. Agreement to Terms</h2>
            <p>
              By downloading, installing, or using QuickSell ("Service") — including our website at
              quicksell.monster and our iOS and Android mobile applications — you agree to be bound by
              these Terms of Service ("Terms"). If you do not agree, do not use the Service.
            </p>
            <p>
              These Terms form a legally binding agreement between you and QuickSell. Please read them carefully.
            </p>
          </section>

          <section>
            <h2>2. Service Description</h2>
            <p>
              QuickSell is an AI-powered multi-marketplace listing tool that allows users to:
            </p>
            <ul>
              <li>Upload photos of items and receive AI-generated titles, descriptions, categories, and pricing suggestions (powered by Anthropic Claude)</li>
              <li>Post product listings to multiple online marketplaces simultaneously</li>
              <li>Manage, edit, and track listings across connected platforms</li>
              <li>Connect to supported third-party marketplace accounts via OAuth and API integrations</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time
              with reasonable notice.
            </p>
          </section>

          <section>
            <h2>3. Eligibility</h2>
            <ul>
              <li>You must be at least 13 years old to use the Service (16 in EU member states that apply this threshold)</li>
              <li>You must have the legal capacity to enter into binding contracts in your jurisdiction</li>
              <li>You may not use the Service if you are barred from doing so by applicable law</li>
              <li>If using on behalf of a business, you represent that you have authority to bind that business</li>
            </ul>
          </section>

          <section>
            <h2>4. User Accounts</h2>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate, current, and complete information when creating your account</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password confidential and secure</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately at <a href="mailto:support@quicksell.monster">support@quicksell.monster</a> of any unauthorized access</li>
            </ul>
            <p>We reserve the right to suspend or terminate accounts that provide false information or violate these Terms.</p>
          </section>

          <section>
            <h2>5. User Responsibilities &amp; Listing Standards</h2>
            <p>You are solely responsible for all listings you create and post. You agree to:</p>
            <ul>
              <li>Provide accurate, truthful, and complete descriptions of your items</li>
              <li>Only list items you own or have legal authority to sell</li>
              <li>Price items fairly and honor the prices in your listings</li>
              <li>Review all AI-generated content before posting — AI may contain errors, inaccuracies, or inappropriate suggestions</li>
              <li>Comply with the terms of service, policies, and guidelines of each marketplace you post to</li>
              <li>Comply with all applicable laws regarding the sale of goods, including consumer protection laws</li>
            </ul>
          </section>

          <section>
            <h2>6. Prohibited Uses</h2>
            <p>You may not use QuickSell to:</p>
            <ul>
              <li>List, sell, or promote illegal, stolen, counterfeit, or fraudulent items</li>
              <li>List items that are prohibited by applicable law or any connected marketplace's policies</li>
              <li>Post misleading, deceptive, or false product listings</li>
              <li>Spam marketplaces with duplicate, low-quality, or artificially inflated listings</li>
              <li>Harvest or scrape data from third-party marketplaces in violation of their terms</li>
              <li>Attempt to circumvent subscription limits or security measures</li>
              <li>Use the Service to harass, harm, or defraud other users or third parties</li>
              <li>Reverse engineer, decompile, or attempt to extract source code from our Service</li>
              <li>Use the Service in a way that violates any applicable local, national, or international law or regulation</li>
            </ul>
            <p>Violations may result in immediate account suspension without refund.</p>
          </section>

          <section>
            <h2>7. Subscription &amp; Payment</h2>
            <p>
              QuickSell offers free and paid subscription tiers. Paid plans are billed on a recurring basis
              (monthly or annually) and renew automatically unless cancelled.
            </p>
            <ul>
              <li><strong>Billing:</strong> You authorize us (or our payment processor) to charge your payment method on each billing cycle</li>
              <li><strong>Price changes:</strong> We will give you at least 30 days' notice before changing subscription prices</li>
              <li><strong>Cancellation:</strong> You may cancel at any time; access continues until the end of the current billing period</li>
              <li><strong>Refunds:</strong> Except where required by law, subscription fees are non-refundable for partial billing periods</li>
            </ul>

            <h3>7.1 EU Consumer Withdrawal Right</h3>
            <p>
              If you are a consumer located in the EU or EEA, you have the right to withdraw from a purchase
              within <strong>14 days</strong> of entering into the contract ("cooling-off period"), unless you
              have already begun using the paid features (in which case, by starting use you expressly consent
              to immediate performance and acknowledge that the right of withdrawal is lost upon commencement
              of the service).
            </p>
            <p>
              To exercise your right of withdrawal, contact us at{' '}
              <a href="mailto:legal@quicksell.monster">legal@quicksell.monster</a> before the 14-day period expires.
            </p>
            <p>
              EU consumers may also use the European Commission's Online Dispute Resolution platform:{' '}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
                ec.europa.eu/consumers/odr/
              </a>
            </p>
          </section>

          <section>
            <h2>8. AI-Generated Content</h2>
            <p>
              QuickSell uses Anthropic Claude AI to analyze photos and generate product descriptions,
              titles, categories, and pricing suggestions. You acknowledge that:
            </p>
            <ul>
              <li>AI-generated content may contain inaccuracies, errors, or inappropriate content</li>
              <li>You are responsible for reviewing, editing, and approving all AI-generated content before posting</li>
              <li>QuickSell makes no warranties regarding the accuracy, completeness, or fitness of AI-generated content</li>
              <li>QuickSell is not liable for any loss, damage, or marketplace penalties arising from AI-generated content you post</li>
            </ul>
          </section>

          <section>
            <h2>9. Intellectual Property</h2>

            <h3>9.1 Your Content</h3>
            <p>
              You retain full ownership of photos and content you upload ("User Content"). By using the Service,
              you grant QuickSell a limited, non-exclusive, royalty-free, worldwide license to store, process,
              transmit, and display your User Content solely for the purpose of providing the Service (including
              AI analysis and marketplace posting). This license ends when you delete your content or close
              your account.
            </p>

            <h3>9.2 QuickSell Intellectual Property</h3>
            <p>
              The QuickSell software, website, mobile apps, branding, logos, and all related intellectual
              property are owned by QuickSell or our licensors. You may not copy, reproduce, distribute,
              or create derivative works from any QuickSell property without our express written permission.
            </p>

            <h3>9.3 Feedback</h3>
            <p>
              If you submit suggestions, feedback, or ideas about the Service, you grant us the right to
              use such feedback without obligation, compensation, or attribution to you.
            </p>
          </section>

          <section>
            <h2>10. Third-Party Services &amp; Marketplaces</h2>
            <p>
              QuickSell integrates with third-party marketplaces and services (eBay, Facebook Marketplace,
              Depop, etc.). These third-party services have their own terms of service and privacy policies.
              You agree that:
            </p>
            <ul>
              <li>You will comply with the terms of each marketplace you connect to</li>
              <li>QuickSell is not responsible for the actions, policies, or outages of third-party platforms</li>
              <li>QuickSell cannot guarantee that third-party APIs will remain available or unchanged</li>
              <li>Marketplace account suspensions or bans resulting from your listing activity are not QuickSell's responsibility</li>
            </ul>
          </section>

          <section>
            <h2>11. Disclaimers</h2>
            <p>
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
              PURPOSE, NON-INFRINGEMENT, OR UNINTERRUPTED AVAILABILITY.
            </p>
            <p>
              We do not warrant that the Service will be error-free, that defects will be corrected, or that
              AI-generated content will be accurate or suitable for your needs.
            </p>
          </section>

          <section>
            <h2>12. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, QUICKSELL AND ITS OFFICERS, DIRECTORS,
              EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
              OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS, LOST SALES, DATA LOSS, OR MARKETPLACE PENALTIES,
              ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p>
              OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS SHALL NOT EXCEED THE GREATER OF (A) THE
              AMOUNT YOU PAID US IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) USD $100.
            </p>
            <p>
              <strong>EU/UK consumers:</strong> Nothing in these Terms limits our liability for death, personal
              injury, or fraud caused by our negligence, or any liability that cannot be excluded under
              applicable consumer protection law.
            </p>
          </section>

          <section>
            <h2>13. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless QuickSell from any claims, damages, losses, and expenses
              (including reasonable legal fees) arising from: (a) your use of the Service; (b) your listings or
              content; (c) your violation of these Terms; or (d) your violation of any third-party rights.
            </p>
          </section>

          <section>
            <h2>14. Termination</h2>
            <p>
              We may suspend or terminate your account at any time, with or without notice, for violations of
              these Terms or for any other reason at our discretion. You may close your account at any time
              via account settings or by contacting <a href="mailto:support@quicksell.monster">support@quicksell.monster</a>.
            </p>
            <p>
              Upon termination, your right to use the Service ceases immediately. Sections 9, 11, 12, 13, 15,
              and 16 survive termination.
            </p>
          </section>

          <section>
            <h2>15. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms are governed by the laws of the State of Delaware, United States, without regard
              to conflict of law principles.
            </p>
            <p>
              <strong>EU/EEA consumers:</strong> The above choice of law does not deprive you of the
              protection of mandatory provisions of consumer protection law in your country of residence.
            </p>
          </section>

          <section>
            <h2>16. Dispute Resolution &amp; Arbitration</h2>

            <h3>16.1 Informal Resolution</h3>
            <p>
              Before initiating formal proceedings, you agree to contact us at{' '}
              <a href="mailto:legal@quicksell.monster">legal@quicksell.monster</a> and attempt to resolve
              the dispute informally for at least 30 days.
            </p>

            <h3>16.2 Binding Arbitration (US Users)</h3>
            <p>
              For users in the United States, disputes not resolved informally shall be submitted to binding
              arbitration under the rules of the American Arbitration Association (AAA), conducted individually
              (not as a class action). You waive your right to a jury trial and to participate in class action
              proceedings, to the extent permitted by law.
            </p>

            <h3>16.3 Arbitration Opt-Out</h3>
            <p>
              You may opt out of the arbitration agreement by sending written notice to{' '}
              <a href="mailto:legal@quicksell.monster">legal@quicksell.monster</a> within <strong>30 days</strong>{' '}
              of first accepting these Terms. Your notice must include your name, email, and a statement that
              you opt out of arbitration.
            </p>

            <h3>16.4 EU Dispute Resolution</h3>
            <p>
              EU consumers may use the European Commission's Online Dispute Resolution (ODR) platform:{' '}
              <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">
                ec.europa.eu/consumers/odr/
              </a>
            </p>
          </section>

          <section>
            <h2>17. Apple App Store — Additional Terms (EULA)</h2>
            <p>
              If you downloaded QuickSell from the Apple App Store, the following additional terms apply:
            </p>
            <ul>
              <li>
                <strong>Acknowledgement:</strong> These Terms are between you and QuickSell only, not Apple.
                Apple has no responsibility for the App or its content.
              </li>
              <li>
                <strong>Scope of License:</strong> Your license to use the App is limited to a non-transferable
                license to use the App on Apple-branded products you own or control, as permitted by the App Store
                Usage Rules.
              </li>
              <li>
                <strong>Maintenance &amp; Support:</strong> QuickSell, not Apple, is responsible for providing
                maintenance and support for the App. Apple has no obligation whatsoever to furnish any
                maintenance and support services.
              </li>
              <li>
                <strong>Warranty:</strong> In the event the App fails to conform to any applicable warranty,
                you may notify Apple and Apple will refund the purchase price (if any). To the maximum extent
                permitted by law, Apple has no other warranty obligation. Any other claims, losses, liabilities,
                damages, costs, or expenses attributable to any failure to conform to any warranty are governed
                by these Terms.
              </li>
              <li>
                <strong>Product Claims:</strong> QuickSell, not Apple, is responsible for addressing any claims
                by you or any third party relating to the App or your possession and/or use of the App, including:
                (a) product liability claims; (b) claims that the App fails to conform to applicable legal or
                regulatory requirements; (c) claims arising under consumer protection or similar legislation.
              </li>
              <li>
                <strong>Intellectual Property Rights:</strong> In the event of any third-party claim that the
                App or your possession and use infringes a third party's intellectual property rights, QuickSell
                (not Apple) will be responsible for investigation, defense, settlement, and discharge of such claim.
              </li>
              <li>
                <strong>Legal Compliance:</strong> You represent that (a) you are not in a country subject to
                a U.S. Government embargo or designated as a "terrorist supporting" country; and (b) you are
                not on any U.S. Government list of prohibited or restricted parties.
              </li>
              <li>
                <strong>Third-Party Beneficiary:</strong> Apple and Apple's subsidiaries are third-party
                beneficiaries of these Terms. Upon your acceptance, Apple will have the right (and is deemed
                to have accepted the right) to enforce these Terms as a third-party beneficiary.
              </li>
            </ul>
          </section>

          <section>
            <h2>18. Google Play — Compliance</h2>
            <p>
              If you downloaded QuickSell from Google Play, your use is also subject to the{' '}
              <a href="https://play.google.com/about/developer-distribution-agreement.html" target="_blank" rel="noopener noreferrer">
                Google Play Developer Distribution Agreement
              </a>. QuickSell complies with Google Play's Developer Program Policies, including policies
              on user data, permissions, and content.
            </p>
          </section>

          <section>
            <h2>19. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. For material changes, we will provide
              at least 14 days' notice via email or in-app notification. Your continued use of the Service
              after the effective date constitutes acceptance of the updated Terms.
            </p>
            <p>
              EU consumers: if you do not accept the new Terms, you may terminate your account before the
              changes take effect without penalty.
            </p>
          </section>

          <section>
            <h2>20. General</h2>
            <ul>
              <li><strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and QuickSell</li>
              <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions continue in full force</li>
              <li><strong>Waiver:</strong> Failure to enforce any right or provision shall not constitute a waiver</li>
              <li><strong>Assignment:</strong> You may not assign these Terms without our consent. We may assign them in connection with a merger or acquisition.</li>
            </ul>
          </section>

          <section>
            <h2>21. Contact Information</h2>
            <p>For questions about these Terms:</p>
            <ul>
              <li><strong>General &amp; Legal:</strong> <a href="mailto:legal@quicksell.monster">legal@quicksell.monster</a></li>
              <li><strong>Support:</strong> <a href="mailto:support@quicksell.monster">support@quicksell.monster</a></li>
              <li><strong>EU ODR Platform:</strong> <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr/</a></li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
