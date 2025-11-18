import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class UserGuideService {
  /**
   * Create a user-generated guide
   */
  async createGuide(userId: string, guideData: {
    title: string;
    description: string;
    content: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear?: number;
    category: string; // repair, maintenance, modification
    difficulty: string; // easy, medium, hard
    estimatedTime?: number;
    steps: string[];
    tools: string[];
    partsNeeded: string[];
    videoUrl?: string;
    imageUrl?: string;
  }): Promise<any> {
    // Validate required fields
    if (!guideData.title || !guideData.description || !guideData.content) {
      throw new Error('Title, description, and content are required');
    }

    if (!guideData.vehicleMake || !guideData.vehicleModel) {
      throw new Error('Vehicle make and model are required');
    }

    // Create guide
    const guide = await prisma.userGuide.create({
      data: {
        userId,
        title: guideData.title,
        description: guideData.description,
        content: guideData.content,
        vehicleMake: guideData.vehicleMake,
        vehicleModel: guideData.vehicleModel,
        vehicleYear: guideData.vehicleYear,
        category: guideData.category,
        difficulty: guideData.difficulty,
        estimatedTime: guideData.estimatedTime,
        steps: guideData.steps,
        tools: guideData.tools,
        partsNeeded: guideData.partsNeeded,
        videoUrl: guideData.videoUrl,
        imageUrl: guideData.imageUrl,
        status: 'pending_review'
      }
    });

    // Award points to user for creating guide
    await this.awardPoints(userId, 100, 'created_guide', { guideId: guide.id });

    return guide;
  }

  /**
   * Get approved guides for a vehicle
   */
  async getGuidesForVehicle(
    make: string,
    model: string,
    year?: number,
    category?: string
  ): Promise<any[]> {
    let where: any = {
      status: 'approved',
      vehicleMake: make,
      vehicleModel: model
    };

    if (year) {
      where.vehicleYear = year;
    }

    if (category) {
      where.category = category;
    }

    return await prisma.userGuide.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        ratings: {
          select: {
            helpful: true,
            rating: true
          }
        }
      },
      orderBy: { views: 'desc' }
    });
  }

  /**
   * Get single guide with view tracking
   */
  async getGuide(guideId: string, userId?: string): Promise<any> {
    // Increment view count
    await prisma.userGuide.update({
      where: { id: guideId },
      data: { views: { increment: 1 } }
    });

    const guide = await prisma.userGuide.findUnique({
      where: { id: guideId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        ratings: true
      }
    });

    if (!guide) {
      throw new Error('Guide not found');
    }

    // Calculate rating
    if (guide.ratings.length > 0) {
      const avgRating = guide.ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / guide.ratings.length;
      const helpfulCount = guide.ratings.filter(r => r.helpful).length;

      return {
        ...guide,
        averageRating: Math.round(avgRating * 10) / 10,
        helpfulCount,
        ratingCount: guide.ratings.length
      };
    }

    return guide;
  }

  /**
   * Get popular/featured guides
   */
  async getFeaturedGuides(limit: number = 10): Promise<any[]> {
    return await prisma.userGuide.findMany({
      where: {
        status: 'approved',
        featured: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        ratings: true
      },
      orderBy: { views: 'desc' },
      take: limit
    });
  }

  /**
   * Rate a guide
   */
  async rateGuide(
    userId: string,
    guideId: string,
    helpful: boolean,
    rating?: number,
    comment?: string
  ): Promise<void> {
    // Check if guide exists
    const guide = await prisma.userGuide.findUnique({
      where: { id: guideId }
    });

    if (!guide) {
      throw new Error('Guide not found');
    }

    // Delete existing rating if any
    await prisma.guideRating.deleteMany({
      where: {
        userId,
        guideId
      }
    });

    // Create new rating
    await prisma.guideRating.create({
      data: {
        userId,
        guideId,
        helpful,
        rating,
        comment
      }
    });

    // Award points for rating
    if (helpful) {
      await this.awardPoints(userId, 5, 'rated_guide_helpful', { guideId });

      // Award author bonus if guide gets many helpful ratings
      const helpfulCount = await prisma.guideRating.count({
        where: {
          guideId,
          helpful: true
        }
      });

      if (helpfulCount === 10 || helpfulCount === 25 || helpfulCount === 50) {
        await this.awardPoints(guide.userId, 50, 'guide_milestone', { guideId, milestone: helpfulCount });
      }
    }
  }

  /**
   * Approve a guide (admin)
   */
  async approveGuide(guideId: string): Promise<void> {
    const guide = await prisma.userGuide.findUnique({
      where: { id: guideId }
    });

    if (!guide) {
      throw new Error('Guide not found');
    }

    await prisma.userGuide.update({
      where: { id: guideId },
      data: { status: 'approved' }
    });

    // Award bonus points to author
    await this.awardPoints(guide.userId, 200, 'guide_approved', { guideId });
  }

  /**
   * Reject a guide (admin)
   */
  async rejectGuide(guideId: string, reason: string): Promise<void> {
    const guide = await prisma.userGuide.findUnique({
      where: { id: guideId }
    });

    if (!guide) {
      throw new Error('Guide not found');
    }

    await prisma.userGuide.update({
      where: { id: guideId },
      data: { status: 'rejected' }
    });

    // TODO: Send notification to author with reason
  }

  /**
   * Feature a guide (admin)
   */
  async featureGuide(guideId: string): Promise<void> {
    const guide = await prisma.userGuide.findUnique({
      where: { id: guideId }
    });

    if (!guide) {
      throw new Error('Guide not found');
    }

    await prisma.userGuide.update({
      where: { id: guideId },
      data: { featured: true }
    });

    // Award bonus points
    await this.awardPoints(guide.userId, 500, 'guide_featured', { guideId });
  }

  /**
   * Get user's guides
   */
  async getUserGuides(userId: string): Promise<any[]> {
    return await prisma.userGuide.findMany({
      where: { userId },
      include: {
        ratings: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /**
   * Award points to user
   */
  private async awardPoints(
    userId: string,
    points: number,
    reason: string,
    metadata?: any
  ): Promise<void> {
    await prisma.userPoints.create({
      data: {
        userId,
        points,
        reason,
        metadata: metadata ? JSON.stringify(metadata) : undefined
      }
    });
  }

  /**
   * Get user's total points
   */
  async getUserPoints(userId: string): Promise<number> {
    const points = await prisma.userPoints.findMany({
      where: { userId }
    });

    return points.reduce((sum, p) => sum + p.points, 0);
  }

  /**
   * Redeem points for discount
   */
  async redeemPoints(userId: string, points: number): Promise<{
    discountAmount: number;
    code: string;
  }> {
    const userPoints = await this.getUserPoints(userId);

    if (userPoints < points) {
      throw new Error('Insufficient points');
    }

    const discountAmount = Math.floor(points / 100); // 100 points = $1 off

    return {
      discountAmount,
      code: `GUIDE${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  }

  /**
   * Get guide statistics
   */
  async getStats(): Promise<{
    totalGuides: number;
    approvedGuides: number;
    pendingGuides: number;
    totalViews: number;
    totalRatings: number;
    averageRating: number;
    topGuides: Array<{
      id: string;
      title: string;
      views: number;
      rating: number;
    }>;
  }> {
    const guides = await prisma.userGuide.findMany({
      include: { ratings: true }
    });

    const approved = guides.filter(g => g.status === 'approved').length;
    const pending = guides.filter(g => g.status === 'pending_review').length;
    const totalViews = guides.reduce((sum, g) => sum + g.views, 0);
    const totalRatings = guides.reduce((sum, g) => sum + g.ratings.length, 0);

    let averageRating = 0;
    const allRatings = guides.flatMap(g => g.ratings.map(r => r.rating).filter(r => r !== null));
    if (allRatings.length > 0) {
      averageRating = allRatings.reduce((a, b) => a + b!) / allRatings.length;
    }

    // Get top guides
    const topGuides = guides
      .filter(g => g.status === 'approved')
      .map(g => ({
        id: g.id,
        title: g.title,
        views: g.views,
        rating: g.ratings.length > 0
          ? g.ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / g.ratings.length
          : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    return {
      totalGuides: guides.length,
      approvedGuides: approved,
      pendingGuides: pending,
      totalViews,
      totalRatings,
      averageRating: Math.round(averageRating * 10) / 10,
      topGuides
    };
  }
}

export default new UserGuideService();
