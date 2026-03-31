import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { MailService } from '../notification/mailer/mail.service';
import { generateOtp, OTP_TTL_MS } from './otp.util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const otp = generateOtp();
    const verificationCodeExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        isVerified: false,
        verificationCode: otp,
        verificationCodeExpiresAt,
      },
    });

    try {
      await this.mailService.sendWelcomeAndVerificationEmail(
        user.email,
        user.name,
        otp,
      );
    } catch (err) {
      console.error('Welcome / verification email failed:', err);
    }

    return {
      message:
        'Registration successful. Check your email for a welcome message and your 6-digit verification code.',
      userId: user.id,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new BadRequestException('Invalid email or code');
    }
    if (user.isVerified) {
      return { message: 'Email is already verified' };
    }
    if (
      !user.verificationCode ||
      !user.verificationCodeExpiresAt ||
      user.verificationCode !== dto.code.trim()
    ) {
      throw new BadRequestException('Invalid or expired verification code');
    }
    if (user.verificationCodeExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Verification code has expired');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null,
      },
    });

    return { message: 'Email verified. You can log in now.' };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      return {
        message:
          'If an account exists for this email, a new code has been sent.',
      };
    }
    if (user.isVerified) {
      return { message: 'This email is already verified.' };
    }

    const otp = generateOtp();
    const verificationCodeExpiresAt = new Date(Date.now() + OTP_TTL_MS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: otp,
        verificationCodeExpiresAt,
      },
    });

    try {
      await this.mailService.sendWelcomeAndVerificationEmail(
        user.email,
        user.name,
        otp,
      );
    } catch (err) {
      console.error('Resend verification email failed:', err);
    }

    return {
      message:
        'If an account exists for this email, a new verification code has been sent.',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email with the 6-digit code we sent you.',
      );
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
