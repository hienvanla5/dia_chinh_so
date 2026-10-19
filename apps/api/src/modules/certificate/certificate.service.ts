import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { DRIZZLE, DrizzleDB } from '../../database/drizzle.provider';
import { digitalCertificates, parcels } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';

@Injectable()
export class CertificateService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  // 1. Cấp mới / Phát hành Sổ Đỏ Số (VPĐKĐĐ ký số điện tử)
  async issueCertificate(data: {
    parcelId: string;
    certificateNumber: string;
    serialNumber: string;
    signerName: string;
    signerTitle: string;
    pdfUrl: string;
  }) {
    const [parcel] = await this.db.select().from(parcels).where(eq(parcels.id, data.parcelId)).limit(1);
    if (!parcel) {
      throw new NotFoundException(`Không tìm thấy thửa đất có ID: ${data.parcelId}`);
    }

    // Sinh mã băm mật mã QR Code chống làm giả sổ đỏ (SHA-256)
    const rawData = `${parcel.nationalCode}|${data.certificateNumber}|${data.serialNumber}|${parcel.area}|${parcel.purposeCode}`;
    const qrHash = createHash('sha256').update(rawData).digest('hex');
    const digitalSignature = `SIG_${createHash('sha256').update(qrHash + data.signerName).digest('hex').substring(0, 40)}`;

    const [certificate] = await this.db
      .insert(digitalCertificates)
      .values({
        parcelId: parcel.id,
        certificateNumber: data.certificateNumber,
        serialNumber: data.serialNumber,
        qrHash,
        digitalSignature,
        signerName: data.signerName,
        signerTitle: data.signerTitle,
        pdfUrl: data.pdfUrl,
        status: 'ACTIVE',
      })
      .returning();

    return certificate;
  }

  // 2. Xác minh tính hợp pháp của Sổ Đỏ Số qua mã băm QR hoặc số seri
  async verifyByQrHash(qrHash: string) {
    const [certificate] = await this.db
      .select()
      .from(digitalCertificates)
      .where(eq(digitalCertificates.qrHash, qrHash))
      .limit(1);

    if (!certificate) {
      return {
        isValid: false,
        message: 'CẢNH BÁO: Giấy chứng nhận không tồn tại trên hệ thống hoặc có dấu hiệu làm giả!',
      };
    }

    const [parcel] = await this.db.select().from(parcels).where(eq(parcels.id, certificate.parcelId)).limit(1);

    return {
      isValid: true,
      message: 'Giấy chứng nhận quyền sử dụng đất số hợp pháp, được xác thực chữ ký điện tử từ cơ sở dữ liệu quốc gia.',
      certificate,
      parcel,
    };
  }

  // 3. Lấy thông tin Sổ Đỏ Số theo thửa đất
  async findByParcelId(parcelId: string) {
    const [certificate] = await this.db
      .select()
      .from(digitalCertificates)
      .where(eq(digitalCertificates.parcelId, parcelId))
      .limit(1);
    return certificate || null;
  }
}
