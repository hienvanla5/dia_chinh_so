import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SpatialService } from './spatial.service';
import { VertexVN2000 } from '@diachinhso/shared';

@ApiTags('Bản đồ số & Không gian GIS (Spatial GIS)')
@Controller('spatial')
export class SpatialController {
  constructor(private readonly spatialService: SpatialService) {}

  @Post('transform-vn2000')
  @ApiOperation({ summary: 'Chuyển đổi danh sách tọa độ đỉnh ranh giới VN-2000 sang GeoJSON WGS84' })
  async transformCoordinates(@Body() body: { vertices: VertexVN2000[]; srid?: number }) {
    return this.spatialService.convertVN2000ToGeoJSON(body.vertices, body.srid);
  }

  @Post('check-zoning')
  @ApiOperation({ summary: 'Kiểm tra thông tin quy hoạch không gian theo ranh giới tọa độ' })
  async checkZoning(@Body() body: { coordinates: number[][] }) {
    return this.spatialService.checkZoningOverlap(body.coordinates);
  }
}
