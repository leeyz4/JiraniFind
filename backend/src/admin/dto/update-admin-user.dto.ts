import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['USER', 'ADMIN'])
  role?: 'USER' | 'ADMIN';

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}
