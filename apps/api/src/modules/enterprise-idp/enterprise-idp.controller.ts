import { Controller, Get, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EnterpriseIdpService } from './enterprise-idp.service';
import {
  EnterpriseLoginRequest,
  AssignEnterpriseStaffRequest,
} from '@diachinhso/shared';

@ApiTags('Enterprise IdP - DCS-01-CN-009')
@Controller('enterprise-idp')
export class EnterpriseIdpController {
  constructor(private readonly enterpriseIdpService: EnterpriseIdpService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập Cổng Định danh Doanh nghiệp qua MST và Chữ ký số / OTP' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về token và thông tin doanh nghiệp' })
  @ApiResponse({ status: 400, description: 'Mã số thuế không đúng định dạng' })
  @ApiResponse({ status: 401, description: 'Xác thực chữ ký số hoặc OTP không thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy doanh nghiệp' })
  async login(@Body() body: EnterpriseLoginRequest) {
    return this.enterpriseIdpService.login(body);
  }

  @Get('profile/:enterpriseId')
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ doanh nghiệp, thửa đất dự án và danh sách nhân sự' })
  @ApiResponse({ status: 200, description: 'Thông tin hồ sơ doanh nghiệp' })
  async getProfile(@Param('enterpriseId') enterpriseId: string) {
    return this.enterpriseIdpService.getEnterpriseProfile(enterpriseId);
  }

  @Get('parcels/:enterpriseId')
  @ApiOperation({ summary: 'Lấy danh mục các thửa đất dự án doanh nghiệp đang quản lý' })
  @ApiResponse({ status: 200, description: 'Danh mục thửa đất dự án' })
  async getProjectParcels(@Param('enterpriseId') enterpriseId: string) {
    return this.enterpriseIdpService.getProjectParcels(enterpriseId);
  }

  @Post('staff/assign')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Phân quyền nhân viên phụ trách hồ sơ dự án đất đai' })
  @ApiResponse({ status: 200, description: 'Phân quyền thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu nhân viên không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Nhân viên đã được phân quyền trước đó' })
  async assignStaff(@Body() body: AssignEnterpriseStaffRequest) {
    return this.enterpriseIdpService.assignStaff(body);
  }

  @Delete('staff/:enterpriseId/:staffId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thu hồi quyền hạn xử lý hồ sơ của nhân viên' })
  @ApiResponse({ status: 200, description: 'Thu hồi quyền thành công' })
  async removeStaff(
    @Param('enterpriseId') enterpriseId: string,
    @Param('staffId') staffId: string,
  ) {
    return this.enterpriseIdpService.removeStaff(enterpriseId, staffId);
  }

  @Get('audit/logs')
  @ApiOperation({ summary: 'Lấy danh sách nhật ký kiểm toán định danh doanh nghiệp' })
  @ApiResponse({ status: 200, description: 'Nhật ký kiểm toán' })
  async getAuditLogs() {
    return this.enterpriseIdpService.getAuditLogs();
  }
}
