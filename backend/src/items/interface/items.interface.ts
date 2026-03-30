import { ApiProperty } from '@nestjs/swagger';

export enum ItemType {
  LOST = 'lost',
  FOUND = 'found',
}

export class ItemEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  dateLost: Date;

  @ApiProperty()
  imageUrl?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  type: ItemType;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}