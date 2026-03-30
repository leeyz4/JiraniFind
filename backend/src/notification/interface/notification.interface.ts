import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '../dto/notification.dto';

export class NotificationInterface {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  type: NotificationType;

  @ApiProperty()
  read: boolean;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;
}