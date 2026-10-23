import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { NationalSyncService } from './national-sync.service';
import {
  NationalSyncStatus,
  NationalSyncEventType,
} from '@diachinhso/shared';

describe('NationalSyncService [DCS-02-CN-007] Đồng bộ thời gian thực với CSDL Đất đai Quốc gia', () => {
  let service: NationalSyncService;

  beforeEach(() => {
    service = new NationalSyncService();
  });

  describe('DCS-02-CN-007-TC-01: Luồng thành công', () => {
    it('phải kích hoạt đồng bộ thời gian thực thửa đất thành công qua Trục NDXP', async () => {
      const res = await service.triggerSync({
        parcelId: 'PARCEL-HN-001',
        parcelNationalCode: '01001-0012-0045',
        eventType: NationalSyncEventType.PARCEL_DECLARED,
        officerId: 'ADMIN',
      });

      expect(res.success).toBe(true);
      expect(res.event).toBeDefined();
      expect(res.event.status).toBe(NationalSyncStatus.SYNCED);
      expect(res.ndxpTransactionId).toMatch(/^NDXP-TX-/);
      expect(res.syncLatencyMs).toBeGreaterThan(0);
      expect(res.syncLatencyMs).toBeLessThanOrEqual(200);
      expect(res.auditHash).toHaveLength(64);
    });

    it('phải lấy được số liệu thống kê tình trạng đồng bộ thời gian thực CSDL Quốc gia', async () => {
      const stats = await service.getStats();

      expect(stats.totalEvents).toBeGreaterThanOrEqual(5);
      expect(stats.syncedCount).toBeGreaterThanOrEqual(1);
      expect(stats.syncedRate).toBeGreaterThan(0);
      expect(stats.averageLatencyMs).toBeGreaterThan(0);
      expect(stats.ndxpGatewayStatus).toBe('ONLINE');
    });

    it('phải tra cứu và lọc danh sách sự kiện đồng bộ theo trạng thái và mã thửa', async () => {
      const allEvents = await service.queryEvents({});
      expect(allEvents.total).toBeGreaterThanOrEqual(5);

      const failedEvents = await service.queryEvents({ status: NationalSyncStatus.FAILED });
      expect(failedEvents.items.every((e) => e.status === NationalSyncStatus.FAILED)).toBe(true);

      const parcelEvents = await service.queryEvents({ parcelNationalCode: '01001-0012-0045' });
      expect(parcelEvents.items.length).toBeGreaterThanOrEqual(1);
    });

    it('phải thử lại sự kiện đồng bộ FAILED thành công qua Trục NDXP', async () => {
      // SYNC-EVT-2026-0005 là sự kiện FAILED trong dữ liệu mẫu
      const res = await service.retryEvent('SYNC-EVT-2026-0005', 'ADMIN');

      expect(res.success).toBe(true);
      expect(res.event.status).toBe(NationalSyncStatus.SYNCED);
      expect(res.event.retryCount).toBe(3); // 2 + 1
      expect(res.auditHash).toHaveLength(64);
    });
  });

  describe('DCS-02-CN-007-TC-02: Dữ liệu không hợp lệ', () => {
    it('phải từ chối nếu không truyền cả parcelId và parcelNationalCode', async () => {
      await expect(
        service.triggerSync({
          officerId: 'ADMIN',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối nếu thiếu mã cán bộ thực hiện', async () => {
      await expect(
        service.triggerSync({
          parcelId: 'PARCEL-HN-001',
          officerId: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải báo lỗi không tìm thấy khi thử lại sự kiện không tồn tại', async () => {
      await expect(
        service.retryEvent('SYNC-EVT-KHONG-TON-TAI', 'ADMIN'),
      ).rejects.toThrow(NotFoundException);
    });

    it('phải từ chối thử lại nếu sự kiện đã đồng bộ thành công (SYNCED)', async () => {
      await expect(
        service.retryEvent('SYNC-EVT-2026-0001', 'ADMIN'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DCS-02-CN-007-TC-03: Ràng buộc nghiệp vụ (QTD-01, QTD-20)', () => {
    it('phải sinh mã giao dịch NDXP duy nhất cho mỗi sự kiện đồng bộ', async () => {
      const res1 = await service.triggerSync({
        parcelNationalCode: '01001-0012-0045',
        officerId: 'ADMIN',
      });
      const res2 = await service.triggerSync({
        parcelNationalCode: '79001-0005-0018',
        officerId: 'ADMIN',
      });

      expect(res1.ndxpTransactionId).not.toBe(res2.ndxpTransactionId);
    });
  });

  describe('DCS-02-CN-007-TC-04: Kiểm toán & Bất biến chuỗi băm (QTD-20, AC-04)', () => {
    it('phải tạo mã băm SHA-256 bất biến liên kết chuỗi cho mỗi sự kiện đồng bộ', async () => {
      const res = await service.triggerSync({
        parcelNationalCode: '01001-0012-0045',
        eventType: NationalSyncEventType.ORIGIN_UPDATED,
        officerId: 'ADMIN',
      });

      expect(res.auditHash).toBeDefined();
      expect(res.auditHash).toHaveLength(64);
      expect(res.event.checksumSha256).toBe(res.auditHash);
    });
  });
});
