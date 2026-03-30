import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateClaimDto {
  @IsUUID()
  @IsNotEmpty()
  itemId: string; // Lost or Found item ID

  @IsString()
  @IsOptional()
  message?: string;
}