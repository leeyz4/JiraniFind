-- AlterTable
ALTER TABLE "users" ADD COLUMN "verificationCodeExpiresAt" TIMESTAMP(3),
ADD COLUMN "pendingPasswordHash" TEXT,
ADD COLUMN "passwordChangeOtp" TEXT,
ADD COLUMN "passwordChangeOtpExpiresAt" TIMESTAMP(3);
