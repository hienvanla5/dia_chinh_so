import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DelegationService } from './delegation.service';
import {
  UserRole,
  DelegationStatus,
  DelegationScope,
  CreateDelegationRequest,
  RevokeDelegationRequest,
  VerifyDelegationAccessRequest,
} from '@diachinhso/shared';

@ApiTags('Timed Delegation - DCS-01-CN-008')
@Controller('delegation')
export class DelegationController {
  constructor(private readonly delegationService: DelegationService) {}

  @Get('list')
  @ApiOperation({ summary: 'Lấy danh sách các văn bản ủy quyền giải quyết hồ sơ địa chính' })
  @ApiResponse({ status: 200, description: 'Danh sách văn bản ủy quyền' })
  async getDelegations(
    @Query('status') status?: DelegationStatus,
    @Query('delegateeId') delegateeId?: string,
  ) {
    return this.delegationService.getDelegations({ status, delegateeId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một văn bản ủy quyền' })
  @ApiResponse({ status: 200, description: 'Chi tiết văn bản ủy quyền' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy văn bản ủy quyền' })
  async getDelegationById(@Param('id') id: string) {
    return this.delegationService.getDelegationById(id);
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ban hành văn bản ủy quyền giải quyết hồ sơ có thời hạn' })
  @ApiResponse({ status: 200, description: 'Tạo văn bản ủy quyền thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc thời gian sai' })
  @ApiResponse({ status: 403, description: 'Từ chối quyền do không phải Lãnh đạo' })
  async createDelegation(
    @Body() body: CreateDelegationRequest,
    @Request() req?: any,
  ) {
    const delegatorUser = req?.user || {
      id: 'OFF-HN-VPDK-LEAD',
      fullName: 'Trần Đình Trọng',
      role: UserRole.LAND_REGISTRAR,
    };
    return this.delegationService.createDelegation(body, delegatorUser);
  }

  @Post('revoke')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thu hồi văn bản ủy quyền trước thời hạn' })
  @ApiResponse({ status: 200, description: 'Thu hồi ủy quyền thành công' })
  @ApiResponse({ status: 403, description: 'Từ chối quyền' })
  async revokeDelegation(
    @Body() body: RevokeDelegationRequest,
    @Request() req?: any,
  ) {
    const user = req?.user || {
      id: 'OFF-HN-VPDK-LEAD',
      fullName: 'Trần Đình Trọng',
      role: UserRole.LAND_REGISTRAR,
    };
    return this.delegationService.revokeDelegation(body, user);
  }

  @Post('verify-access')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kiểm tra thẩm quyền ủy quyền của cán bộ khi thực hiện ký duyệt' })
  @ApiResponse({ status: 200, description: 'Kết quả thẩm quyền ủy quyền' })
  async verifyDelegationAccess(@Body() body: VerifyDelegationAccessRequest) {
    return this.delegationService.verifyDelegationAccess(body);
  }

  @Get('audit/logs')
  @ApiOperation({ summary: 'Lấy danh sách nhật ký kiểm toán ủy quyền' })
  @ApiResponse({ status: 200, description: 'Nhật ký kiểm toán' })
  async getAuditLogs() {
    return this.delegationService.getAuditLogs();
  }
}
