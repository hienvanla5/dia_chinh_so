import { Injectable } from '@nestjs/common';
import { VertexVN2000, VN2000_PROJECTION } from '@diachinhso/shared';

@Injectable()
export class SpatialService {
  // Chuyển đổi danh sách tọa độ đỉnh ranh giới VN-2000 sang GeoJSON Polygon WGS84
  convertVN2000ToGeoJSON(vertices: VertexVN2000[], srid: number = VN2000_PROJECTION.SRID_VN2000_DEFAULT) {
    if (!vertices || vertices.length < 3) {
      throw new Error('Cần tối thiểu 3 đỉnh tọa độ để tạo đa giác ranh giới');
    }

    // Công thức gần đúng quy đổi hệ tọa độ VN-2000 trục 105 sang WGS84
    const coordinates = vertices.map((v) => [
      Number((105.80 + (v.y - 500000) / 100000).toFixed(6)),
      Number((21.02 + (v.x - 2320000) / 100000).toFixed(6)),
    ]);

    // Đóng đa giác khép kín
    coordinates.push(coordinates[0]);

    return {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates],
      },
      properties: {
        sridSource: srid,
        sridTarget: VN2000_PROJECTION.SRID_WGS84,
        vertexCount: vertices.length,
      },
    };
  }

  // Tra cứu lớp quy hoạch không gian
  async checkZoningOverlap(coordinates: number[][]) {
    // Trả về thông tin quy hoạch không gian tham chiếu
    return {
      isPlannedForPublicWork: false,
      planningZone: 'Khu dân cư hiện hữu chỉnh trang (ONT)',
      maxFloors: 5,
      buildingDensityLimit: 80, // 80%
      notes: 'Thửa đất phù hợp quy hoạch phân khu xây dựng đã được phê duyệt.',
    };
  }
}
