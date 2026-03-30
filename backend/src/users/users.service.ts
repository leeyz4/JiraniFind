import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        lostItems: {
          where: { status: { not: 'REJECTED' } },
          orderBy: { createdAt: 'desc' },
        },
        foundItems: {
          where: { status: { not: 'REJECTED' } },
          orderBy: { createdAt: 'desc' },
        },
        claims: {
          orderBy: { createdAt: 'desc' },
        },
        notifications: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.password))) {
      throw new UnauthorizedException('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12);
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async getUserActivity(userId: string) {
    return {
      lostItems: await this.prisma.lostItem.count({ where: { userId } }),
      foundItems: await this.prisma.foundItem.count({ where: { userId } }),
      claims: await this.prisma.claim.count({ where: { userId } }),
      matches: await this.prisma.match.count({
        where: {
          OR: [
            { lostItem: { userId } },
            { foundItem: { userId } },
          ],
        },
      }),
    };
  }
}