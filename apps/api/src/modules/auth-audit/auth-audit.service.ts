import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  AuthAuditLogItem,
  AuthAuditLogStatus,
  AuthMethodType,
  AnomalyDetectionType,
  AnomalySeverity,
  AnomalyAlertStatus,
  AnomalySecurityAlert,
  QueryAuthAuditLogsInput,
  QueryAnomalyAlertsInput,
  ResolveAnomalyAlertInput,
  ResolveAnomalyAlertResponse,
  SimulateAuthEventInput,
  VerifyAuditChainResponse,
} from '@diachinhso/shared';

@Injectable()
export class AuthAuditService {
  private readonly logger = new Logger(AuthAuditService.name);

  // Sổ cái kiểm toán chuỗi băm SHA-256 bất biến (QTD-20)
  private auditLogs: AuthAuditLogItem[] = [];

  // Danh mục cảnh báo an ninh phát hiện dị thường
  private securityAlerts: AnomalySecurityAlert[] = [];

  constructor() {
    this.seedInitialAuditChain();
  }

  /**
   * Tính toán mã băm SHA-256 cho bản ghi kiểm toán liên kết chuỗi (QTD-20)
   */
  private calculateBlockHash(
    previousHash: string,
    id: string,
    timestamp: string,
    actorId: string,
    authMethod: string,
    clientIp: string,
    status: string,
    isAnomaly: boolean,
  ): string {
    const rawPayload = `${previousHash}|${id}|${timestamp}|${actorId}|${authMethod}|${clientIp}|${status}|${isAnomaly}`;
    return createHash('sha256').update(rawPayload).digest('hex');
  }

