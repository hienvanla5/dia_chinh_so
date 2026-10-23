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
import { NationalSyncService } from './national-sync.service';
import {
  TriggerNationalSyncInput,
  TriggerNationalSyncSchema,
  QueryNationalSyncEventsInput,
  QueryNationalSyncEventsSchema,
} from '@diachinhso/shared';

@ApiTags('Đồng bộ CSDL Đất đai Quốc gia (National Sync)')
@Controller(['national-sync', 'api/v1/national-sync'])
export class NationalSyncController {
  constructor(private readonly syncService: NationalSyncService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Lấy số liệu thống kê tình trạng đồng bộ thời gian thực CSDL Quốc gia (DCS-02-CN-007)' })
  @ApiResponse({ status: 200, description: 'Thống kê kết nối và tỷ lệ đồng bộ NDXP' })
  async getStats() {
    return this.syncService.getStats();
  }

  @Get('events')
  @ApiOperation({ summary: 'Tra cứu danh sách sự kiện đồng bộ với CSDL Đất đai Quốc gia (DCS-02-CN-007)' })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'eventType', required: false, type: String })
  @ApiQuery({ name: 'parcelNationalCode', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Danh sách sự kiện đồng bộ' })
  async queryEvents(@Query() query: QueryNationalSyncEventsInput) {
    const validated = QueryNationalSyncEventsSchema.parse(query);
    return this.syncService.queryEvents(validated);
  }

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kích hoạt đồng bộ thời gian thực thửa đất về CSDL Đất đai Quốc gia qua NDXP (DCS-02-CN-007)' })
  @ApiResponse({ status: 200, description: 'Kết quả giao dịch đồng bộ qua NDXP' })
  async triggerSync(@Body() body: TriggerNationalSyncInput) {
    const validated = TriggerNationalSyncSchema.parse(body);
    return this.syncService.triggerSync(validated);
  }

  @Post('retry/:eventId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Thử lại sự kiện đồng bộ bị lỗi qua Trục liên thông NDXP (DCS-02-CN-007)' })
  @ApiResponse({ status: 200, description: 'Kết quả thử lại đồng bộ' })
  async retryEvent(
    @Param('eventId') eventId: string,
    @Body() body: { officerId: string },
  ) {
    return this.syncService.retryEvent(eventId, body.officerId || 'ADMIN');
  }
}
