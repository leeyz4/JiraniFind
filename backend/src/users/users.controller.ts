import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

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

  @Put('password')
  changePassword(@Body() dto: ChangePasswordDto, @Request() req) {
    return this.userService.changePassword(req.user.userId, dto);
  }

  @Get('activity')
  getActivity(@Request() req) {
    return this.userService.getUserActivity(req.user.userId);
  }
}