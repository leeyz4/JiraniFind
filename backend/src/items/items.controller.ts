import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemStatusDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/auth.guard';
import { ItemType } from './entities/item.entity';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create(@Body() createItemDto: CreateItemDto, @Request() req) {
    return this.itemsService.create(createItemDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('type') type?: ItemType,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
  ) {
    return this.itemsService.findAll(type as ItemType, status, category, location);
  }

  @Get('my-items')
  findMyItems(@Request() req) {
    return this.itemsService.findMyItems(req.user.userId);
  }
}