import {
  Controller,
  Get,
  Post,
  Body,
  Ip,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SessionSecurityService } from './session-security.service';
import {
  StepUp2FaChallengeRequest,
  VerifyStepUp2FaRequest,
  UnlockSessionRequest,
  TerminateSessionRequest,
} from '@diachinhso/shared';

@ApiTags('Quản lý Phiên làm việc & Bảo mật Xác thực 2FA (DCS-01-CN-005)')
@Controller('api/v1/session-security')
export class SessionSecurityController {
  constructor(private readonly sessionSecurityService: SessionSecurityService) {}

  @Get('sessions')
  @ApiOperation({
    summary: 'Tra cứu danh sách các phiên làm việc đang hoạt động',
    description: 'Giám sát phiên làm việc, thiết bị đăng nhập, địa chỉ IP và thời gian hết hạn (15 phút)',
  })
  @ApiResponse({ status: 200, description: 'Danh sách phiên làm việc' })
  async getSessions(@Query('userId') userId?: string) {
    return this.sessionSecurityService.getActiveSessions(userId);
  }

  @Post('lock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tự động hoặc chủ động khóa màn hình làm việc sau 15 phút không tương tác',
    description: 'Bảo vệ phiên làm việc khi cán bộ rời khỏi vị trí công tác',
  })
  @ApiResponse({ status: 200, description: 'Khóa màn hình thành công' })
  async lockScreen(@Body('sessionId') sessionId: string, @Ip() ipAddress: string) {
    return this.sessionSecurityService.lockScreen(sessionId, { ipAddress });
  }

  @Post('unlock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mở khóa phiên làm việc bằng mã PIN hoặc 2FA (Làm mới phiên 15 phút)',
    description: 'Xác thực lại danh tính cán bộ để tiếp tục phiên làm việc, tự động khóa nếu sai quá 3 lần (QTD-22)',
  })
  @ApiResponse({ status: 200, description: 'Mở khóa phiên thành công' })
  @ApiResponse({ status: 400, description: 'Mã mở khóa sai hoặc dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Phiên bị khóa an ninh do nhập sai quá 3 lần (QTD-22)' })
  async unlockSession(@Body() body: UnlockSessionRequest, @Ip() ipAddress: string) {
    return this.sessionSecurityService.unlockSession(body, { ipAddress });
  }

  @Post('step-up/challenge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Yêu cầu xác thực 2 lớp nâng cao (Step-Up 2FA) khi thực hiện thao tác nhạy cảm',
    description: 'Tạo mã thử thách 2FA cho các thao tác ký duyệt sổ đỏ, đổi ranh giới, trích xuất dữ liệu',
  })
  @ApiResponse({ status: 200, description: 'Tạo mã thử thách 2FA thành công' })
  @ApiResponse({ status: 403, description: 'Phát hiện IP bất thường hoặc phiên không hợp lệ (QTD-22)' })
  async requestStepUpChallenge(@Body() body: StepUp2FaChallengeRequest, @Ip() ipAddress: string) {
    return this.sessionSecurityService.requestStepUpChallenge(body, { ipAddress });
  }

  @Post('step-up/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xác nhận mã 2FA nâng cao và cấp Token ủy quyền thao tác nhạy cảm (5 phút)',
    description: 'Kiểm tra mã TOTP/SMS, cấp stepUpToken và ghi nhật ký kiểm toán SHA-256',
  })
  @ApiResponse({ status: 200, description: 'Xác thực 2FA thành công, đã cấp stepUpToken' })
  @ApiResponse({ status: 400, description: 'Mã 2FA sai hoặc hết hạn' })
  @ApiResponse({ status: 403, description: 'Nhập sai quá 3 lần, phiên bị khóa theo QTD-22' })
  async verifyStepUp2Fa(@Body() body: VerifyStepUp2FaRequest, @Ip() ipAddress: string) {
    return this.sessionSecurityService.verifyStepUp2Fa(body, { ipAddress });
  }

  @Post('terminate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Chấm dứt phiên làm việc từ xa (Remote Session Termination)',
    description: 'Đăng xuất hoặc buộc hủy phiên làm việc đáng ngờ',
  })
  @ApiResponse({ status: 200, description: 'Chấm dứt phiên thành công' })
  async terminateSession(@Body() body: TerminateSessionRequest, @Ip() ipAddress: string) {
    return this.sessionSecurityService.terminateSession(body, { ipAddress });
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'Tra cứu danh sách cảnh báo vi phạm an toàn thông tin (QTD-22)',
    description: 'Ghi nhận các cảnh báo đăng nhập IP bất thường hoặc nhập sai mã 2FA quá ngưỡng',
  })
  @ApiResponse({ status: 200, description: 'Danh sách cảnh báo an ninh' })
  async getAlerts() {
    return this.sessionSecurityService.getSecurityAlerts();
  }
}
