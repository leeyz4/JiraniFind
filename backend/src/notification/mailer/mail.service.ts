/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      // Use Gmail (or your SMTP)
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER, // your-email@gmail.com
        pass: process.env.MAIL_PASS, // your-app-password
      },
    });
  }

  async sendWelcomeAndVerificationEmail(to: string, name: string, otp: string) {
    const subject = 'Welcome to JiraniFind — verify your email';
    const text = `Hi ${name},\n\nThanks for registering. Your verification code is: ${otp}\n\nIt expires in 15 minutes.\n\nIf you did not create an account, you can ignore this email.`;
    await this.sendMail(to, subject, text);
  }

  async sendPasswordChangeOtpEmail(to: string, name: string, otp: string) {
    const subject = 'Your password change code';
    const text = `Hi ${name},\n\nUse this code to confirm your new password: ${otp}\n\nIt expires in 15 minutes.\n\nIf you did not request this, secure your account immediately.`;
    await this.sendMail(to, subject, text);
  }

  private async sendMail(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject,
        text,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2>${subject}</h2>
            <p>${text.replace(/\n/g, '<br/>')}</p>
            <hr>
            <p><small>JiraniFind - Lost & Found Platform</small></p>
          </div>
        `,
      });
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Email failed:', error);
      throw error;
    }
  }

  async sendNotificationEmail(to: string, subject: string, text: string) {
    try {
      await this.sendMail(to, subject, text);
    } catch (error) {
      console.error('Email failed:', error);
    }
  }
}
