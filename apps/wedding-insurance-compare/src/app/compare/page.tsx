"use client";

import { useState } from "react";
import { SITES, getAffiliatesByNiche } from "@traffic2u/config";
import { AffiliateComparisonTable } from "@traffic2u/ui";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

const site = SITES.wedding;

interface FormData {
  eventType: string;
  guestCount: string;
  budgetRange: string;
  coverageNeeds: string[];
  email: string;
  zipCode: string;
}

interface Quote {
  id: string;
  carrierName: string;
  monthlyPremium: number;
  annualPremium: number;
  coverage: string;
  rating: number;
}

export default function ComparePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    eventType: "wedding",
    guestCount: "",
    budgetRange: "",
    coverageNeeds: [],
    email: "",
    zipCode: "",
  });
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const steps = [
    {
      title: "Tell Us About Your Event",
      description: "Help us find the perfect coverage for your special day",
    },
    {
      title: "Coverage Needs",
      description: "What are you most concerned about protecting?",
    },
    {
      title: "Your Contact Info",
      description: "We'll send personalized wedding insurance quotes",
    },
  ];

  const handleEventTypeChange = (value: string) => {
    setFormData({ ...formData, eventType: value });
  };

  const handleGuestCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, guestCount: e.target.value });
  };

  const handleBudgetRangeChange = (value: string) => {
    setFormData({ ...formData, budgetRange: value });
  };

  const handleCoverageNeedChange = (need: string) => {
    const newNeeds = formData.coverageNeeds.includes(need)
      ? formData.coverageNeeds.filter((n) => n !== need)
      : [...formData.coverageNeeds, need];
    setFormData({ ...formData, coverageNeeds: newNeeds });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, zipCode: e.target.value });
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!formData.guestCount || !formData.budgetRange) {
        setError("Please fill in all fields");
        return;
      }
    } else if (currentStep === 1) {
      if (formData.coverageNeeds.length === 0) {
        setError("Please select at least one coverage need");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.email || !formData.zipCode) {
        setError("Please fill in your contact information");
        return;
      }
      submitForm();
      return;
    }

    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to get quotes");

      const data = await response.json();
      setQuotes(data.quotes);
      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center mb-8">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
            <h1 className="text-3xl font-bold mb-2">Great! Check Your Email</h1>
            <p className="text-gray-600 text-lg mb-6">
              We've sent your personalized quotes to <strong>{formData.email}</strong>
            </p>
            <p className="text-gray-600 mb-8">
              We found {quotes.length} wedding and event insurance options to protect your celebration. Compare them
              below or check your email for detailed information.
            </p>
          </div>

          {/* Quotes Display */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">Available Quotes</h2>
            {quotes.map((quote) => (
              <div key={quote.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{quote.carrierName}</h3>
                    <p className="text-gray-600 text-sm">{quote.coverage}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold" style={{ color: site.primaryColor }}>
                      ${quote.monthlyPremium}
                    </div>
                    <p className="text-gray-600 text-sm">for event</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex gap-1">
                    {[...Array(Math.round(quote.rating))].map((_, i) => (
                      <span key={i} className="text-yellow-400">
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({quote.rating}/5)</span>
                </div>

                <a
                  href={`/api/click?quoteId=${quote.id}`}
                  className="btn-primary w-full text-center"
                >
                  Get Quote
                </a>
              </div>
            ))}
          </div>

          {/* Affiliate Programs Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-4">Earn Commissions with These Programs</h2>
            <p className="text-gray-600 mb-6">
              If you're interested in promoting wedding and event insurance, join these affiliate programs and earn
              commissions:
            </p>
            <AffiliateComparisonTable
              programs={getAffiliatesByNiche("wedding")}
              siteName="Wedding Insurance"
              primaryColor={site.primaryColor}
            />
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Get Another Quote
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-pink-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 h-2 mx-1 rounded-full ${
                  index <= currentStep ? "bg-pink-500" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
          <h1 className="text-3xl font-bold mb-2">{steps[currentStep].title}</h1>
          <p className="text-gray-600">{steps[currentStep].description}</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Step 1: Event Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">What type of event are you planning?</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => handleEventTypeChange(e.target.value)}
                  className="input"
                >
                  <option value="wedding">Wedding</option>
                  <option value="engagement">Engagement Party</option>
                  <option value="reception">Reception / Celebration</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="other">Other Event</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">How many guests are you expecting?</label>
                <input
                  type="number"
                  placeholder="e.g., 150"
                  value={formData.guestCount}
                  onChange={handleGuestCountChange}
                  className="input"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total event budget</label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => handleBudgetRangeChange(e.target.value)}
                  className="input"
                >
                  <option value="">Select budget range...</option>
                  <option value="5-15k">$5,000 - $15,000</option>
                  <option value="15-50k">$15,000 - $50,000</option>
                  <option value="50-100k">$50,000 - $100,000</option>
                  <option value="100k-plus">$100,000+</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Coverage Needs */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">What coverage do you need? (Select all that apply)</label>
                {[
                  { value: "liability", label: "General Liability (Accidents, Injuries)" },
                  { value: "liquor", label: "Liquor/Host Liability" },
                  { value: "cancellation", label: "Event Cancellation" },
                  { value: "weather", label: "Weather Coverage" },
                  { value: "vendor", label: "Vendor/Contractor Liability" },
                  { value: "jewelry", label: "Jewelry & Valuables Protection" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.coverageNeeds.includes(option.value)}
                      onChange={() => handleCoverageNeedChange(option.value)}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleEmailChange}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Zip Code / Event Location</label>
                <input
                  type="text"
                  placeholder="12345"
                  value={formData.zipCode}
                  onChange={handleZipCodeChange}
                  className="input"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ℹ️ Wedding insurance typically costs $150-300 for comprehensive coverage. Many policies offer
                  protection for cancellation and weather delays.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 0}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                currentStep === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "btn-secondary"
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNextStep}
              disabled={loading}
              className="flex-1 btn-primary justify-center"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Getting Quotes...
                </>
              ) : currentStep === steps.length - 1 ? (
                "Get Quotes"
              ) : (
                "Next"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
