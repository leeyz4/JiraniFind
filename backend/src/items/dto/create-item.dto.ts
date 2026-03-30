import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ItemType } from '../interface/items.interface';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsDateString()
  dateLost: string; // ISO date

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsEnum(ItemType)
  type: ItemType;
}