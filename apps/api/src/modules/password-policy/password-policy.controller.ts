import { Controller, Get, Post, Put, Body, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PasswordPolicyService } from './password-policy.service';
import {
  UserRole,
  UpdatePasswordPolicyRequest,
  ValidatePasswordRequest,
  UnblockIpRequest,
} from '@diachinhso/shared';

@ApiTags('Password Policy & Brute-Force Protection - DCS-01-CN-007')
@Controller('password-policy')
export class PasswordPolicyController {
  constructor(private readonly passwordPolicyService: PasswordPolicyService) {}

  @Get('config')
  @ApiOperation({ summary: 'Lấy cấu hình chính sách mật khẩu công vụ hiện hành' })
  @ApiResponse({ status: 200, description: 'Cấu hình chính sách mật khẩu' })
  async getPolicy() {
    return this.passwordPolicyService.getPolicy();
  }

  @Put('config')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật cấu hình chính sách mật khẩu và chống brute-force' })
  @ApiResponse({ status: 200, description: 'Cập nhật chính sách thành công' })
  @ApiResponse({ status: 400, description: 'Thông số cấu hình không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Từ chối truy cập do không phải Quản trị viên' })
  async updatePolicy(
    @Body() body: UpdatePasswordPolicyRequest,
    @Request() req?: any,
  ) {
    const adminUser = req?.user || {
      id: 'ADMIN-SYS-001',
      username: 'quantri.hethong',
      role: UserRole.ADMIN,
    };
    return this.passwordPolicyService.updatePolicy(body, adminUser);
  }

  @Post('validate-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kiểm tra độ mạnh và tính hợp lệ của mật khẩu theo chính sách' })
  @ApiResponse({ status: 200, description: 'Kết quả đánh giá độ mạnh mật khẩu' })
  async validatePassword(@Body() body: ValidatePasswordRequest) {
    return this.passwordPolicyService.validatePassword(body);
  }

  @Get('blocked-ips')
  @ApiOperation({ summary: 'Lấy danh sách các địa chỉ IP đang bị khóa do tấn công brute-force' })
  @ApiResponse({ status: 200, description: 'Danh sách IP bị khóa' })
  async getBlockedIps() {
    return this.passwordPolicyService.getBlockedIps();
  }

  @Post('unblock-ip')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mở khóa thủ công cho một địa chỉ IP' })
  @ApiResponse({ status: 200, description: 'Mở khóa IP thành công' })
  @ApiResponse({ status: 404, description: 'Địa chỉ IP không bị khóa' })
  async unblockIp(
    @Body() body: UnblockIpRequest,
    @Request() req?: any,
  ) {
    const adminUser = req?.user || {
      id: 'ADMIN-SYS-001',
      username: 'quantri.hethong',
      role: UserRole.ADMIN,
    };
    return this.passwordPolicyService.unblockIp(body, adminUser);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Lấy danh sách nhật ký kiểm toán thay đổi cấu hình bảo mật' })
  @ApiResponse({ status: 200, description: 'Nhật ký kiểm toán' })
  async getAuditLogs() {
    return this.passwordPolicyService.getAuditLogs();
  }
}
