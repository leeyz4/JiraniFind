import { ApiProperty } from '@nestjs/swagger';
import { ClaimStatus } from '../dto/update-claim.dto';

export class ClaimEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  itemId: string;

  @ApiProperty()
  message?: string;

  @ApiProperty()
  status: ClaimStatus;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;
}