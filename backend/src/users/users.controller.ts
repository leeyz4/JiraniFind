import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { RequestPasswordChangeDto } from './dto/request-password-change.dto';
import { ConfirmPasswordChangeDto } from './dto/confirm-password-change.dto';

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  getProfile(@Request() req) {
    return this.userService.findProfile(req.user.userId);
  }

  @Put('profile')
  updateProfile(@Body() dto: UpdateUserDto, @Request() req) {
    return this.userService.updateProfile(req.user.userId, dto);
  }

  @Post('password/request-change')
  requestPasswordChange(@Body() dto: RequestPasswordChangeDto, @Request() req) {
    return this.userService.requestPasswordChange(req.user.userId, dto);
  }

  @Post('password/confirm-change')
  confirmPasswordChange(@Body() dto: ConfirmPasswordChangeDto, @Request() req) {
    return this.userService.confirmPasswordChange(req.user.userId, dto);
  }

  @Get('activity')
  getActivity(@Request() req) {
    return this.userService.getUserActivity(req.user.userId);
  }
}