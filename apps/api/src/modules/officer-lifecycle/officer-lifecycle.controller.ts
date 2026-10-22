import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OfficerLifecycleService } from './officer-lifecycle.service';
import {
  UserRole,
  OfficerAccountStatus,
  DeactivateOfficerAccountRequest,
  TransferDossiersRequest,
  ReactivateOfficerAccountRequest,
} from '@diachinhso/shared';

@ApiTags('Officer Lifecycle - DCS-01-CN-006')
@Controller('officer-lifecycle')
export class OfficerLifecycleController {
  constructor(private readonly officerLifecycleService: OfficerLifecycleService) {}

  @Get('officers')
  @ApiOperation({ summary: 'Lấy danh sách tài khoản cán bộ công vụ kèm bộ lọc đơn vị, trạng thái và từ khóa' })
  @ApiResponse({ status: 200, description: 'Danh sách cán bộ công vụ' })
  async getOfficers(
    @Query('unitCode') unitCode?: string,
    @Query('role') role?: UserRole,
    @Query('status') status?: OfficerAccountStatus,
    @Query('search') search?: string,
  ) {
    return this.officerLifecycleService.getOfficers({ unitCode, role, status, search });
  }

  @Get('officers/:id')
  @ApiOperation({ summary: 'Lấy thông tin chi tiết một tài khoản cán bộ' })
  @ApiResponse({ status: 200, description: 'Chi tiết hồ sơ cán bộ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy cán bộ' })
  async getOfficerById(@Param('id') id: string) {
    return this.officerLifecycleService.getOfficerById(id);
  }

  @Get('officers/:id/eligible-transferees')
  @ApiOperation({ summary: 'Lấy danh sách các cán bộ đủ điều kiện nhận bàn giao hồ sơ' })
  @ApiResponse({ status: 200, description: 'Danh sách cán bộ đủ điều kiện nhận bàn giao' })
  async getEligibleTransferees(@Param('id') id: string) {
    return this.officerLifecycleService.getEligibleTransferees(id);
  }

  @Post('deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khóa / Vô hiệu hóa tài khoản công vụ khi điều chuyển, kỷ luật hoặc thôi việc' })
  @ApiResponse({ status: 200, description: 'Vô hiệu hóa thành công và bàn giao hồ sơ dở dang' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc thiếu cán bộ nhận bàn giao' })
  @ApiResponse({ status: 403, description: 'Từ chối truy cập do không đủ thẩm quyền Quản trị viên' })
  async deactivateAccount(
    @Body() body: DeactivateOfficerAccountRequest,
    @Request() req?: any,
  ) {
    const adminUser = req?.user || {
      id: 'ADMIN-SYS-001',
      username: 'quantri.hethong',
      role: UserRole.ADMIN,
    };
    return this.officerLifecycleService.deactivateAccount(body, adminUser);
  }

  @Post('transfer-dossiers')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chuyển giao hồ sơ địa chính giữa 2 cán bộ công vụ' })
  @ApiResponse({ status: 200, description: 'Chuyển giao hồ sơ thành công' })
  async transferDossiers(
    @Body() body: TransferDossiersRequest,
    @Request() req?: any,
  ) {
    const adminUser = req?.user || {
      id: 'ADMIN-SYS-001',
      username: 'quantri.hethong',
      role: UserRole.ADMIN,
    };
    return this.officerLifecycleService.transferDossiers(body, adminUser);
  }

  @Post('reactivate')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khôi phục hoạt động cho tài khoản cán bộ công vụ' })
  @ApiResponse({ status: 200, description: 'Khôi phục tài khoản thành công' })
  async reactivateAccount(
    @Body() body: ReactivateOfficerAccountRequest,
    @Request() req?: any,
  ) {
    const adminUser = req?.user || {
      id: 'ADMIN-SYS-001',
      username: 'quantri.hethong',
      role: UserRole.ADMIN,
    };
    return this.officerLifecycleService.reactivateAccount(body, adminUser);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Lấy danh sách nhật ký kiểm toán điều chuyển và thu hồi quyền' })
  @ApiResponse({ status: 200, description: 'Nhật ký kiểm toán' })
  async getAuditLogs() {
    return this.officerLifecycleService.getAuditLogs();
  }
}
