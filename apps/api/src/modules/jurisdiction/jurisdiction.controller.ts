import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  Ip,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JurisdictionService } from './jurisdiction.service';
import {
  ConfigureJurisdictionPolicyRequest,
  EvaluatePermissionRequest,
  UserRole,
} from '@diachinhso/shared';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('Phân quyền Địa giới Hành chính 3 cấp (DCS-01-CN-003)')
@Controller('api/v1/jurisdiction')
export class JurisdictionController {
  constructor(private readonly jurisdictionService: JurisdictionService) {}

  @Get('hierarchy')
  @ApiOperation({
    summary: 'Lấy cây danh mục phân cấp địa giới hành chính 3 cấp (Tỉnh - Huyện - Xã)',
    description: 'Cung cấp danh mục phân cấp Tỉnh/Thành phố, Quận/Huyện, Xã/Phường theo quy chuẩn quốc gia',
  })
  @ApiResponse({ status: 200, description: 'Lấy danh mục 3 cấp thành công' })
  async getHierarchy() {
    return this.jurisdictionService.getHierarchy();
  }

  @Get('matrix')
  @ApiOperation({
    summary: 'Lấy ma trận chính sách phân quyền RBAC đa chiều',
    description: 'Tra cứu danh sách các chính sách phân quyền hiện có trong hệ thống',
  })
  @ApiResponse({ status: 200, description: 'Danh sách chính sách phân quyền' })
  async getPolicies() {
    return this.jurisdictionService.getPolicies();
  }

  @Post('matrix')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cấu hình ma trận phân quyền RBAC phân cấp 3 cấp',
    description: 'Quản trị viên cấu hình quyền hạn thao tác (CRUD) cho từng vai trò và cấp hành chính',
  })
  @ApiResponse({ status: 200, description: 'Cấu hình chính sách thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc đơn vị không tồn tại' })
  async configurePolicy(
    @Body() dto: ConfigureJurisdictionPolicyRequest,
    @Ip() ipAddress: string,
    @Req() req: any,
  ) {
    const username = req?.user?.username || 'SYSTEM_ADMIN';
    return this.jurisdictionService.configurePolicy(dto, {
      username,
      ipAddress,
    });
  }

  @Post('evaluate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đánh giá thẩm quyền truy cập dữ liệu địa chính theo thẩm quyền 3 cấp (QTD-16)',
    description: 'Kiểm tra xem tài khoản có thẩm quyền thao tác trên địa bàn mục tiêu hay không',
  })
  @ApiResponse({ status: 200, description: 'Quyền truy cập hợp lệ trong phạm vi thẩm quyền' })
  @ApiResponse({ status: 400, description: 'Dữ liệu kiểm tra không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Từ chối thao tác: Vượt quyền địa giới hành chính (QTD-16)' })
  async evaluatePermission(
    @Body() dto: EvaluatePermissionRequest,
    @Ip() ipAddress: string,
  ) {
    return this.jurisdictionService.evaluatePermission(dto, { ipAddress });
  }
}
