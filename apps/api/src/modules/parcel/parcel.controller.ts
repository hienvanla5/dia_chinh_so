import { Controller, Get, Post, Body, Param, Query, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ParcelService } from './parcel.service';
import { CreateParcelInput, ParcelLegalStatus, UserRole } from '@diachinhso/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Quản lý Thửa đất & Bản đồ số (Parcels)')
@Controller('parcels')
export class ParcelController {
  constructor(private readonly parcelService: ParcelService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thửa đất (kèm bộ lọc xã/phường và trạng thái pháp lý)' })
  @ApiQuery({ name: 'communeId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ParcelLegalStatus })
  async findAll(@Query('communeId') communeId?: string, @Query('status') status?: ParcelLegalStatus) {
    return this.parcelService.findAll(communeId, status);
  }

  @Get('by-code/:nationalCode')
  @ApiOperation({ summary: 'Tra cứu thửa đất theo Mã định danh quốc gia (15 ký tự)' })
  async findByNationalCode(@Param('nationalCode') nationalCode: string) {
    return this.parcelService.findByNationalCode(nationalCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tra cứu chi tiết thửa đất theo ID' })
  async findById(@Param('id') id: string) {
    return this.parcelService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMMUNE_OFFICER, UserRole.LAND_REGISTRAR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng ký mới thửa đất (Dành cho Cán bộ địa chính & VPĐKĐĐ)' })
  async create(@Body() body: CreateParcelInput) {
    return this.parcelService.create(body);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMMUNE_OFFICER, UserRole.LAND_REGISTRAR, UserRole.NOTARY_BANK, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật trạng thái pháp lý của thửa đất' })
  async updateStatus(@Param('id') id: string, @Body('status') status: ParcelLegalStatus) {
    return this.parcelService.updateLegalStatus(id, status);
  }
}
