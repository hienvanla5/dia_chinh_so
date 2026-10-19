import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Hệ thống (System Health)')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Kiểm tra trạng thái hoạt động của hệ thống API Địa Chính Số' })
  getHealth() {
    return this.appService.getSystemStatus();
  }
}
