import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestPasswordChangeDto } from './dto/request-password-change.dto';
import { ConfirmPasswordChangeDto } from './dto/confirm-password-change.dto';
import { MailService } from '../notification/mailer/mail.service';
import { generateOtp, OTP_TTL_MS } from '../auth/otp.util';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

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
          orderBy: { id: 'desc' },
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

  async requestPasswordChange(userId: string, dto: RequestPasswordChangeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.password))) {
      throw new UnauthorizedException('Invalid current password');
    }

    const pendingPasswordHash = await bcrypt.hash(dto.newPassword, 12);
    const otp = generateOtp();
    const passwordChangeOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        pendingPasswordHash,
        passwordChangeOtp: otp,
        passwordChangeOtpExpiresAt,
      },
    });

    try {
      await this.mailService.sendPasswordChangeOtpEmail(user.email, user.name, otp);
    } catch (err) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          pendingPasswordHash: null,
          passwordChangeOtp: null,
          passwordChangeOtpExpiresAt: null,
        },
      });
      throw new BadRequestException(
        'Could not send verification email. Check mail settings and try again.',
      );
    }

    return {
      message:
        'We sent a 6-digit code to your email. Confirm with POST /user/password/confirm-change.',
    };
  }

  async confirmPasswordChange(userId: string, dto: ConfirmPasswordChangeDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.pendingPasswordHash || !user.passwordChangeOtp) {
      throw new BadRequestException(
        'No password change in progress. Start again from request-change.',
      );
    }
    if (
      !user.passwordChangeOtpExpiresAt ||
      user.passwordChangeOtpExpiresAt.getTime() < Date.now()
    ) {
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          pendingPasswordHash: null,
          passwordChangeOtp: null,
          passwordChangeOtpExpiresAt: null,
        },
      });
      throw new BadRequestException('Code expired. Start the password change again.');
    }
    if (user.passwordChangeOtp !== dto.code.trim()) {
      throw new BadRequestException('Invalid code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: user.pendingPasswordHash,
        pendingPasswordHash: null,
        passwordChangeOtp: null,
        passwordChangeOtpExpiresAt: null,
      },
    });

    return { message: 'Password updated successfully.' };
  }

  async getUserActivity(userId: string) {
    return {
      lostItems: await this.prisma.lostItem.count({ where: { userId } }),
      foundItems: await this.prisma.foundItem.count({ where: { userId } }),
      claims: await this.prisma.claim.count({ where: { userId } }),
      matches: await this.prisma.match.count({
        where: {
          OR: [
            { lostItemId: { not: null } },
            { foundItemId: { not: null } },
          ],
        },
      }),
    };
  }
}