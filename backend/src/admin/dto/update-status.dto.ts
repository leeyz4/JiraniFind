import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ItemStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  MATCHED = 'MATCHED',
  COMPLETED = 'COMPLETED',
}

export enum ClaimStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateItemStatusDto {
  @IsEnum(ItemStatus)
  status: ItemStatus;

  @IsString()
  @IsOptional()
  adminMessage?: string;
}

export class UpdateClaimStatusDto {
  @IsEnum(ClaimStatus)
  status: ClaimStatus;

  @IsString()
  @IsOptional()
  adminMessage?: string;
}