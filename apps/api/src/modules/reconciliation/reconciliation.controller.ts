import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReconciliationService } from './reconciliation.service';
import {
  TriggerReconciliationScanInput,
  TriggerReconciliationScanSchema,
  ResolveReconciliationAnomalyInput,
  ResolveReconciliationAnomalySchema,
  AnomalyResolutionStatus,
  ReconciliationSeverity,
} from '@diachinhso/shared';

@ApiTags('Đối soát & Làm sạch CSDL Thửa đất (Parcel Reconciliation)')
@Controller(['parcel-reconciliation', 'api/v1/parcel-reconciliation'])
export class ReconciliationController {
  constructor(private readonly reconciliationService: ReconciliationService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Lấy số liệu thống kê tổng quan đối soát và làm sạch dữ liệu địa chính (DCS-02-CN-008)' })
  @ApiResponse({ status: 200, description: 'Số liệu thống kê sai lệch và tỷ lệ dữ liệu sạch' })
  async getStats() {
    return this.reconciliationService.getStats();
  }

  @Get('reports')
  @ApiOperation({ summary: 'Lấy danh sách báo cáo sai lệch trùng lặp thửa đất (DCS-02-CN-008)' })
  @ApiQuery({ name: 'status', required: false, enum: AnomalyResolutionStatus })
  @ApiQuery({ name: 'severity', required: false, enum: ReconciliationSeverity })
  @ApiQuery({ name: 'communeCode', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Danh sách báo cáo sai lệch' })
  async getReports(
    @Query('status') status?: AnomalyResolutionStatus,
    @Query('severity') severity?: ReconciliationSeverity,
    @Query('communeCode') communeCode?: string,
  ) {
    return this.reconciliationService.getReports(status, severity, communeCode);
  }

  @Post('scan')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kích hoạt phiên quét đối soát tự động phát hiện trùng lặp mã thửa (DCS-02-CN-008, QTD-01, QTD-06)' })
  @ApiResponse({ status: 200, description: 'Kết quả phiên quét đối soát' })
  async triggerScan(@Body() body: TriggerReconciliationScanInput) {
    const validated = TriggerReconciliationScanSchema.parse(body);
    return this.reconciliationService.triggerScan(validated);
  }

  @Post('resolve/:reportId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật kết quả xác minh / giải quyết sai lệch thửa đất (DCS-02-CN-008, QTD-20)' })
  @ApiResponse({ status: 200, description: 'Cập nhật kết quả xử lý thành công' })
  async resolveAnomaly(
    @Param('reportId') reportId: string,
    @Body() body: Omit<ResolveReconciliationAnomalyInput, 'reportId'>,
  ) {
    const validated = ResolveReconciliationAnomalySchema.parse({ ...body, reportId });
    return this.reconciliationService.resolveAnomaly(validated);
  }
}
