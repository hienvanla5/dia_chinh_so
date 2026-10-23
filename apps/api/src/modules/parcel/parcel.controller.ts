import { Controller, Get, Post, Put, Body, Param, Query, Patch, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
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
  UpdateLandOriginInput,
  UpdateLandOriginSchema,
  UpdateLandTermInput,
  UpdateLandTermSchema,
  GetExpiringParcelsQueryInput,
  GetExpiringParcelsQuerySchema,
  NotifyExpiryInput,
  NotifyExpirySchema,
  CreatePropertyOnLandInput,
  CreatePropertyOnLandSchema,
  ValidateAgriculturalSubdivisionInput,
  ValidateAgriculturalSubdivisionSchema,
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

  @Get('expiring-soon')
  @ApiOperation({ summary: 'Tra cứu danh sách thửa đất sắp hết hạn sử dụng (DCS-02-CN-005, QTD-27)' })
  @ApiQuery({ name: 'daysThreshold', required: false, type: Number })
  @ApiQuery({ name: 'communeCode', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Danh sách thửa đất sắp hết hạn sử dụng kèm khuyến nghị thủ tục' })
  async getExpiringParcels(@Query() query: GetExpiringParcelsQueryInput) {
    const validated = GetExpiringParcelsQuerySchema.parse(query);
    return this.parcelService.getExpiringParcels(validated);
  }

  @Get('properties/:propertyId')
  @ApiOperation({ summary: 'Lấy chi tiết tài sản gắn liền với đất (DCS-02-CN-006)' })
  @ApiResponse({ status: 200, description: 'Chi tiết tài sản gắn liền với đất' })
  async getPropertyById(@Param('propertyId') propertyId: string) {
    return this.parcelService.getPropertyById(propertyId);
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

  @Put(':id/origin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật nguồn gốc sử dụng đất theo Luật Đất đai 2024 (DCS-02-CN-004)' })
  @ApiResponse({ status: 200, description: 'Cập nhật nguồn gốc sử dụng đất thành công' })
  async updateOrigin(
    @Param('id') id: string,
    @Body() body: Omit<UpdateLandOriginInput, 'parcelId'>,
  ) {
    const validated = UpdateLandOriginSchema.parse({ ...body, parcelId: id });
    return this.parcelService.updateLandOrigin(validated);
  }

  @Post(':id/validate-agricultural-subdivision')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Thẩm định điều kiện tách thửa đất nông nghiệp (DCS-02-CN-004, QTD-26)' })
  @ApiResponse({ status: 200, description: 'Kết quả thẩm định hạn mức canh tác đất nông nghiệp' })
  async validateAgriSubdivision(
    @Param('id') id: string,
    @Body() body: Omit<ValidateAgriculturalSubdivisionInput, 'parcelId'>,
  ) {
    const validated = ValidateAgriculturalSubdivisionSchema.parse({ ...body, parcelId: id });
    return this.parcelService.validateAgriculturalSubdivision(validated);
  }
  @Put(':id/term')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật thời hạn sử dụng đất cho thửa đất (DCS-02-CN-005)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thời hạn sử dụng đất thành công' })
  async updateTerm(
    @Param('id') id: string,
    @Body() body: Omit<UpdateLandTermInput, 'parcelId'>,
  ) {
    const validated = UpdateLandTermSchema.parse({ ...body, parcelId: id });
    return this.parcelService.updateLandTerm(validated);
  }

  @Post(':id/notify-expiry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi thông báo cảnh báo thời hạn sử dụng đất cho chủ sở hữu (DCS-02-CN-005, QTD-27)' })
  @ApiResponse({ status: 200, description: 'Phát thông báo cảnh báo thành công' })
  async notifyExpiry(
    @Param('id') id: string,
    @Body() body: Omit<NotifyExpiryInput, 'parcelId'>,
  ) {
    const validated = NotifyExpirySchema.parse({ ...body, parcelId: id });
    return this.parcelService.notifyExpiry(validated);
  }


  @Get(':id/properties')
  @ApiOperation({ summary: 'Lấy danh sách tài sản gắn liền với đất của thửa đất (DCS-02-CN-006)' })
  @ApiResponse({ status: 200, description: 'Danh sách tài sản gắn liền với đất' })
  async getProperties(@Param('id') id: string) {
    return this.parcelService.getPropertiesByParcelId(id);
  }

  @Post(':id/properties')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài sản gắn liền với đất trên thửa (DCS-02-CN-006, QTD-25)' })
  @ApiResponse({ status: 201, description: 'Đăng ký tài sản gắn liền với đất thành công' })
  async createProperty(
    @Param('id') id: string,
    @Body() body: Omit<CreatePropertyOnLandInput, 'parcelId'>,
  ) {
    const validated = CreatePropertyOnLandSchema.parse({ ...body, parcelId: id });
    return this.parcelService.createPropertyOnLand(validated);
  }

  @Delete(':id/properties/:propertyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ghi nhận phá dỡ / xóa tài sản gắn liền với đất (DCS-02-CN-006)' })
  @ApiResponse({ status: 200, description: 'Ghi nhận phá dỡ tài sản thành công' })
  async deleteProperty(
    @Param('id') id: string,
    @Param('propertyId') propertyId: string,
    @Query('officerId') officerId?: string,
  ) {
    return this.parcelService.deletePropertyOnLand(id, propertyId, officerId || 'ADMIN');
  }

}
