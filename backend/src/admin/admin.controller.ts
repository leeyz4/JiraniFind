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
} from '@nestjs/common';
import { AdminService, AdminDashboardStats } from './admin.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import {
  UpdateItemStatusDto,
  UpdateClaimStatusDto,
} from './dto/update-status.dto';
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

  @Delete('users/:id')
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.deleteUser(id);
  }
}