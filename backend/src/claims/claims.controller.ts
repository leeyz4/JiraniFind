import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('claims')
@UseGuards(JwtAuthGuard)
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  create(@Body() createClaimDto: CreateClaimDto, @Request() req) {
    return this.claimsService.create(createClaimDto, req.user.userId);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    return this.claimsService.findAll(status);
  }

  @Get('my-claims')
  findMyClaims(@Request() req) {
    return this.claimsService.findMyClaims(req.user.userId);
  }
}