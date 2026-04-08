import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemStatusDto } from './dto/update-item.dto';
import { ItemType } from './interface/items.interface';
import { MatchingService } from './strategies/matching.strategy';
import { NotificationsService } from '../notification/notification.service';

@Injectable()
export class ItemsService {
  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createItemDto: CreateItemDto, userId: string) {
    const { type, ...itemData } = createItemDto;
    const dateLost = new Date(createItemDto.dateLost);

    // Create LostItem or FoundItem based on type
    const item = type === ItemType.LOST
      ? await this.prisma.lostItem.create({
          data: {
            title: itemData.title,
            description: itemData.description,
            category: itemData.category,
            location: itemData.location,
            dateLost,
            imageUrl: itemData.imageUrl,
            userId,
            status: 'PENDING',
          },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        })
      : await this.prisma.foundItem.create({
          data: {
            title: itemData.title,
            description: itemData.description,
            category: itemData.category,
            location: itemData.location,
            dateFound: dateLost, // Reuse dateLost field
            imageUrl: itemData.imageUrl,
            userId,
            status: 'PENDING',
          },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        });

    return {
      message: 'Item reported successfully (Pending admin approval)',
      item,
    };
  }

  async findAll(
    type?: ItemType,
    status?: string,
    category?: string,
    location?: string,
    keyword?: string,
  ) {
    const where: any = {
      status: status ?? 'APPROVED',
    };

    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [lostItems, foundItems] = await Promise.all([
      this.prisma.lostItem.findMany({
        where: type && type !== ItemType.LOST ? { id: '__none__' } : where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.foundItem.findMany({
        where: type && type !== ItemType.FOUND ? { id: '__none__' } : where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { lostItems, foundItems };
  }

  async findMyItems(userId: string) {
    const [lostItems, foundItems] = await Promise.all([
      this.prisma.lostItem.findMany({
        where: { userId },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.foundItem.findMany({
        where: { userId },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { lostItems, foundItems };
  }

  /** Potential matches stored when the paired item was approved (see MatchingService). */
  async findMatchesForMyItem(itemId: string, userId: string) {
    const lostItem = await this.prisma.lostItem.findFirst({
      where: { id: itemId, userId },
    });
    const foundItem = await this.prisma.foundItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!lostItem && !foundItem) {
      throw new NotFoundException('Report not found');
    }

    const where = lostItem
      ? { lostItemId: itemId }
      : { foundItemId: itemId };

    const rows = await this.prisma.match.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const results: Array<{
      confidence: number;
      itemType: 'lost' | 'found';
      item: unknown;
    }> = [];

    for (const m of rows) {
      if (lostItem && m.foundItemId) {
        const item = await this.prisma.foundItem.findUnique({
          where: { id: m.foundItemId },
          include: { user: { select: { name: true, email: true } } },
        });
        if (item) {
          results.push({ confidence: m.confidence, itemType: 'found', item });
        }
      } else if (foundItem && m.lostItemId) {
        const item = await this.prisma.lostItem.findUnique({
          where: { id: m.lostItemId },
          include: { user: { select: { name: true, email: true } } },
        });
        if (item) {
          results.push({ confidence: m.confidence, itemType: 'lost', item });
        }
      }
    }

    return { matches: results };
  }

  async updateStatus(id: string, updateItemStatusDto: UpdateItemStatusDto, adminId: string) {
    const { status } = updateItemStatusDto;

    // Check if item exists (either lost or found)
    const [lostItem, foundItem] = await Promise.all([
      this.prisma.lostItem.findUnique({ where: { id } }),
      this.prisma.foundItem.findUnique({ where: { id } }),
    ]);

    const item = lostItem || foundItem;
    if (!item) {
      throw new ForbiddenException('Item not found');
    }

    // Update item
    const updatedItem = lostItem
      ? await this.prisma.lostItem.update({
          where: { id },
          data: { status, approvedAt: status === 'APPROVED' ? new Date() : undefined },
          include: { user: true },
        })
      : await this.prisma.foundItem.update({
          where: { id },
          data: { status, approvedAt: status === 'APPROVED' ? new Date() : undefined },
          include: { user: true },
        });

    // Trigger matching if approved
    if (status === 'APPROVED') {
      await this.notificationsService.sendItemApprovedNotification(
        updatedItem.userId,
        updatedItem.title,
      );
      await this.matchingService.checkMatches(updatedItem);
    }

    return {
      message: `Item ${status.toLowerCase()} successfully`,
      item: updatedItem,
    };
  }
}