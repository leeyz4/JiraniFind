import { IsString, Length, Matches } from 'class-validator';

export class ConfirmPasswordChangeDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/)
  code: string;
}
