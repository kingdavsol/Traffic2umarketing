import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@traffic2u/auth';
import { prisma } from '@traffic2u/database';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { image, framework } = await request.json();

    if (!image) {
      return NextResponse.json(
        { message: 'Image is required' },
        { status: 400 }
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get user's subscription
    const subscription = await prisma.subscription.findFirst({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      return NextResponse.json(
        { message: 'No subscription found' },
        { status: 403 }
      );
    }

    // Check usage limits based on plan
    const planLimits = {
      FREE: 5,
      STARTER: 100,
      PROFESSIONAL: Infinity,
      ENTERPRISE: Infinity,
    };

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usageCount = await prisma.usageRecord.count({
      where: {
        userId: session.user.id,
        feature: 'code_generation',
        createdAt: {
          gte: new Date(currentMonth + '-01'),
        },
      },
    });

    const limit = planLimits[subscription.plan as keyof typeof planLimits];

    if (usageCount >= limit) {
      return NextResponse.json(
        {
          message: `Usage limit exceeded. You've used ${usageCount} of ${limit} conversions this month. Please upgrade your plan.`,
          usageCount,
          limit,
          plan: subscription.plan,
        },
        { status: 429 }
      );
    }

    const frameworkInstructions = {
      react: 'Generate clean React (TypeScript) code with functional components and hooks. Use modern best practices.',
      vue: 'Generate clean Vue 3 code with composition API. Use modern best practices.',
      svelte: 'Generate clean Svelte code. Use modern best practices.',
      html: 'Generate semantic HTML5 and CSS code. Use modern CSS features like Flexbox and Grid.',
      tailwind: 'Generate React (TypeScript) code with Tailwind CSS classes. Use modern best practices.',
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an expert frontend developer. Analyze this UI screenshot and convert it into ${framework} code.

Requirements:
- ${frameworkInstructions[framework as keyof typeof frameworkInstructions] || frameworkInstructions.react}
- Make the code production-ready and clean
- Include proper component structure
- Add appropriate styling
- Use semantic HTML elements
- Make it responsive
- Include accessibility features (ARIA labels, alt text, etc.)
- Return ONLY the code, no explanations or markdown formatting

Generate the complete code now:`,
            },
            {
              type: 'image_url',
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
    });

    const code = response.choices[0]?.message?.content || '';

    // Track usage
    await prisma.usageRecord.create({
      data: {
        userId: session.user.id,
        feature: 'code_generation',
        metadata: {
          framework,
          model: 'gpt-4-vision-preview',
          tokensUsed: response.usage?.total_tokens || 0,
        },
      },
    });

    return NextResponse.json({
      code,
      usageCount: usageCount + 1,
      limit,
      plan: subscription.plan,
    });
  } catch (error: any) {
    console.error('Code generation error:', error);

    if (error.status === 401) {
      return NextResponse.json(
        { message: 'OpenAI API key is invalid' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: error.message || 'Failed to generate code' },
      { status: 500 }
    );
  }
}