  /**
   * Khởi tạo dữ liệu mẫu cho chuỗi khối kiểm toán xác thực và cảnh báo an ninh
   */
  private seedInitialAuditChain(): void {
    const genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';

    const seedEvents: Array<{
      id: string;
      timestamp: string;
      actorId: string;
      actorName: string;
      actorRole: string;
      authMethod: AuthMethodType;
      clientIp: string;
      location: { province: string; country: string; latitude: number; longitude: number };
      deviceInfo: string;
      status: AuthAuditLogStatus;
      failureReason?: string;
      isAnomaly: boolean;
      anomalyType?: AnomalyDetectionType;
    }> = [
      {
        id: 'LOG-2026-0001',
        timestamp: '2026-10-22T08:15:30.000Z',
        actorId: '001090123456',
        actorName: 'Nguyễn Văn Hùng',
        actorRole: 'LAND_USER',
        authMethod: 'CITIZEN_IDP',
        clientIp: '113.190.234.12',
        location: { province: 'Thành phố Hà Nội', country: 'Việt Nam', latitude: 21.0285, longitude: 105.8542 },
        deviceInfo: 'Safari trên iPhone 15 (iOS 18.1)',
        status: 'SUCCESS',
        isAnomaly: false,
      },
      {
        id: 'LOG-2026-0002',
        timestamp: '2026-10-22T08:30:12.000Z',
        actorId: 'CB-HN-VPDK-001',
        actorName: 'Lê Hoàng Nam',
        actorRole: 'LAND_REGISTRAR',
        authMethod: 'OFFICER_SSO',
        clientIp: '10.15.20.101',
        location: { province: 'Thành phố Hà Nội', country: 'Việt Nam', latitude: 21.0285, longitude: 105.8542 },
        deviceInfo: 'Chrome 122 trên Windows 11 (Mạng CPNET)',
        status: 'SUCCESS',
        isAnomaly: false,
      },
      {
        id: 'LOG-2026-0003',
        timestamp: '2026-10-22T09:05:45.000Z',
        actorId: 'CB-HN-VPDK-001',
        actorName: 'Lê Hoàng Nam',
        actorRole: 'LAND_REGISTRAR',
        authMethod: 'OFFICER_SSO',
        clientIp: '42.112.50.88',
        location: { province: 'Thành phố Hồ Chí Minh', country: 'Việt Nam', latitude: 10.8231, longitude: 106.6297 },
        deviceInfo: 'Chrome 122 trên Windows 11',
        status: 'BLOCKED',
        failureReason: 'Phát hiện đăng nhập bất thường: Di chuyển bất khả thi giữa Hà Nội và TP.HCM trong 35 phút',
        isAnomaly: true,
        anomalyType: 'IMPOSSIBLE_TRAVEL',
      },
      {
        id: 'LOG-2026-0004',
        timestamp: '2026-10-22T01:20:10.000Z',
        actorId: 'CB-DB-001',
        actorName: 'Phạm Đức Huy',
        actorRole: 'COMMUNE_OFFICER',
        authMethod: 'OFFICER_SSO',
        clientIp: '171.244.10.45',
        location: { province: 'Thành phố Hà Nội', country: 'Việt Nam', latitude: 21.0285, longitude: 105.8542 },
        deviceInfo: 'Firefox 120 trên Linux',
        status: 'CHALLENGED',
        failureReason: 'Đăng nhập ngoài giờ hành chính công vụ (01:20 AM)',
        isAnomaly: true,
        anomalyType: 'OFF_HOURS_ACCESS',
      },
      {
        id: 'LOG-2026-0005',
        timestamp: '2026-10-22T09:45:00.000Z',
        actorId: 'ENT-0101234567',
        actorName: 'Tập đoàn Đầu tư Phát triển Đô thị Thủ Đô',
        actorRole: 'LAND_USER',
        authMethod: 'ENTERPRISE_TOKEN',
        clientIp: '118.70.190.5',
        location: { province: 'Thành phố Hà Nội', country: 'Việt Nam', latitude: 21.0285, longitude: 105.8542 },
        deviceInfo: 'USB Token PKCS#11 trên Windows 10',
        status: 'SUCCESS',
        isAnomaly: false,
      },
      {
        id: 'LOG-2026-0006',
        timestamp: '2026-10-22T10:12:00.000Z',
        actorId: 'UNKNOWN-SCANNER',
        actorName: 'Không xác định',
        actorRole: 'LAND_USER',
        authMethod: 'CITIZEN_IDP',
        clientIp: '198.51.100.222',
        location: { province: 'Quốc tế / Proxy', country: 'Hoa Kỳ', latitude: 37.7749, longitude: -122.4194 },
        deviceInfo: 'Python-Requests/2.31.0 Scanner',
        status: 'BLOCKED',
        failureReason: 'Tấn công dò quét Brute-Force liên tiếp vượt ngưỡng 5 lần thử',
        isAnomaly: true,
        anomalyType: 'BRUTE_FORCE_BURST',
      },
    ];

    let currentPrevHash = genesisHash;
    for (const ev of seedEvents) {
      const hash = this.calculateBlockHash(
        currentPrevHash,
        ev.id,
        ev.timestamp,
        ev.actorId,
        ev.authMethod,
        ev.clientIp,
        ev.status,
        ev.isAnomaly,
      );

      const logItem: AuthAuditLogItem = {
        ...ev,
        previousHash: currentPrevHash,
        auditHash: hash,
      };

      this.auditLogs.push(logItem);
      currentPrevHash = hash;

      // Khởi tạo cảnh báo tương ứng cho các sự kiện dị thường
      if (ev.isAnomaly && ev.anomalyType) {
        this.createSecurityAlertFromLog(logItem);
      }
    }

    this.logger.log(`Đã khởi tạo chuỗi kiểm toán bất biến với ${this.auditLogs.length} khối (Hash mới nhất: ${currentPrevHash.substring(0, 16)}...)`);
  }

