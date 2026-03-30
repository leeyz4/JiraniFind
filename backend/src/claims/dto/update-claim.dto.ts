import { IsEnum } from 'class-validator';

export enum ClaimStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateClaimDto {
  @IsEnum(ClaimStatus)
  status: ClaimStatus;

  @IsString()
  @IsOptional()
  adminMessage?: string;
}