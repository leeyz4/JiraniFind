import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ItemsService } from '../items/items.service';
import { NotificationsService } from '../notification/notification.service';

@Injectable()
export class ClaimsService {
  constructor(
    private prisma: PrismaService,
    private itemsService: ItemsService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createClaimDto: CreateClaimDto, userId: string) {
    const { itemId, message } = createClaimDto;

    // Verify item exists and is approved
    const [lostItem, foundItem] = await Promise.all([
      this.prisma.lostItem.findUnique({ where: { id: itemId } }),
      this.prisma.foundItem.findUnique({ where: { id: itemId } }),
    ]);

    const item = lostItem || foundItem;
    if (!item) {
      throw new BadRequestException('Item not found');
    }

    if (item.status !== 'APPROVED') {
      throw new BadRequestException('Item must be approved before claiming');
    }

    // Check if user already claimed this item
    const existingClaim = await this.prisma.claim.findFirst({
      where: {
        OR: [
          { lostItemId: itemId },
          { foundItemId: itemId },
        ],
        userId,
      },
    });

    if (existingClaim) {
      throw new BadRequestException('You have already claimed this item');
    }

    // Create claim
    const claim = await this.prisma.claim.create({
      data: {
        message,
        status: 'PENDING',
        userId,
        ...(lostItem ? { lostItemId: itemId } : { foundItemId: itemId }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Notify item owner about claim
    const itemOwnerId = item.userId;
    await this.notificationsService.sendClaimNotification(itemOwnerId, claim.id);

    return {
      message: 'Claim submitted successfully (Pending admin review)',
      claim,
    };
  }

  async findAll(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }

    const claims = await this.prisma.claim.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { id: 'desc' },
    });

    return claims;
  }

  async findMyClaims(userId: string) {
    const claims = await this.prisma.claim.findMany({
      where: { userId },
      include: {
        user: true,
      },
      orderBy: { id: 'desc' },
    });

    return claims;
  }

  async updateStatus(claimId: string, updateClaimDto: UpdateClaimDto, adminId: string) {
    const { status, adminMessage } = updateClaimDto;

    // Find claim
    const claim = await this.prisma.claim.findUnique({
      where: { id: claimId },
      include: {
        user: true,
      },
    });

    if (!claim) {
      throw new BadRequestException('Claim not found');
    }

    // Update claim status
    const updatedClaim = await this.prisma.claim.update({
      where: { id: claimId },
      data: { status, message: adminMessage },
      include: {
        user: true,
      },
    });

    // If approved, update item status to MATCHED
    if (status === 'APPROVED') {
      if (claim.lostItemId) {
        await this.prisma.lostItem.update({
          where: { id: claim.lostItemId! },
          data: { status: 'MATCHED' },
        });
      } else if (claim.foundItemId) {
        await this.prisma.foundItem.update({
          where: { id: claim.foundItemId! },
          data: { status: 'MATCHED' },
        });
      }
    }

    // Notify claimant
    await this.notificationsService.sendClaimStatusNotification(
      claim.userId,
      updatedClaim.id,
      status,
    );

    return {
      message: `Claim ${status.toLowerCase()} successfully`,
      claim: updatedClaim,
    };
  }
}