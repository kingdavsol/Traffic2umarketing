"use client";

import { useState } from "react";
import { SITES, getAffiliatesByNiche } from "@traffic2u/config";
import { AffiliateComparisonTable } from "@traffic2u/ui";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

const site = SITES.sr22;

interface FormData {
  reason: string;
  drivingRecord: string;
  licenseStatus: string;
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
    reason: "",
    drivingRecord: "",
    licenseStatus: "suspended",
    email: "",
    zipCode: "",
  });
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const steps = [
    {
      title: "Why Do You Need an SR-22?",
      description: "Help us find the best SR-22 insurance for your situation",
    },
    {
      title: "Your Driving Record",
      description: "Tell us about your driving history",
    },
    {
      title: "Your Contact Info",
      description: "We'll send personalized SR-22 insurance quotes",
    },
  ];

  const handleReasonChange = (value: string) => {
    setFormData({ ...formData, reason: value });
  };

  const handleDrivingRecordChange = (value: string) => {
    setFormData({ ...formData, drivingRecord: value });
  };

  const handleLicenseStatusChange = (value: string) => {
    setFormData({ ...formData, licenseStatus: value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, zipCode: e.target.value });
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!formData.reason) {
        setError("Please select a reason");
        return;
      }
    } else if (currentStep === 1) {
      if (!formData.drivingRecord || !formData.licenseStatus) {
        setError("Please fill in all fields");
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-50 to-gray-900/5 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center mb-8">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
            <h1 className="text-3xl font-bold mb-2">Great! Check Your Email</h1>
            <p className="text-gray-600 text-lg mb-6">
              We've sent your personalized quotes to <strong>{formData.email}</strong>
            </p>
            <p className="text-gray-600 mb-8">
              We found {quotes.length} SR-22 insurance options. Compare them below or check your email for detailed
              information. You can usually get an SR-22 filed the same day.
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
                    <p className="text-gray-600 text-sm">/month</p>
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
              If you're interested in promoting SR-22 insurance to drivers needing to restore their driving
              privileges, join these affiliate programs and earn commissions:
            </p>
            <AffiliateComparisonTable
              programs={getAffiliatesByNiche("sr22")}
              siteName="SR-22 Insurance"
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-orange-50 to-gray-900/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 h-2 mx-1 rounded-full ${
                  index <= currentStep ? "bg-orange-500" : "bg-gray-300"
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

          {/* Step 1: Reason for SR-22 */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">Why do you need an SR-22?</label>
                {[
                  { value: "dui", label: "DUI/DWI Conviction" },
                  { value: "reckless", label: "Reckless Driving" },
                  { value: "suspended", label: "Suspended License" },
                  { value: "accidents", label: "Multiple Accidents" },
                  { value: "violations", label: "Multiple Violations" },
                  { value: "other", label: "Other Court Order" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleReasonChange(option.value)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all mb-2 ${
                      formData.reason === option.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300 bg-white hover:border-orange-300"
                    }`}
                  >
                    <span className="font-semibold">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Driving Record */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">How long ago was the incident?</label>
                <select
                  value={formData.drivingRecord}
                  onChange={(e) => handleDrivingRecordChange(e.target.value)}
                  className="input"
                >
                  <option value="">Select timeframe...</option>
                  <option value="recent">Within the last 6 months</option>
                  <option value="year">6-12 months ago</option>
                  <option value="1-2years">1-2 years ago</option>
                  <option value="2-3years">2-3 years ago</option>
                  <option value="3plus">3+ years ago</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current license status</label>
                {[
                  { value: "suspended", label: "Suspended (Need to Reinstate)" },
                  { value: "revoked", label: "Revoked (Need Reinstatement)" },
                  { value: "restricted", label: "Restricted/Limited License" },
                  { value: "valid", label: "Valid (Still Need SR-22)" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleLicenseStatusChange(option.value)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all mb-2 ${
                      formData.licenseStatus === option.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300 bg-white hover:border-orange-300"
                    }`}
                  >
                    <span className="text-sm font-semibold">{option.label}</span>
                  </button>
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
                <label className="form-label">Zip Code</label>
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
                  ℹ️ We'll send quotes quickly. Most insurers can file your SR-22 form same-day or next business
                  day.
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
