import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE, DrizzleDB } from '../../database/drizzle.provider';
import { parcels } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import { CreateParcelInput, ParcelLegalStatus } from '@diachinhso/shared';

@Injectable()
export class ParcelService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  // Lấy danh sách thửa đất có phân trang và bộ lọc
  async findAll(communeId?: string, status?: ParcelLegalStatus) {
    let query = this.db.select().from(parcels);
    if (communeId && status) {
      return query.where(and(eq(parcels.communeId, communeId), eq(parcels.legalStatus, status)));
    }
    if (communeId) {
      return query.where(eq(parcels.communeId, communeId));
    }
    if (status) {
      return query.where(eq(parcels.legalStatus, status));
    }
    return query.limit(100);
  }

  // Tra cứu thửa đất theo ID
  async findById(id: string) {
    const [parcel] = await this.db.select().from(parcels).where(eq(parcels.id, id)).limit(1);
    if (!parcel) {
      throw new NotFoundException(`Không tìm thấy thửa đất có ID: ${id}`);
    }
    return parcel;
  }

  // Tra cứu thửa đất theo Mã định danh quốc gia (15 ký tự)
  async findByNationalCode(nationalCode: string) {
    const [parcel] = await this.db.select().from(parcels).where(eq(parcels.nationalCode, nationalCode)).limit(1);
    if (!parcel) {
      throw new NotFoundException(`Không tìm thấy thửa đất có mã định danh: ${nationalCode}`);
    }
    return parcel;
  }

  // Tạo mới thửa đất (Cán bộ địa chính xã / Văn phòng ĐKĐĐ)
  async create(data: CreateParcelInput) {
    // Định dạng mã thửa đất quốc gia: [CommuneId].[SheetNumber].[ParcelNumber]
    const nationalCode = `${data.communeId}.${String(data.sheetNumber).padStart(3, '0')}.${String(data.parcelNumber).padStart(4, '0')}`;

    // Tạo Polygon GeoJSON chuẩn từ tọa độ đỉnh VN-2000 (Giả lập quy đổi tọa độ để render WGS84)
    // Tọa độ tương đối phục vụ hiển thị bản đồ trực quan
    const coordinates = data.verticesVN2000.map((v) => [
      105.80 + (v.y - 500000) / 100000,
      21.02 + (v.x - 2320000) / 100000,
    ]);
    if (coordinates.length > 0) {
      coordinates.push(coordinates[0]); // Đóng vòng khép kín polygon
    }

    const geojson = {
      type: 'Polygon',
      coordinates: [coordinates],
    };

    const [newParcel] = await this.db
      .insert(parcels)
      .values({
        nationalCode,
        communeId: data.communeId,
        sheetNumber: data.sheetNumber,
        parcelNumber: data.parcelNumber,
        area: data.area,
        purposeCode: data.purposeCode,
        address: data.address,
        legalStatus: ParcelLegalStatus.AVAILABLE,
        verticesVN2000: data.verticesVN2000,
        boundaryGeojson: geojson,
        ownerIds: data.ownerIds,
      })
      .returning();

    return newParcel;
  }

  // Cập nhật trạng thái pháp lý của thửa đất
  async updateLegalStatus(id: string, status: ParcelLegalStatus) {
    const [updated] = await this.db
      .update(parcels)
      .set({
        legalStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(parcels.id, id))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Không tìm thấy thửa đất để cập nhật trạng thái: ${id}`);
    }
    return updated;
  }
}
