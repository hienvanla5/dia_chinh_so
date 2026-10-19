import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CitizenAuthInput, OfficerLoginInput } from '@diachinhso/shared';

@ApiTags('Xác thực & Danh tính (Auth & IdP)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('citizen-login')
  @ApiOperation({ summary: 'Đăng nhập định danh Người dân / Doanh nghiệp (Mock Sandbox IdP)' })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công, trả về JWT Token' })
  async citizenLogin(@Body() body: CitizenAuthInput) {
    return this.authService.citizenLogin(body.citizenId, body.fullName, body.phoneNumber);
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
}
