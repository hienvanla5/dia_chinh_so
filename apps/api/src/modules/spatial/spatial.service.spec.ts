import { SpatialService } from './spatial.service';
import { VertexVN2000 } from '@diachinhso/shared';

describe('SpatialService (VN-2000 GIS Transformations)', () => {
  let service: SpatialService;

  beforeEach(() => {
    service = new SpatialService();
  });

  it('phải chuyển đổi danh sách đỉnh VN-2000 thành GeoJSON Polygon WGS84 hợp lệ', () => {
    const vertices: VertexVN2000[] = [
      { pointIndex: 1, x: 2321450.2, y: 504210.5 },
      { pointIndex: 2, x: 2321462.8, y: 504225.1 },
      { pointIndex: 3, x: 2321448.0, y: 504238.6 },
    ];

    const geojson = service.convertVN2000ToGeoJSON(vertices);

    expect(geojson.type).toBe('Feature');
    expect(geojson.geometry.type).toBe('Polygon');
    expect(geojson.geometry.coordinates[0]).toHaveLength(4); // Đóng vòng khép kín (+1 đỉnh)
    expect(geojson.properties.vertexCount).toBe(3);
  });

  it('phải báo lỗi khi danh sách đỉnh nhỏ hơn 3', () => {
    const invalidVertices: VertexVN2000[] = [
      { pointIndex: 1, x: 2321450.2, y: 504210.5 },
      { pointIndex: 2, x: 2321462.8, y: 504225.1 },
    ];

    expect(() => service.convertVN2000ToGeoJSON(invalidVertices)).toThrow(
      'Cần tối thiểu 3 đỉnh tọa độ để tạo đa giác ranh giới',
    );
  });

  it('phải kiểm tra được thông tin quy hoạch không gian', async () => {
    const result = await service.checkZoningOverlap([
      [105.84, 21.03],
      [105.85, 21.03],
      [105.85, 21.04],
      [105.84, 21.04],
    ]);

    expect(result.isPlannedForPublicWork).toBe(false);
    expect(result.planningZone).toContain('ONT');
    expect(result.buildingDensityLimit).toBe(80);
  });
});