  /**
   * Tạo bản ghi cảnh báo an ninh từ bản ghi nhật ký dị thường
   */
  private createSecurityAlertFromLog(log: AuthAuditLogItem): AnomalySecurityAlert {
    let severity: AnomalySeverity = 'MEDIUM';
    let recommendedAction = 'Giám sát hoạt động phiên và yêu cầu xác thực bổ sung';
    let isAccountLocked = false;
    let isSessionTerminated = false;
    let requiresStepUpVerification = true;

    switch (log.anomalyType) {
      case 'IMPOSSIBLE_TRAVEL':
        severity = 'CRITICAL';
        recommendedAction = 'Khóa tài khoản khẩn cấp, hủy phiên công vụ hiện tại và thông báo đến Cục An toàn thông tin';
        isAccountLocked = true;
        isSessionTerminated = true;
        requiresStepUpVerification = true;
        break;

      case 'BRUTE_FORCE_BURST':
        severity = 'HIGH';
        recommendedAction = 'Chặn địa chỉ IP tại Firewall/WAF trong 30 phút và khóa tạm thời tài khoản đích';
        isAccountLocked = true;
        isSessionTerminated = false;
        requiresStepUpVerification = true;
        break;

      case 'OFF_HOURS_ACCESS':
        severity = 'MEDIUM';
        recommendedAction = 'Yêu cầu xác thực 2 lớp qua SmartCA hoặc gửi thông báo cảnh báo đến lãnh đạo đơn vị';
        isAccountLocked = false;
        isSessionTerminated = false;
        requiresStepUpVerification = true;
        break;

      case 'UNTRUSTED_NETWORK':
        severity = 'HIGH';
        recommendedAction = 'Chặn truy cập từ dải IP ngoài mạng công vụ theo Quy định QTD-22';
        isAccountLocked = true;
        isSessionTerminated = true;
        requiresStepUpVerification = true;
        break;

      default:
        severity = 'LOW';
        recommendedAction = 'Ghi nhận và tiếp tục theo dõi';
        break;
    }

    const alertId = `ALT-${log.id.replace('LOG-', '')}`;
    const auditHash = createHash('sha256')
      .update(`${alertId}|${log.id}|${log.anomalyType}|${severity}|${log.clientIp}|${new Date().toISOString()}`)
      .digest('hex');

    const alert: AnomalySecurityAlert = {
      id: alertId,
      timestamp: log.timestamp,
      detectionType: log.anomalyType || 'SUSPICIOUS_DEVICE',
      severity,
      status: 'NEW',
      targetActorId: log.actorId,
      targetActorName: log.actorName,
      targetActorRole: log.actorRole,
      clientIp: log.clientIp,
      detectedLocation: `${log.location.province}, ${log.location.country}`,
      details: log.failureReason || `Phát hiện hành vi dị thường ${log.anomalyType} tại IP ${log.clientIp}`,
      recommendedAction,
      isAccountLocked,
      isSessionTerminated,
      requiresStepUpVerification,
      auditHash,
    };

    this.securityAlerts.push(alert);
    return alert;
  }

