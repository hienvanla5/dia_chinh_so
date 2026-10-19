import { Controller, Post, Body, Get, UseGuards, Req, Headers, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  CitizenSendOtpInput,
  CitizenVerifyOtpInput,
  OfficerLoginInput,
} from '@diachinhso/shared';

@ApiTags('Xác thực & Định danh Số (Auth & IdP)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('citizen/send-otp')
  @ApiOperation({
    summary: '[DCS-01-CN-001] Gửi mã xác thực OTP SMS đến số điện thoại công dân (Hỗ trợ Mock Sandbox)',
  })
  @ApiResponse({
    status: 200,
    description: 'Gửi OTP thành công (kèm mockOtp trong môi trường sandbox)',
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu CCCD hoặc số điện thoại không hợp lệ',
  })
  @ApiResponse({
    status: 403,
    description: 'Tài khoản công dân bị khóa hoặc vi phạm quy tắc thẩm quyền (QTD-07)',
  })
  async sendCitizenOtp(@Body() body: CitizenSendOtpInput) {
    return this.authService.sendCitizenOtp(body);
  }

  @Post('citizen/verify-otp')
  @ApiOperation({
    summary: '[DCS-01-CN-001] Xác thực OTP SMS và đăng nhập Cổng Định danh Số Công dân',
  })
  @ApiResponse({
    status: 200,
    description: 'Xác thực thành công, trả về JWT Access Token và mã băm kiểm toán SHA-256',
  })
  @ApiResponse({
    status: 400,
    description: 'Mã OTP không chính xác, đã hết hạn hoặc không tồn tại',
  })
  @ApiResponse({
    status: 403,
    description: 'Tài khoản công dân bị tạm khóa theo quy tắc QTD-07',
  })
  async verifyCitizenOtp(
    @Body() body: CitizenVerifyOtpInput,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.verifyCitizenOtp(body, { ipAddress, userAgent });
  }

  @Post('officer-login')
  @ApiOperation({ summary: 'Đăng nhập Cán bộ nghiệp vụ (Địa chính, VPĐKĐĐ, Công chứng, Thanh tra)' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về JWT Token' })
  async officerLogin(@Body() body: OfficerLoginInput) {
    return this.authService.officerLogin(body.username, body.password, body.role);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin tài khoản hiện tại từ Access Token' })
  async getProfile(@Req() req: any) {
    return req.user;
  }

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[DCS-01-CN-001] Lấy thông tin Ví Sổ Đỏ Số của công dân đang đăng nhập' })
  async getCitizenWallet(@Req() req: any) {
    return this.authService.getProfileWithWallet(req.user.sub || req.user.id);
  }
}
