import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      // Use Gmail (or your SMTP)
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER, // your-email@gmail.com
        pass: process.env.MAIL_PASS, // your-app-password
      },
    });
  }

  async sendNotificationEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject,
        text,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h2>${subject}</h2>
            <p>${text}</p>
            <hr>
            <p><small>JiraniFind - Lost & Found Platform</small></p>
          </div>
        `,
      });
      console.log(Email sent to ${to});
    } catch (error) {
      console.error('Email failed:', error);
    }
  }
}