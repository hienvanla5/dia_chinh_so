import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Ip,
  Req,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DigitalSignatureService } from './digital-signature.service';
import {
  SignDossierApprovalRequest,
  VerifyDigitalSignatureRequest,
  UserRole,
} from '@diachinhso/shared';

@ApiTags('Tích hợp Chữ ký số Chuyên dùng Công vụ & SmartCA (DCS-01-CN-004)')
@Controller('api/v1/digital-signature')
export class DigitalSignatureController {
  constructor(private readonly digitalSignatureService: DigitalSignatureService) {}

  @Get('certificates')
  @ApiOperation({
    summary: 'Tra cứu danh sách chứng thư số chuyên dùng công vụ & SmartCA khả dụng',
    description: 'Cung cấp danh bạ chứng thư số của lãnh đạo Văn phòng ĐKĐĐ và các nhà cung cấp SmartCA',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh sách chứng thư số thành công' })
  async getCertificates(@Query('role') role?: UserRole) {
    return this.digitalSignatureService.getAvailableCertificates(role);
  }

  @Get('ocsp-check/:serialNumber')
  @ApiOperation({
    summary: 'Kiểm tra trực tuyến trạng thái thu hồi chứng thư số qua giao thức OCSP (QTD-28)',
    description: 'Xác thực trạng thái hiệu lực (VALID, REVOKED, EXPIRED) của chứng thư số trước khi thực hiện ký duyệt',
  })
  @ApiResponse({ status: 200, description: 'Kết quả kiểm tra trực tuyến OCSP' })
  @ApiResponse({ status: 400, description: 'Số serial không hợp lệ hoặc không tồn tại' })
  async checkOcsp(@Param('serialNumber') serialNumber: string) {
    return this.digitalSignatureService.checkOcspStatus(serialNumber);
  }

  @Get('pending-dossiers')
  @ApiOperation({
    summary: 'Lấy danh sách hồ sơ địa chính chờ ký số phê duyệt',
    description: 'Cung cấp danh sách hồ sơ dịch vụ công đã qua bước thẩm định, sẵn sàng ký duyệt',
  })
  @ApiResponse({ status: 200, description: 'Danh sách hồ sơ chờ ký số' })
  async getPendingDossiers() {
    return this.digitalSignatureService.getPendingDossiers();
  }

  @Post('sign-approval')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ký số phê duyệt hồ sơ địa chính bằng chứng thư số công vụ hoặc SmartCA (QTD-05, QTD-28)',
    description: 'Thực hiện ký số mật mã PAdES/CAdES, đóng dấu thời gian TSA RFC 3161 và lưu nhật ký kiểm toán SHA-256',
  })
  @ApiResponse({ status: 200, description: 'Ký số phê duyệt thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu yêu cầu ký số không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không đủ thẩm quyền vai trò (QTD-05) hoặc chứng thư số bị thu hồi/hết hạn (QTD-28)' })
  @ApiResponse({ status: 409, description: 'Thửa đất đang bị khóa giao dịch hoặc có tranh chấp ranh giới' })
  async signDossierApproval(
    @Body() body: SignDossierApprovalRequest,
    @Ip() ipAddress: string,
    @Req() req: any,
  ) {
    const userAgent = req?.headers?.['user-agent'] || 'Diachinhso-Client';
    return this.digitalSignatureService.signDossierApproval(body, {
      ipAddress,
      userAgent,
    });
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xác minh tính hợp pháp và toàn vẹn của chữ ký số trên tài liệu',
    description: 'Kiểm tra chuỗi chữ ký số, tính hợp lệ chứng thư số và trạng thái OCSP',
  })
  @ApiResponse({ status: 200, description: 'Kết quả xác minh chữ ký số' })
  @ApiResponse({ status: 400, description: 'Dữ liệu kiểm tra chữ ký số không hợp lệ' })
  async verifySignature(@Body() body: VerifyDigitalSignatureRequest) {
    return this.digitalSignatureService.verifySignature(body);
  }
}
