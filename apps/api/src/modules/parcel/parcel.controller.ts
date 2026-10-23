import { Controller, Get, Post, Body, Param, Query, Patch, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ParcelService } from './parcel.service';
import {
  CreateParcelInput,
  DeclareNewParcelInput,
  DeclareNewParcelSchema,
  ParcelLegalStatus,
  UserRole,
} from '@diachinhso/shared';

@ApiTags('Quản lý Thửa đất & Bản đồ số (Parcels)')
@Controller(['parcels', 'api/v1/parcels'])
export class ParcelController {
  constructor(private readonly parcelService: ParcelService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thửa đất (kèm bộ lọc xã/phường và trạng thái pháp lý)' })
  @ApiQuery({ name: 'communeId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ParcelLegalStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('communeId') communeId?: string,
    @Query('status') status?: ParcelLegalStatus,
    @Query('search') search?: string,
  ) {
    return this.parcelService.findAll(communeId, status, search);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Lấy số liệu thống kê tổng quan quản lý thửa đất' })
  async getStats() {
    return this.parcelService.getSummaryStats();
  }

  @Get('by-code/:nationalCode')
  @ApiOperation({ summary: 'Tra cứu thửa đất theo Mã định danh quốc gia' })
  async findByNationalCode(@Param('nationalCode') nationalCode: string) {
    return this.parcelService.findByNationalCode(nationalCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tra cứu chi tiết thửa đất theo ID' })
  async findById(@Param('id') id: string) {
    return this.parcelService.findById(id);
  }

  @Post('declare')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Khai báo thông tin thuộc tính thửa đất mới (DCS-02-CN-001)' })
  @ApiResponse({ status: 201, description: 'Khai báo thửa đất mới thành công, chuyển trạng thái PENDING_APPRAISAL' })
  async declareNewParcel(@Body() body: DeclareNewParcelInput) {
    const validated = DeclareNewParcelSchema.parse(body);
    return this.parcelService.declareNewParcel(validated);
  }

  @Post()
  @ApiOperation({ summary: 'Đăng ký mới thửa đất (Dành cho Cán bộ địa chính & VPĐKĐĐ)' })
  async create(@Body() body: CreateParcelInput) {
    return this.parcelService.create(body);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái pháp lý của thửa đất' })
  async updateStatus(@Param('id') id: string, @Body('status') status: ParcelLegalStatus) {
    return this.parcelService.updateLegalStatus(id, status);
  }
}
