"use client";

import { useState } from "react";
import { SITES, getAffiliatesByNiche } from "@traffic2u/config";
import { AffiliateComparisonTable } from "@traffic2u/ui";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

const site = SITES.pet;

interface FormData {
  petType: string;
  breed: string;
  age: string;
  preExistingConditions: string[];
  coverageType: string;
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
    petType: "",
    breed: "",
    age: "",
    preExistingConditions: [],
    coverageType: "accident_illness",
    email: "",
    zipCode: "",
  });
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const steps = [
    {
      title: "Tell Us About Your Pet",
      description: "Help us find the right coverage for your furry friend",
    },
    {
      title: "Coverage Preferences",
      description: "Choose the type of coverage you need",
    },
    {
      title: "Your Contact Info",
      description: "We'll send your personalized quotes to your email",
    },
  ];

  const handlePetTypeChange = (value: string) => {
    setFormData({ ...formData, petType: value });
  };

  const handleBreedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, breed: e.target.value });
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, age: e.target.value });
  };

  const handleCoverageChange = (value: string) => {
    setFormData({ ...formData, coverageType: value });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, zipCode: e.target.value });
  };

  const handleNextStep = () => {
    // Validation
    if (currentStep === 0) {
      if (!formData.petType || !formData.breed || !formData.age) {
        setError("Please fill in all fields");
        return;
      }
    } else if (currentStep === 1) {
      if (!formData.coverageType) {
        setError("Please select coverage type");
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.email || !formData.zipCode) {
        setError("Please fill in your contact information");
        return;
      }
      // Submit form
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
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-pink-50 to-orange-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center mb-8">
            <CheckCircle size={64} className="mx-auto mb-4 text-green-500" />
            <h1 className="text-3xl font-bold mb-2">Great! Check Your Email</h1>
            <p className="text-gray-600 text-lg mb-6">
              We've sent your personalized quotes to <strong>{formData.email}</strong>
            </p>
            <p className="text-gray-600 mb-8">
              We found {quotes.length} insurance options for your {formData.petType}. Compare them below or check
              your email for detailed information.
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
              If you're interested in promoting pet insurance, join these affiliate programs and earn commissions:
            </p>
            <AffiliateComparisonTable
              programs={getAffiliatesByNiche("pet")}
              siteName="Pet Insurance"
              primaryColor={site.primaryColor}
            />
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Compare Different Pets
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-pink-50 to-orange-50 py-12 px-4">
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

          {/* Step 1: Pet Information */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">What type of pet do you have?</label>
                <div className="grid grid-cols-2 gap-4">
                  {["dog", "cat"].map((type) => (
                    <button
                      key={type}
                      onClick={() => handlePetTypeChange(type)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.petType === type
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-300 bg-white hover:border-pink-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {type === "dog" ? "🐕" : "🐱"}
                      </div>
                      <div className="font-semibold capitalize">{type}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Breed</label>
                <input
                  type="text"
                  placeholder="e.g., Golden Retriever, Persian"
                  value={formData.breed}
                  onChange={handleBreedChange}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age (in years)</label>
                <input
                  type="number"
                  placeholder="Enter age"
                  value={formData.age}
                  onChange={handleAgeChange}
                  className="input"
                  min="0"
                  max="25"
                />
              </div>
            </div>
          )}

          {/* Step 2: Coverage Preferences */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label">What coverage type interests you?</label>
                {[
                  { value: "accident_only", label: "Accident Only", price: "Lowest" },
                  { value: "accident_illness", label: "Accident & Illness", price: "Popular" },
                  {
                    value: "accident_illness_wellness",
                    label: "Accident, Illness & Wellness",
                    price: "Comprehensive",
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleCoverageChange(option.value)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all mb-3 ${
                      formData.coverageType === option.value
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-300 bg-white hover:border-pink-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-sm text-gray-600">{option.price}</span>
                    </div>
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
                  ℹ️ We'll send personalized quotes to your email and may contact you with insurance offers.
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
