import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum NotificationType {
  MATCH_FOUND = 'MATCH_FOUND',
  CLAIM_STATUS = 'CLAIM_STATUS',
  ITEM_APPROVED = 'ITEM_APPROVED',
  CLAIM_CREATED = 'CLAIM_CREATED',
}

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  userId: string;
}