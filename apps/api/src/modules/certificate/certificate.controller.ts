import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CertificateService } from './certificate.service';
import { UserRole } from '@diachinhso/shared';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Sổ Đỏ Số & Giấy Chứng Nhận Điện Tử (Certificates)')
@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('issue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.LAND_REGISTRAR, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ký số phát hành Sổ Đỏ Số điện tử (Văn phòng ĐKĐĐ)' })
  async issueCertificate(
    @Body()
    body: {
      parcelId: string;
      certificateNumber: string;
      serialNumber: string;
      signerName: string;
      signerTitle: string;
      pdfUrl: string;
    },
  ) {
    return this.certificateService.issueCertificate(body);
  }

  @Get('verify/:qrHash')
  @ApiOperation({ summary: 'Quét mã QR / Xác thực tính toàn vẹn của Sổ Đỏ Số (Chống giả mạo)' })
  async verifyByQrHash(@Param('qrHash') qrHash: string) {
    return this.certificateService.verifyByQrHash(qrHash);
  }

  @Get('parcel/:parcelId')
  @ApiOperation({ summary: 'Xem thông tin Giấy chứng nhận của thửa đất' })
  async findByParcelId(@Param('parcelId') parcelId: string) {
    return this.certificateService.findByParcelId(parcelId);
  }
}
