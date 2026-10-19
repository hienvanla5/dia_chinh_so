import { Controller, Post, Body, Param, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LockService } from './lock.service';
import { CreateTransactionLockInput, UserRole } from '@diachinhso/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Khóa Giao dịch Thời gian thực (Real-time Transaction Lock)')
@Controller('locks')
export class LockController {
  constructor(private readonly lockService: LockService) {}

  @Post('acquire')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NOTARY_BANK, UserRole.LAND_REGISTRAR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khóa phiên giao dịch thửa đất (Chống thế chấp/công chứng trùng)' })
  async acquireLock(@Body() body: CreateTransactionLockInput, @Req() req: any) {
    return this.lockService.acquireLock(body, req.user.userId, req.user.fullName || req.user.username);
  }

  @Post(':lockId/release')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.NOTARY_BANK, UserRole.LAND_REGISTRAR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mở khóa phiên giao dịch (Sau khi ký công chứng/tín dụng hoặc hủy)' })
  async releaseLock(@Param('lockId') lockId: string, @Req() req: any) {
    return this.lockService.releaseLock(lockId, req.user.userId);
  }

  @Get('parcel/:parcelId')
  @ApiOperation({ summary: 'Kiểm tra trạng thái khóa giao dịch hiện hành của một thửa đất' })
  async getActiveLock(@Param('parcelId') parcelId: string) {
    return this.lockService.getActiveLock(parcelId);
  }
}
