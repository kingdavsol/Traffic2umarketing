import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const DisclosurePage: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <div className="legal-header">
          <Link to="/" className="back-link">← Back to Home</Link>
          <h1>Data &amp; Disclosure</h1>
          <p className="last-updated">Last Updated: February 25, 2026</p>
        </div>

        <div className="legal-content">

          <section>
            <h2>1. About This Disclosure</h2>
            <p>
              This page provides a transparent, plain-language disclosure of all data we collect, every
              third-party service we use, all device permissions our mobile apps request, and how data
              flows through QuickSell. It supplements our full <Link to="/legal/privacy-policy">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2>2. Data We Collect — Full Inventory</h2>

            <h3>2.1 Data You Provide</h3>
            <table className="disclosure-table">
              <thead>
                <tr>
                  <th>Data Type</th>
                  <th>Why We Collect It</th>
                  <th>Where It's Stored</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Email address</td>
                  <td>Account creation, login, communications</td>
                  <td>Our database (encrypted at rest)</td>
                </tr>
                <tr>
                  <td>Username / display name</td>
                  <td>Profile identification</td>
                  <td>Our database</td>
                </tr>
                <tr>
                  <td>Password</td>
                  <td>Authentication</td>
                  <td>Our database (bcrypt hash only — never plain text)</td>
                </tr>
                <tr>
                  <td>Product photos</td>
                  <td>AI analysis and marketplace posting</td>
                  <td>Our file storage; sent to Anthropic for analysis</td>
                </tr>
                <tr>
                  <td>Listing content (title, description, price, category)</td>
                  <td>Marketplace posting, history</td>
                  <td>Our database; transmitted to selected marketplaces</td>
                </tr>
                <tr>
                  <td>Marketplace OAuth tokens / credentials</td>
                  <td>Post listings on your behalf</td>
                  <td>Our database (AES-256 encrypted)</td>
                </tr>
              </tbody>
            </table>

            <h3>2.2 Data Collected Automatically</h3>
            <table className="disclosure-table">
              <thead>
                <tr>
                  <th>Data Type</th>
                  <th>Why We Collect It</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>IP address</td>
                  <td>Security, fraud prevention, country-level analytics</td>
                </tr>
                <tr>
                  <td>Device type, OS, browser</td>
                  <td>Technical support, compatibility</td>
                </tr>
                <tr>
                  <td>Session data (pages visited, actions taken)</td>
                  <td>Product analytics (PostHog), debugging</td>
                </tr>
                <tr>
                  <td>Error logs</td>
                  <td>Bug fixing, stability improvements</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>3. Third-Party Services</h2>

            <h3>3.1 Anthropic (AI Analysis)</h3>
            <div className="disclosure-service">
              <p><strong>What we send:</strong> Product photos you upload, along with a request to generate title, description, category, and price estimate.</p>
              <p><strong>Why:</strong> Core feature — AI-powered listing generation</p>
              <p><strong>Data retained by Anthropic:</strong> Per our API agreement, Anthropic does not use API inputs to train their models. Data may be retained briefly for safety monitoring per their policies.</p>
              <p><strong>Their privacy policy:</strong> <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noopener noreferrer">anthropic.com/legal/privacy</a></p>
            </div>

            <h3>3.2 Marketplace Integrations</h3>
            <p>When you connect a marketplace and post a listing, the following data is shared with that marketplace:</p>
            <table className="disclosure-table">
              <thead>
                <tr>
                  <th>Data Shared</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Listing title &amp; description</td>
                  <td>Create the marketplace listing</td>
                </tr>
                <tr>
                  <td>Product photos</td>
                  <td>Display on the listing</td>
                </tr>
                <tr>
                  <td>Price &amp; category</td>
                  <td>Listing details</td>
                </tr>
                <tr>
                  <td>Your marketplace account identifier</td>
                  <td>Associate listing with your account</td>
                </tr>
              </tbody>
            </table>
            <p>
              <strong>Important:</strong> Data shared with marketplaces is governed by <em>their</em> privacy
              policies, not ours. QuickSell only sends data to a marketplace when you explicitly initiate a
              post action.
            </p>

            <h3>3.3 Stripe (Payments)</h3>
            <div className="disclosure-service">
              <p><strong>What we send:</strong> Your email address and subscription plan details</p>
              <p><strong>What Stripe collects directly:</strong> Payment card details (we never see raw card numbers)</p>
              <p><strong>Their privacy policy:</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></p>
            </div>

            <h3>3.4 PostHog (Analytics)</h3>
            <div className="disclosure-service">
              <p><strong>What we send:</strong> Anonymized usage events (feature clicks, page views, session duration)</p>
              <p><strong>What we don't send:</strong> Photo content, listing data, passwords, or marketplace credentials</p>
              <p><strong>Their privacy policy:</strong> <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">posthog.com/privacy</a></p>
            </div>
          </section>

          <section>
            <h2>4. Mobile App Permissions</h2>
            <p>Our iOS and Android apps request the following device permissions:</p>

            <h3>4.1 Android Permissions</h3>
            <table className="disclosure-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Why It's Needed</th>
                  <th>When Requested</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CAMERA</td>
                  <td>Take photos of items you want to sell</td>
                  <td>When you tap "Take Photo" in the app</td>
                </tr>
                <tr>
                  <td>READ_EXTERNAL_STORAGE / READ_MEDIA_IMAGES</td>
                  <td>Select existing photos from your gallery</td>
                  <td>When you tap "Choose from Gallery"</td>
                </tr>
                <tr>
                  <td>INTERNET</td>
                  <td>Connect to QuickSell API and marketplace APIs</td>
                  <td>Always required for core app functionality</td>
                </tr>
              </tbody>
            </table>

            <h3>4.2 iOS Permissions</h3>
            <table className="disclosure-table">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Why It's Needed</th>
                  <th>When Requested</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>NSCameraUsageDescription (Camera)</td>
                  <td>Take photos of items you want to sell</td>
                  <td>When you tap "Take Photo" in the app</td>
                </tr>
                <tr>
                  <td>NSPhotoLibraryUsageDescription (Photo Library)</td>
                  <td>Select existing photos from your library</td>
                  <td>When you tap "Choose from Library"</td>
                </tr>
              </tbody>
            </table>

            <p>
              <strong>We do not request:</strong> Location, contacts, microphone, calendar, health data, or any
              other permissions beyond what is listed above.
            </p>
            <p>
              All permissions are optional — you can use the Service without granting camera or photo
              library access, but photo upload features will not be available.
            </p>
          </section>

          <section>
            <h2>5. AI Processing Disclosure</h2>
            <p>
              When you upload a photo to create a listing, that photo is sent over an encrypted connection
              (HTTPS) to <strong>Anthropic's Claude API</strong>. Claude analyzes the image and returns:
            </p>
            <ul>
              <li>Suggested product title</li>
              <li>Suggested description</li>
              <li>Category recommendation</li>
              <li>Estimated price range</li>
              <li>Condition assessment</li>
            </ul>
            <p>
              <strong>You review and edit</strong> all AI-generated content before any listing is posted.
              QuickSell does not automatically post listings — you always confirm before publishing.
            </p>
            <p>
              <strong>Anthropic API data handling:</strong> Per our API usage agreement, Anthropic does not
              use inputs from API customers to train their AI models. Photos are processed transiently and
              are not stored by Anthropic beyond the API request lifecycle (subject to their standard safety
              monitoring policies).
            </p>
          </section>

          <section>
            <h2>6. No Advertising</h2>
            <p>
              QuickSell does <strong>not</strong>:
            </p>
            <ul>
              <li>Display advertisements within the app or website</li>
              <li>Share personal data with advertising networks</li>
              <li>Use your data for behavioral advertising or ad targeting</li>
              <li>Participate in any ad exchange or programmatic advertising</li>
            </ul>
            <p>Our only revenue comes from subscription fees.</p>
          </section>

          <section>
            <h2>7. No Data Selling</h2>
            <p>
              We do <strong>not</strong> sell, rent, trade, or otherwise provide your personal data to
              third parties for their own commercial use. Data is shared with third parties <em>only</em> to
              provide the Service you explicitly use (AI analysis, marketplace posting, payment processing).
            </p>
          </section>

          <section>
            <h2>8. In-App Purchases</h2>
            <p>
              QuickSell does not currently offer in-app purchases within the mobile app. Subscription
              upgrades are available via our website at quicksell.monster. This disclosure will be updated
              if in-app purchase options are added in the future.
            </p>
          </section>

          <section>
            <h2>9. Data Security Summary</h2>
            <ul>
              <li><strong>In transit:</strong> All data encrypted with TLS 1.2+</li>
              <li><strong>At rest:</strong> Sensitive credentials encrypted with AES-256; passwords hashed with bcrypt</li>
              <li><strong>Access:</strong> Principle of least privilege; production data access is logged and audited</li>
              <li><strong>Backups:</strong> Encrypted backups retained for 90 days</li>
            </ul>
          </section>

          <section>
            <h2>10. Contact &amp; Rights</h2>
            <p>To exercise your data rights or ask questions about this disclosure:</p>
            <ul>
              <li><strong>Privacy requests:</strong> <a href="mailto:privacy@quicksell.monster">privacy@quicksell.monster</a></li>
              <li><strong>Full Privacy Policy:</strong> <Link to="/legal/privacy-policy">quicksell.monster/legal/privacy-policy</Link></li>
              <li><strong>Terms of Service:</strong> <Link to="/legal/terms-of-service">quicksell.monster/legal/terms-of-service</Link></li>
            </ul>
          </section>

        </div>
      </div>
    </div>
  );
};

export default DisclosurePage;
