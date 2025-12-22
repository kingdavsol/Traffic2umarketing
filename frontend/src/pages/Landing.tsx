import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Landing.css';

function LandingPage() {
  const [demoPhotos, setDemoPhotos] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  const features = [
    {
      icon: '📸',
      title: 'Snap a Photo',
      description: 'Take a picture of any item you want to sell',
    },
    {
      icon: '🤖',
      title: 'AI-Powered Listing',
      description: 'Automatic description, pricing, and category detection',
    },
    {
      icon: '🌍',
      title: '20+ Marketplaces',
      description: 'Post to eBay, Facebook, Craigslist, Amazon, and more',
    },
    {
      icon: '🏆',
      title: 'Earn Rewards',
      description: 'Unlock badges, earn points, and climb the leaderboard',
    },
    {
      icon: '📊',
      title: 'Track Everything',
      description: 'Monitor sales, views, and earnings in one dashboard',
    },
    {
      icon: '🚀',
      title: 'Get Paid Fast',
      description: 'Integrated shipping and payment processing',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Take a Photo',
      description: 'Snap a picture of your item with your phone or camera. That\'s it!',
      detail: 'No need for professional photography - just a clear photo works great.',
    },
    {
      step: '2',
      title: 'AI Creates Your Listing',
      description: 'Our AI analyzes your photo and generates a professional description',
      detail: 'Add details like brand name, size, condition, or special features to enhance accuracy.',
    },
    {
      step: '3',
      title: 'Review & Customize',
      description: 'Check the AI-generated title, description, and suggested pricing',
      detail: 'Edit anything you want - you have full control before posting.',
    },
    {
      step: '4',
      title: 'Post Everywhere Instantly',
      description: 'Click one button to post to 20+ marketplaces simultaneously',
      detail: 'eBay, Facebook Marketplace, Craigslist, Mercari, Poshmark, OfferUp, and more!',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Reseller',
      avatar: '👩‍💼',
      quote: 'QuickSell cut my listing time from 10 minutes to under 30 seconds. I\'ve doubled my sales!',
      rating: 5,
    },
    {
      name: 'Mike T.',
      role: 'Small Business Owner',
      avatar: '👨‍💻',
      quote: 'The AI descriptions are surprisingly accurate. Saved me hours every week.',
      rating: 5,
    },
    {
      name: 'Jessica R.',
      role: 'Part-time Seller',
      avatar: '👩',
      quote: 'Love the multi-marketplace posting! My items get way more visibility now.',
      rating: 5,
    },
  ];

  const stats = [
    { number: '50K+', label: 'Active Sellers' },
    { number: '2M+', label: 'Items Listed' },
    { number: '20+', label: 'Marketplaces' },
    { number: '80%', label: 'Time Saved' },
  ];

  const marketplaces = ['eBay', 'Facebook', 'Craigslist', 'Mercari', 'Poshmark', 'OfferUp', 'Etsy', 'Amazon', '+ 12 more'];

  const handleDemoPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files).slice(0, 3); // Max 3 photos
    const readers = fileArray.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((images) => {
      setDemoPhotos(images);
      setAnalysisResult(null);
      setDemoError(null);
    });
  };

  const handleAnalyzeDemo = async () => {
    if (demoPhotos.length === 0) {
      setDemoError('Please upload at least one photo');
      return;
    }

    setAnalyzing(true);
    setDemoError(null);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/v1/photos/analyze`,
        {
          images: demoPhotos,
        }
      );

      if (response.data.success) {
        setAnalysisResult(response.data.data);
      } else {
        setDemoError(response.data.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Demo analysis error:', error);
      setDemoError(
        error.response?.data?.error || 'Failed to analyze photos. Please try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#2196f3';
    if (score >= 40) return '#ff9800';
    return '#f44336';
  };

  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="container">
          <div className="nav-content">
            <Link to="/" className="nav-logo">
              <svg width="40" height="40" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
                <rect width="64" height="64" fill="#007AFF" rx="8"/>
                <circle cx="32" cy="22" r="11" fill="#FF6B6B"/>
                <circle cx="27" cy="19" r="2.5" fill="#FFFFFF"/>
                <circle cx="27" cy="19" r="1.2" fill="#000000"/>
                <circle cx="37" cy="19" r="2.5" fill="#FFFFFF"/>
                <circle cx="37" cy="19" r="1.2" fill="#000000"/>
                <path d="M 26 26 Q 32 28 38 26" stroke="#000000" strokeWidth="1" fill="none" strokeLinecap="round"/>
                <ellipse cx="32" cy="38" rx="11" ry="13" fill="#FF6B6B"/>
                <ellipse cx="32" cy="40" rx="6" ry="8" fill="#FFB3BA" opacity="0.8"/>
              </svg>
              QuickSell
            </Link>
            <div className="nav-links">
              <Link to="/pricing" className="nav-link">
                Pricing
              </Link>
              <Link to="/auth/login" className="nav-link">
                Login
              </Link>
              <Link to="/auth/register" className="btn btn-primary">
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">🎉 Join 50,000+ Sellers Worldwide</div>
              <h1>Sell Anything in 30 Seconds</h1>
              <p className="hero-tagline">One Photo. AI Magic. 20+ Marketplaces.</p>
              <p className="hero-description">
                QuickSell uses AI to transform your product photos into professional listings,
                then instantly posts them to eBay, Facebook Marketplace, Craigslist, and 17+ other platforms.
              </p>
              <div className="hero-buttons">
                <Link to="/auth/register" className="btn btn-primary btn-large">
                  Start Selling Free →
                </Link>
                <a href="#try-demo" className="btn btn-secondary btn-large">
                  Try Demo
                </a>
              </div>
              <p className="hero-subtext">✓ No credit card required  ✓ 7-day free trial  ✓ Cancel anytime</p>
            </div>
            <div className="hero-visual">
              <svg width="300" height="300" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="95" fill="#007AFF" opacity="0.1" stroke="#007AFF" strokeWidth="2"/>
                <ellipse cx="100" cy="110" rx="45" ry="50" fill="#FF6B6B"/>
                <circle cx="100" cy="60" r="40" fill="#FF6B6B"/>
                <circle cx="85" cy="50" r="8" fill="#FFFFFF"/>
                <circle cx="85" cy="50" r="5" fill="#000000"/>
                <circle cx="87" cy="48" r="2" fill="#FFFFFF"/>
                <circle cx="115" cy="50" r="8" fill="#FFFFFF"/>
                <circle cx="115" cy="50" r="5" fill="#000000"/>
                <circle cx="117" cy="48" r="2" fill="#FFFFFF"/>
                <path d="M 75 40 Q 85 35 95 40" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M 105 40 Q 115 35 125 40" stroke="#000000" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M 85 70 Q 100 80 115 70" stroke="#000000" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                <ellipse cx="100" cy="83" rx="6" ry="8" fill="#FFB3BA"/>
                <polygon points="70,25 65,5 75,20" fill="#FF4757"/>
                <polygon points="130,25 135,5 125,20" fill="#FF4757"/>
                <rect x="50" y="100" width="20" height="40" rx="10" fill="#FF6B6B" transform="rotate(-45 60 100)"/>
                <circle cx="35" cy="120" r="8" fill="#FFB3BA"/>
                <rect x="130" y="100" width="20" height="40" rx="10" fill="#FF6B6B" transform="rotate(25 140 100)"/>
                <circle cx="155" cy="135" r="8" fill="#FFB3BA"/>
                <ellipse cx="75" cy="160" rx="12" ry="15" fill="#FF6B6B"/>
                <circle cx="70" cy="172" r="5" fill="#FFB3BA"/>
                <circle cx="80" cy="172" r="5" fill="#FFB3BA"/>
                <ellipse cx="125" cy="160" rx="12" ry="15" fill="#FF6B6B"/>
                <circle cx="120" cy="172" r="5" fill="#FFB3BA"/>
                <circle cx="130" cy="172" r="5" fill="#FFB3BA"/>
                <ellipse cx="100" cy="120" rx="25" ry="30" fill="#FFB3BA" opacity="0.7"/>
                <g fill="#FFD700">
                  <path d="M 40 30 L 43 38 L 52 38 L 45 43 L 48 51 L 40 46 L 32 51 L 35 43 L 28 38 L 37 38 Z"/>
                  <path d="M 160 30 L 163 38 L 172 38 L 165 43 L 168 51 L 160 46 L 152 51 L 155 43 L 148 38 L 157 38 Z"/>
                  <path d="M 100 175 L 103 183 L 112 183 L 105 188 L 108 196 L 100 191 L 92 196 L 95 188 L 88 183 L 97 183 Z"/>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <h2>How QuickSell Works</h2>
          <p className="section-subtitle">From photo to posted in 4 simple steps</p>
          <div className="steps-grid">
            {howItWorks.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{step.step}</div>
                <h3>{step.title}</h3>
                <p className="step-description">{step.description}</p>
                <p className="step-detail">{step.detail}</p>
              </div>
            ))}
          </div>
          <div className="marketplaces-list">
            <h4>Supported Marketplaces:</h4>
            <div className="marketplace-badges">
              {marketplaces.map((marketplace, index) => (
                <span key={index} className="marketplace-badge">{marketplace}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Try Demo Section */}
      <section className="try-demo" id="try-demo">
        <div className="container">
          <h2>Try It Now - No Signup Required</h2>
          <p className="section-subtitle">Upload a photo and see AI magic in action</p>

          <div className="demo-container">
            <div className="demo-upload">
              <h3>📸 Upload Your Photo</h3>
              <p>Upload 1-3 photos of any item you want to sell</p>

              <label className="demo-upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleDemoPhotoUpload}
                  style={{ display: 'none' }}
                />
                {demoPhotos.length > 0 ? 'Change Photos' : 'Choose Photos'}
              </label>

              {demoPhotos.length > 0 && (
                <div className="demo-photos-preview">
                  {demoPhotos.map((photo, index) => (
                    <img key={index} src={photo} alt={`Upload ${index + 1}`} className="demo-photo-thumb" />
                  ))}
                  <p className="demo-photo-count">{demoPhotos.length} photo{demoPhotos.length > 1 ? 's' : ''} selected</p>
                </div>
              )}

              <button
                className="btn btn-primary btn-large"
                onClick={handleAnalyzeDemo}
                disabled={analyzing || demoPhotos.length === 0}
                style={{ marginTop: '1rem' }}
              >
                {analyzing ? '🤖 Analyzing...' : '✨ Analyze with AI'}
              </button>

              {demoError && (
                <div className="demo-error">
                  ⚠️ {demoError}
                </div>
              )}
            </div>

            {analysisResult && (
              <div className="demo-results">
                <h3>🎯 AI Analysis Results</h3>

                {/* Confidence Scores */}
                {analysisResult.analysis_metadata && (
                  <div className="confidence-scores">
                    <h4>Confidence Scores</h4>
                    <div className="score-grid">
                      {Object.entries(analysisResult.analysis_metadata.confidence_scores).map(([key, value]: [string, any]) => {
                        if (key === 'overall') return null;
                        return (
                          <div key={key} className="score-item">
                            <div className="score-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                            <div className="score-bar">
                              <div
                                className="score-fill"
                                style={{
                                  width: `${value}%`,
                                  backgroundColor: getConfidenceColor(value)
                                }}
                              />
                            </div>
                            <div className="score-value">{value}%</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="overall-confidence">
                      <strong>Overall Confidence: </strong>
                      <span style={{ color: getConfidenceColor(analysisResult.analysis_metadata.confidence_scores.overall) }}>
                        {analysisResult.analysis_metadata.confidence_scores.overall}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Quality Checks */}
                {analysisResult.analysis_metadata?.quality_checks && (
                  <div className="quality-checks">
                    <h4>Photo Quality</h4>
                    {analysisResult.analysis_metadata.quality_checks.map((qc: any, index: number) => (
                      <div key={index} className="quality-item">
                        <div className="quality-status">
                          Photo {index + 1}: {qc.is_acceptable ? '✅ Good' : '⚠️ Issues Found'}
                        </div>
                        {qc.issues.length > 0 && (
                          <div className="quality-issues">
                            {qc.issues.map((issue: string, i: number) => (
                              <div key={i} className="issue">🔴 {issue}</div>
                            ))}
                          </div>
                        )}
                        {qc.warnings.length > 0 && (
                          <div className="quality-warnings">
                            {qc.warnings.map((warning: string, i: number) => (
                              <div key={i} className="warning">🟡 {warning}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Generated Listing Preview */}
                <div className="listing-preview">
                  <h4>Generated Listing</h4>
                  <div className="preview-content">
                    <div className="preview-field">
                      <strong>Title:</strong>
                      <p>{analysisResult.title}</p>
                    </div>
                    <div className="preview-field">
                      <strong>Suggested Price:</strong>
                      <p className="price">${analysisResult.suggestedPrice}</p>
                    </div>
                    <div className="preview-field">
                      <strong>Category:</strong>
                      <p>{analysisResult.category}</p>
                    </div>
                    <div className="preview-field">
                      <strong>Condition:</strong>
                      <p>{analysisResult.condition}</p>
                    </div>
                    {analysisResult.brand && (
                      <div className="preview-field">
                        <strong>Brand:</strong>
                        <p>{analysisResult.brand}</p>
                      </div>
                    )}
                    <div className="preview-field">
                      <strong>Description:</strong>
                      <p className="description">{analysisResult.description}</p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className="demo-cta">
                  <h4>🚀 Ready to sell for real?</h4>
                  <p>Sign up free to post this listing to 20+ marketplaces instantly!</p>
                  <Link to="/auth/register" className="btn btn-primary btn-large">
                    Create Free Account →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Everything You Need to Sell More</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        <div className="container">
          <h2>Loved by Sellers Everywhere</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-avatar">{testimonial.avatar}</div>
                <div className="testimonial-rating">{'⭐'.repeat(testimonial.rating)}</div>
                <p className="testimonial-quote">"{testimonial.quote}"</p>
                <div className="testimonial-author">
                  <strong>{testimonial.name}</strong>
                  <span>{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to 10x Your Selling Speed?</h2>
          <p>Join 50,000+ sellers who use QuickSell to sell more, faster.</p>
          <Link to="/auth/register" className="btn btn-primary btn-large">
            Start Selling Free →
          </Link>
          <p className="cta-subtext">✓ 7-day free trial  ✓ No credit card required  ✓ Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>QuickSell</h4>
              <p>Making it easy to sell everything</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <Link to="/">Features</Link>
              <Link to="/pricing">Pricing</Link>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <Link to="/legal/privacy-policy">Privacy Policy</Link>
              <Link to="/legal/terms-of-service">Terms of Service</Link>
              <Link to="/legal/cookie-policy">Cookie Policy</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 QuickSell. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
