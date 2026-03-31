import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/notification.dto';
import { MailService } from './mailer/mail.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: createNotificationDto,
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    // Send email (optional)
    if (notification.user?.email) {
      await this.mailService.sendNotificationEmail(
        notification.user.email,
        notification.title,
        notification.message,
      );
    }

    return notification;
  }

  async findAll(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { read: true },
    });

    return notification.count > 0;
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });
  }

  // === PRE-DEFINED NOTIFICATION HELPERS ===

  async sendMatchNotification(userId: string, itemTitle: string, matchItemTitle: string) {
    return this.create({
      title: '🎉 New Match Found!',
      message: `Your "${itemTitle}" has a potential match with "${matchItemTitle}"!`,
      type: NotificationType.MATCH_FOUND,
      userId,
    });
  }

  async sendClaimNotification(userId: string, claimId: string) {
    return this.create({
      title: '📩 New Claim Received',
      message: 'Someone wants to claim your item! Check claims.',
      type: NotificationType.CLAIM_STATUS,
      userId,
    });
  }

  async sendClaimStatusNotification(userId: string, claimId: string, status: string) {
    const statusMessage = status === 'APPROVED' ? '✅ Approved!' : '❌ Rejected';
    return this.create({
      title: `Claim ${statusMessage}`,
      message: `Your claim has been ${status.toLowerCase()}.`,
      type: NotificationType.CLAIM_STATUS,
      userId,
    });
  }

  async sendItemApprovedNotification(userId: string, itemTitle: string) {
    return this.create({
      title: '✅ Item Approved',
      message: `Your "${itemTitle}" is now live and visible to others!`,
      type: NotificationType.ITEM_APPROVED,
      userId,
    });
  }
}