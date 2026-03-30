import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class MatchingService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async checkMatches(item: any) {
    const oppositeItems = item.type === 'lost'
      ? await this.prisma.foundItem.findMany({ where: { status: 'APPROVED' } })
      : await this.prisma.lostItem.findMany({ where: { status: 'APPROVED' } });

    for (const oppositeItem of oppositeItems) {
      const score = this.calculateMatchScore(item, oppositeItem);
      
      if (score > 0.7) { // 70% match threshold
        await this.createMatch(item.id, oppositeItem.id, score);
        await this.sendMatchNotifications(item.userId, oppositeItem.userId);
      }
    }
  }

  private calculateMatchScore(item1: any, item2: any): number {
    let score = 0;

    // Category match (40%)
    if (item1.category.toLowerCase() === item2.category.toLowerCase()) {
      score += 0.4;
    }

    // Location match (30%)
    if (item1.location.toLowerCase().includes(item2.location.toLowerCase()) ||
        item2.location.toLowerCase().includes(item1.location.toLowerCase())) {
      score += 0.3;
    }

    // Date proximity (20%)
    const dateDiff = Math.abs(item1.dateLost.getTime() - item2.dateLost.getTime());
    const weekInMs = 7 * 24 * 60 * 60 * 1000;
    if (dateDiff < weekInMs) {
      score += 0.2 * (1 - dateDiff / weekInMs);
    }

    // Keyword match (10%)
    const keywords1 = item1.description?.toLowerCase().split(' ') || [];
    const keywords2 = item2.description?.toLowerCase().split(' ') || [];
    const commonKeywords = keywords1.filter(kw => keywords2.includes(kw));
    score += Math.min(commonKeywords.length * 0.02, 0.1);

    return score;
  }

  private async createMatch(lostItemId: string, foundItemId: string, confidence: number) {
    await this.prisma.match.create({
      data: {
        lostItemId,
        foundItemId,
        confidence,
      },
    });
  }

//   private async sendMatchNotifications(userId1: string, userId2: string) {
//     // Will be implemented in notifications module
//     console.log(Match notification for users: ${userId1}, ${userId2});
//   }

// In MatchingService.sendMatchNotifications()
await this.notificationsService.sendMatchNotification(userId1, item.title, oppositeItem.title);
await this.notificationsService.sendMatchNotification(userId2, oppositeItem.title, item.title);
}