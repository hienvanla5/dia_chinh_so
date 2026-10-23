import { Controller, Get, Post, Body, Param, Query, Patch, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ParcelService } from './parcel.service';
import {
  CreateParcelInput,
  DeclareNewParcelInput,
  DeclareNewParcelSchema,
  GenerateNationalCodeInput,
  GenerateNationalCodeSchema,
  ValidateNationalCodeInput,
  ValidateNationalCodeSchema,
  SubdivideParcelInput,
  SubdivideParcelSchema,
  MergeParcelsInput,
  MergeParcelsSchema,
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

  @Post('generate-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sinh Mã định danh thửa đất quốc gia duy nhất (DCS-02-CN-002)' })
  @ApiResponse({ status: 200, description: 'Sinh mã định danh quốc gia và Spatial UID thành công' })
  async generateNationalCode(@Body() body: GenerateNationalCodeInput) {
    const validated = GenerateNationalCodeSchema.parse(body);
    return this.parcelService.generateNationalCode(validated);
  }

  @Post('validate-code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xác thực định dạng và kiểm tra sự tồn tại của Mã định danh thửa đất (DCS-02-CN-002)' })
  @ApiResponse({ status: 200, description: 'Kết quả thẩm tra tính hợp lệ của mã định danh' })
  async validateNationalCode(@Body() body: ValidateNationalCodeInput) {
    const validated = ValidateNationalCodeSchema.parse(body);
    return this.parcelService.validateNationalCode(validated.code);
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

  @Post(':id/subdivide')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tách thửa đất và thiết lập quan hệ phả hệ cha-con (DCS-02-CN-003)' })
  @ApiResponse({ status: 200, description: 'Tách thửa thành công, thửa gốc chuyển HISTORICAL' })
  async subdivideParcel(
    @Param('id') id: string,
    @Body() body: Omit<SubdivideParcelInput, 'parentParcelId'>,
  ) {
    const validated = SubdivideParcelSchema.parse({ ...body, parentParcelId: id });
    return this.parcelService.subdivideParcel(validated);
  }

  @Post('merge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Hợp các thửa đất liền kề thành thửa mới (DCS-02-CN-003)' })
  @ApiResponse({ status: 200, description: 'Hợp thửa thành công, các thửa cũ chuyển HISTORICAL' })
  async mergeParcels(@Body() body: MergeParcelsInput) {
    const validated = MergeParcelsSchema.parse(body);
    return this.parcelService.mergeParcels(validated);
  }

  @Get(':id/lineage')
  @ApiOperation({ summary: 'Truy xuất cây gia phả biến động của thửa đất (Lineage DAG) (DCS-02-CN-003)' })
  @ApiResponse({ status: 200, description: 'Cây phả hệ biến động thửa đất' })
  async getLineage(@Param('id') id: string) {
    return this.parcelService.getParcelLineage(id);
  }
}
