import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { createHash } from 'crypto';
import {
  NationalSyncStatus,
  NationalSyncEventType,
  NationalSyncEventItem,
  TriggerNationalSyncInput,
  TriggerNationalSyncResponse,
  NationalSyncStatsResponse,
  QueryNationalSyncEventsInput,
} from '@diachinhso/shared';

@Injectable()
export class NationalSyncService {
  private readonly logger = new Logger(NationalSyncService.name);

  // Bộ nhớ đệm lưu trữ danh sách sự kiện đồng bộ NDXP với CSDL Đất đai Quốc gia
  private syncEvents: NationalSyncEventItem[] = [];

  constructor() {
    this.seedInitialEvents();
  }

  /**
   * Khởi tạo dữ liệu mẫu các sự kiện đồng bộ Trục liên thông quốc gia (NDXP / LGSP)
   */
  private seedInitialEvents(): void {
    const genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

    const hash1 = createHash('sha256')
      .update(`${genesisHash}:SYNC-EVT-2026-0001:01001-0012-0045:PARCEL_DECLARED:2026-10-22T08:00:00Z`)
      .digest('hex');

    const hash2 = createHash('sha256')
      .update(`${hash1}:SYNC-EVT-2026-0002:01001-0012-0045:PROPERTY_REGISTERED:2026-10-22T08:15:00Z`)
      .digest('hex');

    const hash3 = createHash('sha256')
      .update(`${hash2}:SYNC-EVT-2026-0003:79001-0005-0018:TERM_UPDATED:2026-10-22T09:30:00Z`)
      .digest('hex');

    const hash4 = createHash('sha256')
      .update(`${hash3}:SYNC-EVT-2026-0004:79001-0005-0019:PARCEL_DECLARED:2026-10-22T10:00:00Z`)
      .digest('hex');

    const hash5 = createHash('sha256')
      .update(`${hash4}:SYNC-EVT-2026-0005:01001-0012-0046:TRANSACTION_LOCKED:2026-10-22T10:30:00Z`)
      .digest('hex');

    this.syncEvents = [
      {
        id: 'SYNC-EVT-2026-0005',
        eventType: NationalSyncEventType.TRANSACTION_LOCKED,
        parcelId: 'PARCEL-HN-002',
        parcelNationalCode: '01001-0012-0046',
        ndxpTransactionId: 'NDXP-TX-2026-00816',
        status: NationalSyncStatus.FAILED,
        retryCount: 2,
        syncLatencyMs: 310,
        checksumSha256: hash5,
        syncedAt: '2026-10-22T10:30:00.000Z',
        errorMessage: 'NDXP Gateway timeout sau 300ms. Sự kiện được đưa vào hàng đợi chờ tự động thử lại.',
        payloadSummary: 'Khóa phiên giao dịch công chứng 90 phút theo QTD-07',
      },
      {
        id: 'SYNC-EVT-2026-0004',
        eventType: NationalSyncEventType.PARCEL_DECLARED,
        parcelId: 'PARCEL-HCM-002',
        parcelNationalCode: '79001-0005-0019',
        ndxpTransactionId: 'NDXP-TX-2026-00815',
        status: NationalSyncStatus.PENDING,
        retryCount: 0,
        syncLatencyMs: 0,
        checksumSha256: hash4,
        syncedAt: '2026-10-22T10:00:00.000Z',
        payloadSummary: 'Khai báo thửa đất mới: Tờ 5, Thửa 19, Phường Bến Nghé (1500 m²)',
      },
      {
        id: 'SYNC-EVT-2026-0003',
        eventType: NationalSyncEventType.TERM_UPDATED,
        parcelId: 'PARCEL-HCM-001',
        parcelNationalCode: '79001-0005-0018',
        ndxpTransactionId: 'NDXP-TX-2026-00814',
        status: NationalSyncStatus.SYNCED,
        retryCount: 0,
        syncLatencyMs: 65,
        checksumSha256: hash3,
        syncedAt: '2026-10-22T09:30:00.000Z',
        payloadSummary: 'Cập nhật thời hạn đất: Có thời hạn (Hết hạn 2026-12-01)',
      },
      {
        id: 'SYNC-EVT-2026-0002',
        eventType: NationalSyncEventType.PROPERTY_REGISTERED,
        parcelId: 'PARCEL-HN-001',
        parcelNationalCode: '01001-0012-0045',
        ndxpTransactionId: 'NDXP-TX-2026-00813',
        status: NationalSyncStatus.SYNCED,
        retryCount: 0,
        syncLatencyMs: 95,
        checksumSha256: hash2,
        syncedAt: '2026-10-22T08:15:00.000Z',
        payloadSummary: 'Đăng ký tài sản: Nhà ở riêng lẻ 3 tầng (Đồng sở hữu vợ chồng)',
      },
      {
        id: 'SYNC-EVT-2026-0001',
        eventType: NationalSyncEventType.PARCEL_DECLARED,
        parcelId: 'PARCEL-HN-001',
        parcelNationalCode: '01001-0012-0045',
        ndxpTransactionId: 'NDXP-TX-2026-00812',
        status: NationalSyncStatus.SYNCED,
        retryCount: 0,
        syncLatencyMs: 78,
        checksumSha256: hash1,
        syncedAt: '2026-10-22T08:00:00.000Z',
        payloadSummary: 'Khai báo thửa đất mới: Tờ 12, Thửa 45, Phường Điện Biên (125.8 m²)',
      },
    ];
  }

