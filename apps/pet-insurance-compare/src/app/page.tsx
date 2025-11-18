"use client";

import { useState } from "react";
import Link from "next/link";
import { SITES } from "@traffic2u/config";
import { ArrowRight, Zap, DollarSign, Shield, Users } from "lucide-react";

const site = SITES.pet;

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to email subscription API
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="gradient-primary text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find the Best Pet Insurance for Your Furry Friend
          </h1>
          <p className="text-xl mb-8 text-gray-100">
            Compare quotes from 30+ carriers. Save up to 50% on your pet's healthcare coverage.
          </p>
          <Link href="/compare" className="btn-primary text-lg">
            Get Free Quotes <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How Pet Cover Compare Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: "1",
              title: "Tell Us About Your Pet",
              description: "Answer a few questions about your pet's age, breed, and health",
              icon: Users,
            },
            {
              step: "2",
              title: "Get Instant Quotes",
              description: "Compare coverage options and prices from multiple carriers",
              icon: Zap,
            },
            {
              step: "3",
              title: "Review Coverage",
              description: "See detailed coverage, deductibles, and customer reviews",
              icon: Shield,
            },
            {
              step: "4",
              title: "Save Money",
              description: "Choose the best plan and save on your pet's healthcare",
              icon: DollarSign,
            },
          ].map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.step} className="card text-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 mx-auto"
                  style={{ backgroundColor: site.primaryColor }}
                >
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Compare Pet Insurance Quotes?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Get personalized quotes from the best pet insurance companies in just 5 minutes.
          </p>
          <Link href="/compare" className="btn-primary inline-flex text-lg">
            Start Comparing <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Email Signup */}
      <section className="py-16 px-4 max-w-2xl mx-auto">
        <div className="card bg-gradient-to-r from-pink-50 to-orange-50 border-2" style={{ borderColor: site.primaryColor }}>
          <h3 className="text-2xl font-bold mb-4">Stay Updated on Pet Insurance Tips</h3>
          <p className="text-gray-600 mb-6">
            Get weekly tips on pet healthcare and insurance savings delivered to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 input"
            />
            <button type="submit" className="btn-primary">
              Subscribe
            </button>
          </form>
          {submitted && (
            <p className="text-green-600 text-sm mt-4">✅ Check your email to confirm your subscription!</p>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">30+</div>
              <p>Insurance Carriers</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50%</div>
              <p>Average Savings</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5 min</div>
              <p>Time to Compare</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Why Pet Owners Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "100% Free to Compare",
              description: "No hidden fees. Get quotes instantly without providing payment info.",
            },
            {
              title: "Real Customer Reviews",
              description: "Read verified reviews from actual pet insurance customers.",
            },
            {
              title: "Expert Guidance",
              description: "Our guides help you understand coverage and make the best choice.",
            },
          ].map((item, index) => (
            <div key={index} className="card">
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
