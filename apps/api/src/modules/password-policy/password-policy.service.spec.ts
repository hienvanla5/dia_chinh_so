import { PasswordPolicyService } from './password-policy.service';
import { UserRole } from '@diachinhso/shared';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('PasswordPolicyService (DCS-01-CN-007)', () => {
  let service: PasswordPolicyService;

  const mockAdminUser = {
    id: 'ADMIN-SYS-001',
    username: 'quantri.hethong',
    role: UserRole.ADMIN,
  };

  const mockNonAdminUser = {
    id: 'OFF-HN-001',
    username: 'nguyen.van.a.dc',
    role: UserRole.COMMUNE_OFFICER,
  };

  beforeEach(() => {
    service = new PasswordPolicyService();
  });

  describe('DCS-01-CN-007-TC-01: Luồng thành công', () => {
    it('quản trị viên cập nhật thành công chính sách mật khẩu và sinh mã băm SHA-256', async () => {
      const updatedPolicy = await service.updatePolicy(
        {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          passwordExpiryDays: 60,
          preventPasswordReuseCount: 6,
          maxFailedAttempts: 5,
          lockoutDurationMinutes: 45,
          trustedIpRanges: ['10.0.0.0/8', '192.168.1.0/24'],
        },
        mockAdminUser
      );

      expect(updatedPolicy.minLength).toBe(12);
      expect(updatedPolicy.passwordExpiryDays).toBe(60);
      expect(updatedPolicy.lockoutDurationMinutes).toBe(45);
      expect(updatedPolicy.auditHash).toBeDefined();
      expect(updatedPolicy.auditHash.length).toBe(64);

      const policyInDb = await service.getPolicy();
      expect(policyInDb.minLength).toBe(12);
      expect(policyInDb.auditHash).toBe(updatedPolicy.auditHash);
    });

    it('đánh giá mật khẩu đạt chuẩn mạnh (VERY_STRONG)', async () => {
      const result = await service.validatePassword({
        password: 'DiaChinhSo@2026!Vn2000',
        username: 'canbo.hanoi',
      });

      expect(result.valid).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.strength).toBe('VERY_STRONG');
      expect(result.errors.length).toBe(0);
    });
  });

  describe('DCS-01-CN-007-TC-02: Dữ liệu không hợp lệ', () => {
    it('từ chối khi cấu hình độ dài tối thiểu nhỏ hơn 8 ký tự', async () => {
      await expect(
        service.updatePolicy(
          {
            minLength: 6, // Không hợp lệ (tối thiểu 8)
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            passwordExpiryDays: 90,
            preventPasswordReuseCount: 5,
            maxFailedAttempts: 5,
            lockoutDurationMinutes: 30,
          },
          mockAdminUser
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối khi cấu hình số lần thử tối đa nhỏ hơn 3 hoặc lớn hơn 10', async () => {
      await expect(
        service.updatePolicy(
          {
            minLength: 10,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            passwordExpiryDays: 90,
            preventPasswordReuseCount: 5,
            maxFailedAttempts: 2, // Quá nhỏ
            lockoutDurationMinutes: 30,
          },
          mockAdminUser
        )
      ).rejects.toThrow(BadRequestException);
    });

    it('từ chối khi thời gian khóa tài khoản nhỏ hơn 5 phút', async () => {
      await expect(
        service.updatePolicy(
          {
            minLength: 10,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            passwordExpiryDays: 90,
            preventPasswordReuseCount: 5,
            maxFailedAttempts: 5,
            lockoutDurationMinutes: 2, // Quá nhỏ
          },
          mockAdminUser
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DCS-01-CN-007-TC-03: Ràng buộc nghiệp vụ (QTD-22 & Phân quyền)', () => {
    it('chặn người dùng không có vai trò ADMIN cập nhật chính sách', async () => {
      await expect(
        service.updatePolicy(
          {
            minLength: 10,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            passwordExpiryDays: 90,
            preventPasswordReuseCount: 5,
            maxFailedAttempts: 5,
            lockoutDurationMinutes: 30,
          },
          mockNonAdminUser as any
        )
      ).rejects.toThrow(ForbiddenException);
    });

    it('phát hiện và từ chối mật khẩu yếu không đủ độ dài', async () => {
      const result = await service.validatePassword({
        password: 'Abc@1', // 5 ký tự < 10
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('độ dài tối thiểu'))).toBe(true);
    });

    it('phát hiện mật khẩu thiếu ký tự đặc biệt', async () => {
      const result = await service.validatePassword({
        password: 'DiaChinhSo2026Vn', // Không có ký tự đặc biệt
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('ký tự đặc biệt'))).toBe(true);
    });

    it('từ chối mật khẩu chứa tên đăng nhập cán bộ', async () => {
      const result = await service.validatePassword({
        password: 'Password@nguyen.van.a.dc#2026',
        username: 'nguyen.van.a.dc',
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('tên đăng nhập'))).toBe(true);
    });
  });

  describe('DCS-01-CN-007-TC-04: Kiểm toán & Chống tấn công brute-force', () => {
    it('tự động khóa địa chỉ IP khi đăng nhập sai vượt quá 5 lần liên tiếp', async () => {
      const ip = '198.51.100.222';
      const username = 'canbo.test';

      for (let i = 1; i <= 4; i++) {
        const attempt = await service.recordFailedLoginAttempt(ip, username);
        expect(attempt.blocked).toBe(false);
        expect(attempt.attemptsRemaining).toBe(5 - i);
      }

      // Lần thứ 5: Tự động khóa IP
      const finalAttempt = await service.recordFailedLoginAttempt(ip, username);
      expect(finalAttempt.blocked).toBe(true);
      expect(finalAttempt.attemptsRemaining).toBe(0);
      expect(finalAttempt.blockedUntil).toBeDefined();

      // Kiểm tra IP có trong danh sách bị khóa
      const blockedList = await service.getBlockedIps();
      expect(blockedList.some(b => b.ipAddress === ip)).toBe(true);
    });

    it('quản trị viên mở khóa địa chỉ IP thủ công thành công kèm lưu nhật ký SHA-256', async () => {
      const unblockResult = await service.unblockIp(
        {
          ipAddress: '203.0.113.45',
          reason: 'Cán bộ xác nhận quên mật khẩu và đã được cấp lại thông tin xác thực',
        },
        mockAdminUser
      );

      expect(unblockResult.success).toBe(true);
      expect(unblockResult.ipAddress).toBe('203.0.113.45');
      expect(unblockResult.auditHash).toBeDefined();

      const blockedList = await service.getBlockedIps();
      expect(blockedList.some(b => b.ipAddress === '203.0.113.45')).toBe(false);

      const logs = await service.getAuditLogs();
      expect(logs[0].action).toBe('UNBLOCK_IP');
      expect(logs[0].auditHash).toBe(unblockResult.auditHash);
    });

    it('từ chối mở khóa khi IP không nằm trong danh sách bị khóa', async () => {
      await expect(
        service.unblockIp(
          {
            ipAddress: '127.0.0.1',
            reason: 'Mở khóa nhầm',
          },
          mockAdminUser
        )
      ).rejects.toThrow(NotFoundException);
    });
  });
});