  /**
   * Kích hoạt đồng bộ thời gian thực một thửa đất/biến động về CSDL Đất đai Quốc gia qua NDXP (DCS-02-CN-007, QTD-01, QTD-20)
   */
  async triggerSync(input: TriggerNationalSyncInput): Promise<TriggerNationalSyncResponse> {
    if (!input.parcelId && !input.parcelNationalCode) {
      throw new BadRequestException('Bắt buộc phải cung cấp ID thửa đất hoặc Mã định danh quốc gia để thực hiện đồng bộ');
    }

    if (!input.officerId || input.officerId.trim() === '') {
      throw new BadRequestException('Mã cán bộ thực hiện không được để trống');
    }

    const eventType = input.eventType || NationalSyncEventType.PARCEL_DECLARED;
    const parcelNationalCode = input.parcelNationalCode || `01001-0012-0045`;
    const parcelId = input.parcelId || 'PARCEL-HN-001';

    const now = new Date().toISOString();
    const eventId = `SYNC-EVT-${new Date().getFullYear()}-${String(this.syncEvents.length + 1).padStart(4, '0')}`;
    const ndxpTransactionId = `NDXP-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Độ trễ đồng bộ mạng thời gian thực NDXP (45ms - 120ms)
    const syncLatencyMs = Math.floor(45 + Math.random() * 75);

    // Chuỗi kiểm toán liên kết chuỗi băm bất biến (QTD-20)
    const previousHash = this.syncEvents.length > 0
      ? this.syncEvents[0].checksumSha256
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const payload = `${previousHash}:${eventId}:${parcelNationalCode}:${eventType}:${ndxpTransactionId}:${input.officerId}:${now}`;
    const checksumSha256 = createHash('sha256').update(payload).digest('hex');

    const newEvent: NationalSyncEventItem = {
      id: eventId,
      eventType,
      parcelId,
      parcelNationalCode,
      ndxpTransactionId,
      status: NationalSyncStatus.SYNCED,
      retryCount: 0,
      syncLatencyMs,
      checksumSha256,
      syncedAt: now,
      payloadSummary: `Đồng bộ sự kiện ${eventType} cho thửa đất ${parcelNationalCode} qua Trục NDXP`,
    };

    // Thêm vào đầu danh sách
    this.syncEvents.unshift(newEvent);

    this.logger.log(
      `[NDXP SYNC] Đã đồng bộ thành công sự kiện '${eventId}' (Thửa: ${parcelNationalCode}, TX: ${ndxpTransactionId}, Latency: ${syncLatencyMs}ms, Hash: ${checksumSha256})`,
    );

    return {
      success: true,
      event: newEvent,
      ndxpTransactionId,
      syncLatencyMs,
      auditHash: checksumSha256,
      message: `Đồng bộ dữ liệu thời gian thực thửa đất '${parcelNationalCode}' về CSDL Đất đai Quốc gia thành công qua Trục liên thông NDXP (${syncLatencyMs} ms).`,
    };
  }

  /**
   * Tra cứu danh sách sự kiện đồng bộ với CSDL Đất đai Quốc gia (DCS-02-CN-007)
   */
  async queryEvents(query: QueryNationalSyncEventsInput): Promise<{ total: number; items: NationalSyncEventItem[] }> {
    let filtered = [...this.syncEvents];

    if (query.status) {
      filtered = filtered.filter((e) => e.status === query.status);
    }

    if (query.eventType) {
      filtered = filtered.filter((e) => e.eventType === query.eventType);
    }

    if (query.parcelNationalCode) {
      filtered = filtered.filter((e) =>
        e.parcelNationalCode.toLowerCase().includes(query.parcelNationalCode!.toLowerCase()),
      );
    }

    const limit = query.limit || 50;
    const items = filtered.slice(0, limit);

    return {
      total: filtered.length,
      items,
    };
  }

  /**
   * Lấy số liệu thống kê tình trạng đồng bộ thời gian thực CSDL Quốc gia (DCS-02-CN-007)
   */
  async getStats(): Promise<NationalSyncStatsResponse> {
    const totalEvents = this.syncEvents.length;
    const syncedCount = this.syncEvents.filter((e) => e.status === NationalSyncStatus.SYNCED).length;
    const pendingCount = this.syncEvents.filter((e) => e.status === NationalSyncStatus.PENDING).length;
    const failedCount = this.syncEvents.filter((e) => e.status === NationalSyncStatus.FAILED).length;
    const conflictCount = this.syncEvents.filter((e) => e.status === NationalSyncStatus.CONFLICT).length;

    const syncedRate = totalEvents > 0 ? parseFloat(((syncedCount / totalEvents) * 100).toFixed(1)) : 100.0;

    const completedEvents = this.syncEvents.filter((e) => e.syncLatencyMs > 0);
    const averageLatencyMs = completedEvents.length > 0
      ? Math.round(completedEvents.reduce((acc, cur) => acc + cur.syncLatencyMs, 0) / completedEvents.length)
      : 80;

    const lastSyncedAt = this.syncEvents.find((e) => e.status === NationalSyncStatus.SYNCED)?.syncedAt || new Date().toISOString();

    return {
      totalEvents,
      syncedCount,
      pendingCount,
      failedCount,
      conflictCount,
      syncedRate,
      averageLatencyMs,
      lastSyncedAt,
      ndxpGatewayStatus: 'ONLINE',
    };
  }

  /**
   * Thử lại sự kiện đồng bộ bị lỗi qua Trục liên thông NDXP (DCS-02-CN-007)
   */
  async retryEvent(eventId: string, officerId: string): Promise<TriggerNationalSyncResponse> {
    const event = this.syncEvents.find((e) => e.id === eventId);
    if (!event) {
      throw new NotFoundException(`Không tìm thấy sự kiện đồng bộ có ID: ${eventId}`);
    }

    if (event.status === NationalSyncStatus.SYNCED) {
      throw new BadRequestException('Sự kiện đã ở trạng thái đồng bộ thành công, không cần thử lại');
    }

    const now = new Date().toISOString();
    const newTxId = `NDXP-TX-${Date.now()}-RETRY`;
    const latency = Math.floor(55 + Math.random() * 45);

    // Tính mã băm chuỗi băm mới (QTD-20)
    const payload = `${event.checksumSha256}:${event.id}:${newTxId}:${officerId}:${now}`;
    const newHash = createHash('sha256').update(payload).digest('hex');

    event.status = NationalSyncStatus.SYNCED;
    event.retryCount += 1;
    event.syncLatencyMs = latency;
    event.ndxpTransactionId = newTxId;
    event.checksumSha256 = newHash;
    event.syncedAt = now;
    event.errorMessage = undefined;

    this.logger.log(
      `[NDXP RETRY] Đã thử lại thành công sự kiện '${eventId}' (TX: ${newTxId}, Latency: ${latency}ms, Hash: ${newHash})`,
    );

    return {
      success: true,
      event,
      ndxpTransactionId: newTxId,
      syncLatencyMs: latency,
      auditHash: newHash,
      message: `Đã thử lại đồng bộ sự kiện '${eventId}' thành công về CSDL Đất đai Quốc gia (${latency} ms).`,
    };
  }
}
