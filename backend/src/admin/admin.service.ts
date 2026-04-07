import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ItemsService } from '../items/items.service';
import { ClaimsService } from '../claims/claims.service';
import { NotificationsService } from '../notification/notification.service';

export interface AdminDashboardStats {
  totalUsers: number;
  pendingItems: number;
  approvedItems: number;
  pendingClaims: number;
  matchedItems: number;
}

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private itemsService: ItemsService,
    private claimsService: ClaimsService,
    private notificationsService: NotificationsService,
  ) {}

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [totalUsers, pendingLost, pendingFound, approvedLost, approvedFound, pendingClaims, matchedLost, matchedFound] = 
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.lostItem.count({ where: { status: 'PENDING' } }),
        this.prisma.foundItem.count({ where: { status: 'PENDING' } }),
        this.prisma.lostItem.count({ where: { status: 'APPROVED' } }),
        this.prisma.foundItem.count({ where: { status: 'APPROVED' } }),
        this.prisma.claim.count({ where: { status: 'PENDING' } }),
        this.prisma.lostItem.count({ where: { status: 'MATCHED' } }),
        this.prisma.foundItem.count({ where: { status: 'MATCHED' } }),
      ]);

    return {
      totalUsers,
      pendingItems: pendingLost + pendingFound,
      approvedItems: approvedLost + approvedFound,
      pendingClaims,
      matchedItems: matchedLost + matchedFound,
    };
  }

  async getPendingItems() {
    const [lostItems, foundItems] = await Promise.all([
      this.prisma.lostItem.findMany({
        where: { status: 'PENDING' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.foundItem.findMany({
        where: { status: 'PENDING' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { lostItems, foundItems };
  }

  async getPendingClaims(status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const claims = await this.prisma.claim.findMany({
      where: { status: status ?? 'PENDING' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { id: 'desc' },
    });

    const enriched = await Promise.all(
      claims.map(async (claim) => {
        const lostItem = claim.lostItemId
          ? await this.prisma.lostItem.findUnique({
              where: { id: claim.lostItemId },
              select: {
                id: true,
                title: true,
                category: true,
                location: true,
                dateLost: true,
                imageUrl: true,
                status: true,
                userId: true,
                createdAt: true,
              },
            })
          : null;
        const foundItem = claim.foundItemId
          ? await this.prisma.foundItem.findUnique({
              where: { id: claim.foundItemId },
              select: {
                id: true,
                title: true,
                category: true,
                location: true,
                dateFound: true,
                imageUrl: true,
                status: true,
                userId: true,
                createdAt: true,
              },
            })
          : null;
        return {
          ...claim,
          lostItem,
          foundItem,
        };
      }),
    );
    return enriched;
  }

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: {
            lostItems: true,
            foundItems: true,
            claims: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({
      where: { id: userId },
    });
  }
}