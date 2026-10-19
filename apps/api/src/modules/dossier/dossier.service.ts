import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE, DrizzleDB } from '../../database/drizzle.provider';
import { dossiers, parcels } from '../../database/schema';
import { eq, desc } from 'drizzle-orm';
import { CreateDossierInput, ReviewDossierInput, DossierStatus } from '@diachinhso/shared';

@Injectable()
export class DossierService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  // 1. Nộp hồ sơ biến động đất đai trực tuyến
  async create(data: CreateDossierInput) {
    const [parcel] = await this.db.select().from(parcels).where(eq(parcels.id, data.parcelId)).limit(1);
    if (!parcel) {
      throw new NotFoundException(`Không tìm thấy thửa đất có ID: ${data.parcelId}`);
    }

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const dossierCode = `HS-${year}-${randomSuffix}`;

    const [dossier] = await this.db
      .insert(dossiers)
      .values({
        dossierCode,
        parcelId: parcel.id,
        applicantName: data.applicantName,
        applicantCitizenId: data.applicantCitizenId,
        applicantPhone: data.applicantPhone,
        fluctuationType: data.fluctuationType,
        status: DossierStatus.SUBMITTED,
        documentUrls: data.documentUrls,
        notes: data.notes,
      })
      .returning();

    return dossier;
  }

  // 2. Tra cứu danh sách hồ sơ
  async findAll() {
    return this.db.select().from(dossiers).orderBy(desc(dossiers.createdAt)).limit(100);
  }

  // 3. Tra cứu chi tiết hồ sơ theo ID
  async findById(id: string) {
    const [dossier] = await this.db.select().from(dossiers).where(eq(dossiers.id, id)).limit(1);
    if (!dossier) {
      throw new NotFoundException(`Không tìm thấy hồ sơ có ID: ${id}`);
    }
    return dossier;
  }

  // 4. Thẩm định hồ sơ (Cán bộ xã xác minh hiện trạng, VPĐKĐĐ thẩm định)
  async review(data: ReviewDossierInput, officerId: string) {
    const [updated] = await this.db
      .update(dossiers)
      .set({
        status: data.status,
        notes: data.comments,
        assignedOfficerId: officerId,
        updatedAt: new Date(),
      })
      .where(eq(dossiers.id, data.dossierId))
      .returning();

    if (!updated) {
      throw new NotFoundException(`Không tìm thấy hồ sơ để cập nhật: ${data.dossierId}`);
    }
    return updated;
  }
}
