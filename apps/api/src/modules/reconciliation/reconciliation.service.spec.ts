import { ReconciliationService } from './reconciliation.service';
import { ReconciliationController } from './reconciliation.controller';
import {
  ReconciliationAnomalyType,
  ReconciliationSeverity,
  AnomalyResolutionStatus,
} from '@diachinhso/shared';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ReconciliationService & ReconciliationController [DCS-02-CN-008] Tự động đối soát và phát hiện trùng lặp mã thửa', () => {
  let service: ReconciliationService;
  let controller: ReconciliationController;

  beforeEach(() => {
    service = new ReconciliationService();
    controller = new ReconciliationController(service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  describe('DCS-02-CN-008-TC-01: Thống kê đối soát và tỷ lệ dữ liệu sạch', () => {
    it('should return overall reconciliation stats with clean data rate and anomaly breakdown', async () => {
      const stats = await service.getStats();
      expect(stats.totalScannedParcels).toBeGreaterThan(0);
      expect(stats.totalAnomalies).toBeGreaterThan(0);
      expect(stats.cleanDataRate).toBeGreaterThan(90);
      expect(stats.duplicateCodeCount).toBeGreaterThanOrEqual(1);
      expect(stats.spatialOverlapCount).toBeGreaterThanOrEqual(1);
      expect(stats.lastScannedAt).toBeDefined();

      const controllerStats = await controller.getStats();
      expect(controllerStats.totalAnomalies).toBe(stats.totalAnomalies);
    });
  });

  describe('DCS-02-CN-008-TC-02: Báo cáo sai lệch và lọc dữ liệu', () => {
    it('should return initial seeded reports with full details', async () => {
      const result = await service.getReports();
      expect(result.total).toBeGreaterThanOrEqual(4);
      expect(result.items.some((r) => r.anomalyType === ReconciliationAnomalyType.DUPLICATE_SHEET_PARCEL)).toBe(true);
      expect(result.items.some((r) => r.anomalyType === ReconciliationAnomalyType.SPATIAL_OVERLAP)).toBe(true);
      expect(result.items.some((r) => r.anomalyType === ReconciliationAnomalyType.DUPLICATE_NATIONAL_CODE)).toBe(true);
    });

    it('should filter reports by status, severity, and communeCode', async () => {
      const detected = await service.getReports(AnomalyResolutionStatus.DETECTED);
      expect(detected.items.every((r) => r.status === AnomalyResolutionStatus.DETECTED)).toBe(true);

      const critical = await service.getReports(undefined, ReconciliationSeverity.CRITICAL);
      expect(critical.items.every((r) => r.severity === ReconciliationSeverity.CRITICAL)).toBe(true);

      const hanoi = await controller.getReports(undefined, undefined, '01001');
      expect(hanoi.items.every((r) => r.communeCode === '01001')).toBe(true);
    });
  });

  describe('DCS-02-CN-008-TC-03: Kích hoạt phiên quét đối soát CSDL tự động', () => {
    it('should trigger an automated reconciliation scan successfully with SHA-256 audit hash', async () => {
      const result = await service.triggerScan({
        officerId: 'CB-VPDK-HN-001',
        communeCode: '01001',
        notes: 'Quét định kỳ tháng 10/2026',
      });

      expect(result.scanId).toMatch(/^SCAN-2026-/);
      expect(result.scannedParcelsCount).toBe(1450);
      expect(result.cleanDataRate).toBeGreaterThan(95);
      expect(result.auditHash).toHaveLength(64);
      expect(result.durationMs).toBeGreaterThan(0);
      expect(result.newReports.length).toBeGreaterThan(0);
    });

    it('should throw BadRequestException if officerId is missing or empty', async () => {
      await expect(
        service.triggerScan({
          officerId: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should support scanning via controller with validation schema', async () => {
      const response = await controller.triggerScan({
        officerId: 'CB-HCM-001',
        communeCode: '79001',
      });
      expect(response.scanId).toBeDefined();
      expect(response.cleanDataRate).toBeGreaterThan(90);
    });
  });

  describe('DCS-02-CN-008-TC-04: Xử lý và khắc phục sai lệch dữ liệu', () => {
    it('should successfully update status, resolution notes, and audit hash for an anomaly', async () => {
      const resolveResult = await service.resolveAnomaly({
        reportId: 'REC-REP-2026-0001',
        officerId: 'CB-VPDK-HN-001',
        newStatus: AnomalyResolutionStatus.RESOLVED,
        resolutionNotes: 'Đã hoàn tất chuẩn hóa số hiệu thửa cũ thành mã quốc gia duy nhất 01001-0012-0045-00.',
      });

      expect(resolveResult.success).toBe(true);
      expect(resolveResult.report.status).toBe(AnomalyResolutionStatus.RESOLVED);
      expect(resolveResult.report.resolvedByOfficerId).toBe('CB-VPDK-HN-001');
      expect(resolveResult.auditHash).toHaveLength(64);
      expect(resolveResult.report.auditHash).toBe(resolveResult.auditHash);
    });

    it('should throw NotFoundException if reportId does not exist', async () => {
      await expect(
        service.resolveAnomaly({
          reportId: 'NON_EXISTENT_ID',
          officerId: 'CB-001',
          newStatus: AnomalyResolutionStatus.RESOLVED,
          resolutionNotes: 'Mô tả hợp lệ cho việc xử lý',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if resolution notes are too short', async () => {
      await expect(
        service.resolveAnomaly({
          reportId: 'REC-REP-2026-0002',
          officerId: 'CB-001',
          newStatus: AnomalyResolutionStatus.RESOLVED,
          resolutionNotes: 'ngắn',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should support resolving anomaly via controller', async () => {
      const result = await controller.resolveAnomaly('REC-REP-2026-0004', {
        officerId: 'CB-HCM-001',
        newStatus: AnomalyResolutionStatus.RESOLVED,
        resolutionNotes: 'Đã hủy bỏ bản ghi nhân bản thừa từ file di sản nạp lỗi ngày 22/10.',
      });
      expect(result.success).toBe(true);
      expect(result.report.status).toBe(AnomalyResolutionStatus.RESOLVED);
    });
  });
});
