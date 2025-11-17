import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@traffic2u/auth';
import { prisma } from '@traffic2u/database';

/**
 * Escape CSV values to prevent injection and handle special characters
 */
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const company = searchParams.get('company');
    const tags = searchParams.get('tags')?.split(',');

    // Build where clause
    const whereClause: any = {
      userId: session.user.id,
    };

    if (startDate || endDate) {
      whereClause.extractedAt = {};
      if (startDate) {
        whereClause.extractedAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.extractedAt.lte = new Date(endDate);
      }
    }

    if (company) {
      whereClause.company = {
        contains: company,
        mode: 'insensitive',
      };
    }

    if (tags && tags.length > 0) {
      whereClause.tags = {
        hasSome: tags,
      };
    }

    // Fetch leads
    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: { extractedAt: 'desc' },
      select: {
        fullName: true,
        firstName: true,
        lastName: true,
        title: true,
        company: true,
        companyUrl: true,
        email: true,
        phone: true,
        location: true,
        headline: true,
        linkedInUrl: true,
        tags: true,
        extractedAt: true,
        isEnriched: true,
        emailStatus: true,
      },
    });

    // Generate CSV
    const csvHeader = [
      'Full Name',
      'First Name',
      'Last Name',
      'Title',
      'Company',
      'Company URL',
      'Email',
      'Email Status',
      'Phone',
      'Location',
      'Headline',
      'LinkedIn URL',
      'Tags',
      'Enriched',
      'Extracted At',
    ].join(',') + '\n';

    const csvRows = leads.map(lead => {
      return [
        escapeCsvValue(lead.fullName),
        escapeCsvValue(lead.firstName),
        escapeCsvValue(lead.lastName),
        escapeCsvValue(lead.title),
        escapeCsvValue(lead.company),
        escapeCsvValue(lead.companyUrl),
        escapeCsvValue(lead.email),
        escapeCsvValue(lead.emailStatus),
        escapeCsvValue(lead.phone),
        escapeCsvValue(lead.location),
        escapeCsvValue(lead.headline),
        escapeCsvValue(lead.linkedInUrl),
        escapeCsvValue(lead.tags?.join('; ')),
        escapeCsvValue(lead.isEnriched ? 'Yes' : 'No'),
        escapeCsvValue(lead.extractedAt.toISOString()),
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    // Generate filename with timestamp
    const filename = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { message: 'Failed to export leads' },
      { status: 500 }
    );
  }
}
