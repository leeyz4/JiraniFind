import {
  Controller,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseUUIDPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { AdminService, AdminDashboardStats } from './admin.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import {
  UpdateItemStatusDto,
  UpdateClaimStatusDto,
} from './dto/update-status.dto';
import { AdminUpdateUserDto } from './dto/update-admin-user.dto';
import { ItemsService } from '../items/items.service';
import { ClaimsService } from '../claims/claims.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private itemsService: ItemsService,
    private claimsService: ClaimsService,
  ) {}

  // === DASHBOARD ===
  @Get('dashboard')
  async getDashboard(): Promise<{
    stats: AdminDashboardStats;
    pendingItems: any;
    pendingClaims: any;
  }> {
    const [stats, pendingItems, pendingClaims] = await Promise.all([
      this.adminService.getDashboardStats(),
      this.adminService.getPendingItems(),
      this.adminService.getPendingClaims(),
    ]);

    return { stats, pendingItems, pendingClaims };
  }

  // === ITEMS MANAGEMENT ===
  @Get('pending-items')
  getPendingItems() {
    return this.adminService.getPendingItems();
  }

  @Put('items/:id/approve')
  approveItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateItemStatusDto,
  ) {
    return this.itemsService.updateStatus(id, dto, 'admin');
  }

  @Put('items/:id/reject')
  rejectItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateItemStatusDto,
  ) {
    return this.itemsService.updateStatus(id, dto, 'admin');
  }

  // === CLAIMS MANAGEMENT ===
  @Get('pending-claims')
  getPendingClaims(@Query('status') status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.adminService.getPendingClaims(status);
  }

  @Put('claims/:id/approve')
  approveClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClaimStatusDto,
  ) {
    return this.claimsService.updateStatus(id, dto, 'admin');
  }

  @Put('claims/:id/reject')
  rejectClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClaimStatusDto,
  ) {
    return this.claimsService.updateStatus(id, dto, 'admin');
  }

  // === USERS MANAGEMENT ===
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Put('users/:id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.adminService.updateUser(id, dto);
  }

  @Delete('users/:id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: { userId: string } }) {
    if (id === req.user.userId) {
      throw new BadRequestException('You cannot delete your own account.');
    }
    return this.adminService.deleteUser(id);
  }
}