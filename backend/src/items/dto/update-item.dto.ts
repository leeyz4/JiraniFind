import { IsEnum } from 'class-validator';
import { ItemStatus } from '../../prisma/prisma.service'; // Import from Prisma types

export class UpdateItemStatusDto {
  @IsEnum(ItemStatus)
  status: ItemStatus;
}