  /**
   * Truy vấn danh sách nhật ký xác thực có phân trang và lọc
   */
  async queryAuditLogs(query: QueryAuthAuditLogsInput): Promise<{
    logs: AuthAuditLogItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    let filtered = [...this.auditLogs];

    if (query.actorId) {
      filtered = filtered.filter(l => l.actorId.toLowerCase().includes(query.actorId!.toLowerCase()));
    }
    if (query.role) {
      filtered = filtered.filter(l => l.actorRole === query.role);
    }
    if (query.status) {
      filtered = filtered.filter(l => l.status === query.status);
    }
    if (query.isAnomaly !== undefined) {
      filtered = filtered.filter(l => l.isAnomaly === query.isAnomaly);
    }

    // Sắp xếp mới nhất lên đầu
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const page = query.page || 1;
    const limit = query.limit || 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedLogs = filtered.slice(startIndex, startIndex + limit);

    return {
      logs: paginatedLogs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Truy vấn danh mục cảnh báo an ninh dị thường
   */
  async queryAnomalyAlerts(query: QueryAnomalyAlertsInput): Promise<AnomalySecurityAlert[]> {
    let filtered = [...this.securityAlerts];

    if (query.severity) {
      filtered = filtered.filter(a => a.severity === query.severity);
    }
    if (query.status) {
      filtered = filtered.filter(a => a.status === query.status);
    }
    if (query.detectionType) {
      filtered = filtered.filter(a => a.detectionType === query.detectionType);
    }

    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return filtered;
  }

  /**
   * Lấy số liệu thống kê trung tâm điều hành giám sát an ninh (SOC Dashboard)
   */
  async getAuditStats(): Promise<{
    totalEventsCount: number;
    anomaliesCount: number;
    activeAlertsCount: number;
    criticalAlertsCount: number;
    chainIntegrityStatus: 'VERIFIED' | 'TAMPERED';
    latestBlockHash: string;
  }> {
    const totalEventsCount = this.auditLogs.length;
    const anomaliesCount = this.auditLogs.filter(l => l.isAnomaly).length;
    const activeAlertsCount = this.securityAlerts.filter(a => a.status === 'NEW' || a.status === 'INVESTIGATING').length;
    const criticalAlertsCount = this.securityAlerts.filter(a => a.severity === 'CRITICAL' && (a.status === 'NEW' || a.status === 'INVESTIGATING')).length;

    const chainIntegrity = await this.verifyAuditChain();
    const latestBlockHash = this.auditLogs.length > 0 ? this.auditLogs[this.auditLogs.length - 1].auditHash : '';

    return {
      totalEventsCount,
      anomaliesCount,
      activeAlertsCount,
      criticalAlertsCount,
      chainIntegrityStatus: chainIntegrity.isValid ? 'VERIFIED' : 'TAMPERED',
      latestBlockHash,
    };
  }

  /**
   * Kiểm tra tính toàn vẹn của chuỗi băm kiểm toán bất biến (QTD-20)
   */
  async verifyAuditChain(): Promise<VerifyAuditChainResponse> {
    const genesisHash = '0000000000000000000000000000000000000000000000000000000000000000';
    let previousHash = genesisHash;

    for (let i = 0; i < this.auditLogs.length; i++) {
      const log = this.auditLogs[i];

      // Kiểm tra liên kết chuỗi
      if (log.previousHash !== previousHash) {
        return {
          isValid: false,
          totalLogs: this.auditLogs.length,
          brokenLogId: log.id,
          latestHash: this.auditLogs[this.auditLogs.length - 1]?.auditHash || '',
          message: `Phát hiện đứt gãy chuỗi băm tại bản ghi ${log.id}. PreviousHash lưu trữ không trùng khớp với Hash của khối trước!`,
        };
      }

      // Kiểm tra tính toàn vẹn của nội dung khối
      const expectedHash = this.calculateBlockHash(
        log.previousHash,
        log.id,
        log.timestamp,
        log.actorId,
        log.authMethod,
        log.clientIp,
        log.status,
        log.isAnomaly,
      );

      if (log.auditHash !== expectedHash) {
        return {
          isValid: false,
          totalLogs: this.auditLogs.length,
          brokenLogId: log.id,
          latestHash: this.auditLogs[this.auditLogs.length - 1]?.auditHash || '',
          message: `Phát hiện giả mạo dữ liệu tại bản ghi ${log.id}. Dữ liệu khối đã bị chỉnh sửa trái phép sau khi ghi!`,
        };
      }

      previousHash = log.auditHash;
    }

    return {
      isValid: true,
      totalLogs: this.auditLogs.length,
      latestHash: previousHash,
      message: `Chuỗi băm kiểm toán toàn vẹn 100%. Đã xác minh hợp lệ toàn bộ ${this.auditLogs.length} khối dữ liệu theo quy tắc QTD-20.`,
    };
  }

  /**
   * Giả lập sự kiện xác thực và chạy thuật toán phát hiện dị thường
   */
  async simulateAuthEvent(input: SimulateAuthEventInput): Promise<{
    log: AuthAuditLogItem;
    alert?: AnomalySecurityAlert;
    isAnomaly: boolean;
    anomalyReason?: string;
  }> {
    const now = new Date();
    const timestamp = now.toISOString();
    const newLogId = `LOG-2026-${String(this.auditLogs.length + 1).padStart(4, '0')}`;

    let isAnomaly = false;
    let anomalyType: AnomalyDetectionType | undefined = undefined;
    let failureReason: string | undefined = undefined;
    let status: AuthAuditLogStatus = input.isSuccess ? 'SUCCESS' : 'FAILED';

    // 1. Kiểm tra quy tắc di chuyển bất khả thi (Impossible Travel)
    // Tra cứu sự kiện gần nhất của cùng actorId trong 60 phút qua
    const recentActorLogs = this.auditLogs
      .filter(l => l.actorId === input.actorId && l.status === 'SUCCESS')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (recentActorLogs.length > 0) {
      const lastLog = recentActorLogs[0];
      const timeDiffMinutes = (now.getTime() - new Date(lastLog.timestamp).getTime()) / (1000 * 60);

      // Nếu địa phương khác nhau nhưng thời gian < 60 phút
      if (lastLog.location.province !== input.province && timeDiffMinutes < 60) {
        isAnomaly = true;
        anomalyType = 'IMPOSSIBLE_TRAVEL';
        status = 'BLOCKED';
        failureReason = `Phát hiện di chuyển bất khả thi: Đăng nhập từ ${input.province} chỉ sau ${Math.round(timeDiffMinutes)} phút từ lần đăng nhập tại ${lastLog.location.province}`;
      }
    }

    // 2. Kiểm tra quy tắc đăng nhập ngoài giờ hành chính cho cán bộ (Off-hours Access)
    if (!isAnomaly && (input.actorRole === 'COMMUNE_OFFICER' || input.actorRole === 'LAND_REGISTRAR')) {
      const isNightTime = input.isOfficeHours === false;
      if (isNightTime) {
        isAnomaly = true;
        anomalyType = 'OFF_HOURS_ACCESS';
        status = 'CHALLENGED';
        failureReason = 'Cán bộ đăng nhập ngoài giờ hành chính (23:00 - 05:00). Yêu cầu thử thách 2FA tăng cường';
      }
    }

    // 3. Kiểm tra mạng ngoài công vụ cho tài khoản cán bộ (Untrusted Network - QTD-22)
    if (!isAnomaly && (input.actorRole === 'COMMUNE_OFFICER' || input.actorRole === 'LAND_REGISTRAR')) {
      const isCpnetIp = input.clientIp.startsWith('10.') || input.clientIp.startsWith('192.168.1.');
      if (!isCpnetIp && input.clientIp !== '127.0.0.1') {
        isAnomaly = true;
        anomalyType = 'UNTRUSTED_NETWORK';
        status = 'BLOCKED';
        failureReason = `Cán bộ đăng nhập từ địa chỉ IP ngoài mạng công vụ chuyên dùng (${input.clientIp}) vi phạm QTD-22`;
      }
    }

    // 4. Nếu không thành công và liên tục thất bại
    if (!isAnomaly && !input.isSuccess) {
      status = 'FAILED';
      failureReason = 'Xác thực không thành công (mật khẩu hoặc mã OTP sai)';
    }

    // Tạo khối kiểm toán mới
    const previousHash = this.auditLogs.length > 0
      ? this.auditLogs[this.auditLogs.length - 1].auditHash
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const hash = this.calculateBlockHash(
      previousHash,
      newLogId,
      timestamp,
      input.actorId,
      input.authMethod,
      input.clientIp,
      status,
      isAnomaly,
    );

    const newLog: AuthAuditLogItem = {
      id: newLogId,
      timestamp,
      actorId: input.actorId,
      actorName: input.actorName,
      actorRole: input.actorRole,
      authMethod: input.authMethod,
      clientIp: input.clientIp,
      location: {
        province: input.province,
        country: input.country || 'Việt Nam',
      },
      deviceInfo: input.deviceInfo || 'Trình duyệt Web tiêu chuẩn',
      status,
      failureReason,
      isAnomaly,
      anomalyType,
      previousHash,
      auditHash: hash,
    };

    this.auditLogs.push(newLog);

    let alert: AnomalySecurityAlert | undefined = undefined;
    if (isAnomaly) {
      alert = this.createSecurityAlertFromLog(newLog);
      this.logger.warn(`[PHÁT HIỆN DỊ THƯỜNG] ${failureReason} (Tài khoản: ${input.actorId}, IP: ${input.clientIp})`);
    }

    return {
      log: newLog,
      alert,
      isAnomaly,
      anomalyReason: failureReason,
    };
  }

  /**
   * Xử lý cảnh báo an ninh (Khóa tài khoản, Bác bỏ báo động giả, hoặc Yêu cầu Step-Up 2FA)
   */
  async resolveAnomalyAlert(input: ResolveAnomalyAlertInput): Promise<ResolveAnomalyAlertResponse> {
    const alert = this.securityAlerts.find(a => a.id === input.alertId);
    if (!alert) {
      throw new NotFoundException(`Không tìm thấy cảnh báo an ninh có mã '${input.alertId}'`);
    }

    const now = new Date().toISOString();
    alert.resolvedBy = input.resolvedBy;
    alert.resolvedAt = now;
    alert.resolutionNotes = input.notes;

    let message = '';
    switch (input.action) {
      case 'RESOLVE_LOCK':
        alert.status = 'RESOLVED';
        alert.isAccountLocked = true;
        alert.isSessionTerminated = true;
        message = `Đã xác nhận mối đe dọa an ninh, thực hiện khóa vĩnh viễn tài khoản '${alert.targetActorName}' và hủy phiên đăng nhập`;
        break;

      case 'DISMISS_FALSE_POSITIVE':
        alert.status = 'FALSE_POSITIVE';
        alert.isAccountLocked = false;
        message = `Đã xác minh cảnh báo là báo động giả (False Positive) và khôi phục trạng thái hoạt động bình thường`;
        break;

      case 'REQUIRE_STEP_UP':
        alert.status = 'INVESTIGATING';
        alert.requiresStepUpVerification = true;
        message = `Đã gắn cờ yêu cầu thử thách xác thực 2 lớp (Step-Up 2FA) bắt buộc trong lần đăng nhập kế tiếp`;
        break;

      default:
        throw new BadRequestException('Hành động xử lý cảnh báo không được hỗ trợ');
    }

    const auditHash = createHash('sha256')
      .update(`${alert.id}|${input.action}|${input.resolvedBy}|${now}|${input.notes}`)
      .digest('hex');

    alert.auditHash = auditHash;

    this.logger.log(`Cảnh báo an ninh '${alert.id}' đã được xử lý bởi '${input.resolvedBy}': ${message}`);

    return {
      success: true,
      alert,
      auditHash,
      message,
    };
  }
}
