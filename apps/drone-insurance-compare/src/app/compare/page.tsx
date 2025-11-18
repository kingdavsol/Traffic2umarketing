"use client";

import { useState } from "react";
import { SITES, getAffiliatesByNiche } from "@traffic2u/config";
import { AffiliateComparisonTable } from "@traffic2u/ui";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

const site = SITES.drone;

interface FormData {
  droneType: string;
  droneValue: string;
  usageType: string;
  coverage: string[];
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
    droneType: "consumer",
    droneValue: "",
    usageType: "hobby",
    coverage: [],
    email: "",
    zipCode: "",
  });
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const steps = [
    {
      title: "Tell Us About Your Drone",
      description: "Help us find the right coverage for your drone operation",
    },
    {
      title: "Coverage Needs",
      description: "What type of protection do you need?",
    },
    {
      title: "Your Contact Info",
      description: "We'll send personalized drone insurance quotes",
    },
  ];

  const handleDroneTypeChange = (value: string) => {
    setFormData({ ...formData, droneType: value });
  };

  const handleDroneValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, droneValue: e.target.value });
  };

  const handleUsageTypeChange = (value: string) => {
    setFormData({ ...formData, usageType: value });
  };

  const handleCoverageChange = (cov: string) => {
    const newCoverage = formData.coverage.includes(cov)
      ? formData.coverage.filter((c) => c !== cov)
      : [...formData.coverage, cov];
    setFormData({ ...formData, coverage: newCoverage });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, zipCode: e.target.value });
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      if (!formData.droneValue) {
        setError("Please enter your drone value");
        return;
      }
    } else if (currentStep === 1) {
      if (formData.coverage.length === 0) {
        setError("Please select at least one coverage type");
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-cyan-50 to-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center mb-8">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
            <h1 className="text-3xl font-bold mb-2">Great! Check Your Email</h1>
            <p className="text-gray-600 text-lg mb-6">
              We've sent your personalized quotes to <strong>{formData.email}</strong>
            </p>
            <p className="text-gray-600 mb-8">
              We found {quotes.length} drone insurance options for your operation. Compare them below or check your
              email for detailed information.
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
                    <p className="text-gray-600 text-sm">
                      {formData.usageType === "commercial" ? "/month" : "/year"}
                    </p>
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
              If you're interested in promoting drone insurance to hobbyists and commercial operators, join these
              affiliate programs and earn commissions:
            </p>
            <AffiliateComparisonTable
              programs={getAffiliatesByNiche("drone")}
              siteName="Drone Insurance"
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-cyan-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex-1 h-2 mx-1 rounded-full ${
                  index <= currentStep ? "bg-cyan-500" : "bg-gray-300"
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

          {/* Step 1: Drone Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">What type of drone do you use?</label>
                <select
                  value={formData.droneType}
                  onChange={(e) => handleDroneTypeChange(e.target.value)}
                  className="input"
                >
                  <option value="consumer">Consumer Drone (DJI Mini/Air)</option>
                  <option value="prosumer">Professional Drone (DJI Pro)</option>
                  <option value="enterprise">Enterprise/Industrial Drone</option>
                  <option value="racing">Racing/FPV Drone</option>
                  <option value="custom">Custom Built</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Approximate drone value</label>
                <input
                  type="number"
                  placeholder="e.g., 1000"
                  value={formData.droneValue}
                  onChange={handleDroneValueChange}
                  className="input"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">What will you use it for?</label>
                {[
                  { value: "hobby", label: "Hobby / Personal Use" },
                  { value: "commercial", label: "Commercial / Business (Part 107)" },
                  { value: "photography", label: "Photography / Videography" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleUsageTypeChange(option.value)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all mb-2 ${
                      formData.usageType === option.value
                        ? "border-cyan-500 bg-cyan-50"
                        : "border-gray-300 bg-white hover:border-cyan-300"
                    }`}
                  >
                    <span className="font-semibold text-sm">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Coverage Needs */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">What coverage do you need? (Select all that apply)</label>
                {[
                  { value: "liability", label: "General Liability" },
                  { value: "hull", label: "Hull Coverage (Drone Damage)" },
                  { value: "equipment", label: "Equipment Coverage" },
                  { value: "medical", label: "Medical Payments" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.coverage.includes(option.value)}
                      onChange={() => handleCoverageChange(option.value)}
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
                  ℹ️ Drone insurance typically ranges from $200-500/year for hobbyists and $500-2000+/year for
                  commercial operations.
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
