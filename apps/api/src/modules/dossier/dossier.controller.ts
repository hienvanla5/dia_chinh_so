import { Controller, Post, Body, Get, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DossierService } from './dossier.service';
import { CreateDossierInput, ReviewDossierInput, UserRole } from '@diachinhso/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Dịch vụ công & Hồ sơ Biến động Đất đai (Dossiers)')
@Controller('dossiers')
export class DossierController {
  constructor(private readonly dossierService: DossierService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Nộp hồ sơ biến động đất đai trực tuyến (Chủ sử dụng đất / Doanh nghiệp)' })
  async create(@Body() body: CreateDossierInput) {
    return this.dossierService.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách hồ sơ dịch vụ công' })
  async findAll() {
    return this.dossierService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tra cứu tiến độ hồ sơ theo mã ID' })
  async findById(@Param('id') id: string) {
    return this.dossierService.findById(id);
  }

  @Patch('review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMMUNE_OFFICER, UserRole.LAND_REGISTRAR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thẩm định / Xác minh hiện trạng hồ sơ (Cán bộ xã & VPĐKĐĐ)' })
  async review(@Body() body: ReviewDossierInput, @Req() req: any) {
    return this.dossierService.review(body, req.user.userId);
  }
}
