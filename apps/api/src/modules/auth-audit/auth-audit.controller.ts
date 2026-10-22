import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AuthAuditService } from './auth-audit.service';
import {
  QueryAuthAuditLogsInput,
  QueryAnomalyAlertsInput,
  ResolveAnomalyAlertInput,
  SimulateAuthEventInput,
  QueryAuthAuditLogsSchema,
  QueryAnomalyAlertsSchema,
  ResolveAnomalyAlertSchema,
  SimulateAuthEventSchema,
} from '@diachinhso/shared';

@ApiTags('auth-audit')
@Controller('api/v1/auth-audit')
export class AuthAuditController {
  constructor(private readonly authAuditService: AuthAuditService) {}

  @Get('logs')
  @ApiOperation({ summary: 'Truy vấn sổ cái nhật ký xác thực liên kết chuỗi băm (QTD-20)' })
  @ApiResponse({ status: 200, description: 'Danh sách nhật ký xác thực có phân trang' })
  async getAuditLogs(@Query() query: any) {
    const parsedQuery: QueryAuthAuditLogsInput = {
      actorId: query.actorId,
      role: query.role,
      status: query.status,
      isAnomaly: query.isAnomaly !== undefined ? query.isAnomaly === 'true' : undefined,
      fromDate: query.fromDate,
      toDate: query.toDate,
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 20,
    };
    return this.authAuditService.queryAuditLogs(parsedQuery);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Truy vấn danh mục cảnh báo an ninh phát hiện dị thường' })
  @ApiResponse({ status: 200, description: 'Danh sách các cảnh báo an ninh hệ thống' })
  async getAnomalyAlerts(@Query() query: any) {
    const parsedQuery: QueryAnomalyAlertsInput = {
      severity: query.severity,
      status: query.status,
      detectionType: query.detectionType,
    };
    return this.authAuditService.queryAnomalyAlerts(parsedQuery);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy số liệu thống kê trung tâm điều hành giám sát an ninh (SOC)' })
  @ApiResponse({ status: 200, description: 'Số liệu tổng quan về sự kiện, cảnh báo và tính toàn vẹn chuỗi' })
  async getStats() {
    return this.authAuditService.getAuditStats();
  }

  @Get('verify-chain')
  @ApiOperation({ summary: 'Kiểm tra tính toàn vẹn của chuỗi băm SHA-256 sổ cái kiểm toán (QTD-20)' })
  @ApiResponse({ status: 200, description: 'Kết quả kiểm tra toàn vẹn chuỗi băm bất biến' })
  async verifyChain() {
    return this.authAuditService.verifyAuditChain();
  }

  @Post('simulate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mô phỏng sự kiện xác thực để kích hoạt thuật toán phát hiện dị thường' })
  @ApiResponse({ status: 200, description: 'Kết quả phân tích và tạo khối kiểm toán mới' })
  async simulateAuthEvent(@Body() body: SimulateAuthEventInput) {
    const validated = SimulateAuthEventSchema.parse(body);
    return this.authAuditService.simulateAuthEvent(validated);
  }

  @Post('alerts/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xử lý cảnh báo an ninh (Khóa tài khoản, Bác bỏ báo động giả, Step-Up 2FA)' })
  @ApiResponse({ status: 200, description: 'Xử lý cảnh báo thành công' })
  async resolveAlert(@Body() body: ResolveAnomalyAlertInput) {
    const validated = ResolveAnomalyAlertSchema.parse(body);
    return this.authAuditService.resolveAnomalyAlert(validated);
  }
}
