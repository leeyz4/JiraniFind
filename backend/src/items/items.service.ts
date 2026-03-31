import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemStatusDto } from './dto/update-item.dto';
import { ItemType } from './interface/items.interface';
import { MatchingService } from './strategies/matching.strategy';

@Injectable()
export class ItemsService {
  constructor(
    private prisma: PrismaService,
    private matchingService: MatchingService,
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

  async findAll(type?: ItemType, status?: string, category?: string, location?: string) {
    const where: any = { status: { not: 'REJECTED' } };

    if (type) {
      where.type = type;
    }
    if (status) {
      where.status = status;
    }
    if (category) {
      where.category = { contains: category, mode: 'insensitive' };
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    const [lostItems, foundItems] = await Promise.all([
      this.prisma.lostItem.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.foundItem.findMany({
        where,
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
      await this.matchingService.checkMatches(updatedItem);
    }

    return {
      message: `Item ${status.toLowerCase()} successfully`,
      item: updatedItem,
    };
  }
}