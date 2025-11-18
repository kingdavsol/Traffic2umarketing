import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@traffic2u/db";
import { EmailService } from "@traffic2u/email";

interface QuoteRequestBody {
  petType: string;
  breed: string;
  age: string;
  preExistingConditions: string[];
  coverageType: string;
  email: string;
  zipCode: string;
}

// Mock carrier data - In production, integrate with actual carrier APIs
const MOCK_CARRIERS = [
  {
    name: "Trupanion",
    monthlyPremium: 45,
    annualPremium: 540,
    coverage: "Accident & Illness",
    rating: 4.8,
    features: ["No annual limits", "Fast claims", "Wellness coverage available"],
  },
  {
    name: "Fetch Pet Insurance",
    monthlyPremium: 38,
    annualPremium: 456,
    coverage: "Accident & Illness",
    rating: 4.6,
    features: ["Flexible deductibles", "Quick payouts", "Customizable"],
  },
  {
    name: "Spot Pet Insurance",
    monthlyPremium: 42,
    annualPremium: 504,
    coverage: "Accident & Illness",
    rating: 4.7,
    features: ["90-day waiting period", "Exam fee coverage", "Pre-existing waiver"],
  },
  {
    name: "ManyPets",
    monthlyPremium: 35,
    annualPremium: 420,
    coverage: "Accident Only",
    rating: 4.5,
    features: ["Affordable premiums", "Network vets", "Online quotes"],
  },
  {
    name: "MetLife Pet Insurance",
    monthlyPremium: 50,
    annualPremium: 600,
    coverage: "Comprehensive",
    rating: 4.3,
    features: ["Wellness included", "Accident & Illness", "Multi-pet discount"],
  },
];

export async function POST(request: NextRequest) {
  try {
    const body: QuoteRequestBody = await request.json();

    // Validate request
    if (!body.email || !body.petType || !body.breed || !body.age || !body.zipCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create or get user by email
    let user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: body.email,
          emailVerified: false,
        },
      });
    }

    // Create quote request
    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        userId: user.id,
        email: body.email,
        siteType: "pet",
        questionnaire: body,
        status: "pending",
      },
    });

    // Generate mock quotes based on pet info
    const quotes = MOCK_CARRIERS.map((carrier, index) => {
      // Adjust prices based on age and pet type
      const ageMultiplier = 1 + (parseInt(body.age) * 0.02);
      const typeMultiplier = body.petType === "dog" ? 1 : 0.85;

      return {
        id: `quote-${index}-${Date.now()}`,
        quoteRequestId: quoteRequest.id,
        carrierName: carrier.name,
        monthlyPremium: Math.round(carrier.monthlyPremium * ageMultiplier * typeMultiplier),
        annualPremium: Math.round(carrier.annualPremium * ageMultiplier * typeMultiplier),
        coverage: carrier.coverage,
        rating: carrier.rating,
        features: carrier.features,
        affiliateLink: `https://example.com/aff/${carrier.name.toLowerCase()}`,
        affiliateProgram: carrier.name,
        commissionRate: "15%",
      };
    });

    // Save quotes to database (in transaction)
    await Promise.all(
      quotes.map((quote) =>
        prisma.quote.create({
          data: {
            quoteRequestId: quoteRequest.id,
            carrierName: quote.carrierName,
            monthlyPremium: quote.monthlyPremium,
            annualPremium: quote.annualPremium,
            coverageDetails: { coverage: quote.coverage, features: quote.features },
            deductibles: { standard: 500, premium: 250 },
            affiliateLink: quote.affiliateLink,
            affiliateProgram: quote.affiliateProgram,
            commissionRate: quote.commissionRate,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
        })
      )
    );

    // Update quote request status
    await prisma.quoteRequest.update({
      where: { id: quoteRequest.id },
      data: { status: "completed" },
    });

    // Send email with quotes
    try {
      await EmailService.sendQuoteReadyEmail(
        body.email,
        "Pet Cover Compare",
        quotes.length,
        `https://petcovercompare.com/quotes/${quoteRequest.id}`
      );
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      // Don't fail the request if email fails
    }

    // Create email subscription
    await prisma.emailSubscription.upsert({
      where: {
        email_siteType: {
          email: body.email,
          siteType: "pet",
        },
      },
      update: { status: "subscribed" },
      create: {
        email: body.email,
        siteType: "pet",
        status: "subscribed",
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      quoteRequestId: quoteRequest.id,
      quotes: quotes.map(({ id, carrierName, monthlyPremium, coverage, rating }) => ({
        id,
        carrierName,
        monthlyPremium,
        coverage,
        rating,
      })),
    });
  } catch (error) {
    console.error("Quote request error:", error);
    return NextResponse.json(
      { error: "Failed to process quote request" },
      { status: 500 }
    );
  }
}
