import { AuthService } from './auth.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@diachinhso/shared';

describe('AuthService - [DCS-01-CN-001] Đăng nhập Cổng Định danh Số qua CCCD và OTP SMS', () => {
  let authService: AuthService;
  let mockDb: any;
  let mockJwtService: any;

  const validCitizen = {
    citizenId: '001090012345',
    phoneNumber: '0912345678',
    fullName: 'Nguyễn Văn An',
  };

  const sampleUserInDb = {
    id: 'user-uuid-1',
    citizenId: '001090012345',
    fullName: 'Nguyễn Văn An',
    phoneNumber: '0912345678',
    role: UserRole.LAND_USER,
    isActive: true,
  };

  beforeEach(() => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockImplementation(() => Promise.resolve([sampleUserInDb])),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockImplementation(() => Promise.resolve([sampleUserInDb])),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_access_token_xyz123'),
    };

    authService = new AuthService(mockDb, mockJwtService);
  });

  describe('DCS-01-CN-001-TC-01: Luồng thành công (Happy Path)', () => {
    it('phải gửi mã OTP thành công cho công dân với CCCD và số điện thoại hợp lệ', async () => {
      const response = await authService.sendCitizenOtp({
        citizenId: validCitizen.citizenId,
        phoneNumber: validCitizen.phoneNumber,
        fullName: validCitizen.fullName,
      });

      expect(response.success).toBe(true);
      expect(response.expiresInSeconds).toBe(300);
      expect(response.mockOtp).toBeDefined();
      expect(response.message).toContain('Mã xác thực OTP gồm 6 chữ số');
    });

    it('phải xác thực OTP thành công, cấp Access Token và tạo mã băm kiểm toán SHA-256', async () => {
      // 1. Gửi OTP để lưu vào kho
      const sendRes = await authService.sendCitizenOtp({
        citizenId: validCitizen.citizenId,
        phoneNumber: validCitizen.phoneNumber,
      });

      // 2. Xác thực với đúng mã OTP
      const verifyRes = await authService.verifyCitizenOtp(
        {
          citizenId: validCitizen.citizenId,
          phoneNumber: validCitizen.phoneNumber,
          otpCode: sendRes.mockOtp!,
        },
        { ipAddress: '192.168.1.10', userAgent: 'Chrome/120' },
      );

      expect(verifyRes.accessToken).toBe('mock_jwt_access_token_xyz123');
      expect(verifyRes.user.citizenId).toBe(validCitizen.citizenId);
      expect(verifyRes.user.role).toBe(UserRole.LAND_USER);
      expect(verifyRes.auditHash).toBeDefined();
      expect(verifyRes.auditHash).toHaveLength(64); // Chuỗi hex SHA-256
      expect(verifyRes.walletSummary).toBeDefined();
    });
  });

  describe('DCS-01-CN-001-TC-02: Dữ liệu không hợp lệ (Validation Failure)', () => {
    it('phải từ chối khi số CCCD không đủ 12 chữ số', async () => {
      await expect(
        authService.sendCitizenOtp({
          citizenId: '12345', // Thiếu ký tự
          phoneNumber: validCitizen.phoneNumber,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối khi số CCCD chứa ký tự chữ cái', async () => {
      await expect(
        authService.sendCitizenOtp({
          citizenId: '00109001234A',
          phoneNumber: validCitizen.phoneNumber,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối khi số điện thoại sai định dạng', async () => {
      await expect(
        authService.sendCitizenOtp({
          citizenId: validCitizen.citizenId,
          phoneNumber: 'abc12345',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối xác thực khi mã OTP không đủ 6 chữ số', async () => {
      await expect(
        authService.verifyCitizenOtp({
          citizenId: validCitizen.citizenId,
          phoneNumber: validCitizen.phoneNumber,
          otpCode: '123', // Thiếu chữ số
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DCS-01-CN-001-TC-03: Ràng buộc nghiệp vụ (Business Rules / QTD-07)', () => {
    it('phải từ chối khi nhập sai mã OTP', async () => {
      // 1. Gửi OTP hợp lệ
      await authService.sendCitizenOtp({
        citizenId: validCitizen.citizenId,
        phoneNumber: validCitizen.phoneNumber,
      });

      // 2. Nhập mã OTP sai (999999)
      await expect(
        authService.verifyCitizenOtp({
          citizenId: validCitizen.citizenId,
          phoneNumber: validCitizen.phoneNumber,
          otpCode: '999999',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải từ chối khi mã OTP chưa được yêu cầu hoặc đã hết hạn', async () => {
      await expect(
        authService.verifyCitizenOtp({
          citizenId: '001099999999', // Chưa gửi OTP
          phoneNumber: '0988888888',
          otpCode: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('phải chặn tài khoản công dân bị vô hiệu hóa / tạm khóa theo QTD-07', async () => {
      // Giả lập tài khoản bị khóa trong DB
      mockDb.limit.mockImplementationOnce(() =>
        Promise.resolve([
          {
            ...sampleUserInDb,
            isActive: false, // Bị khóa
          },
        ]),
      );

      await expect(
        authService.sendCitizenOtp({
          citizenId: validCitizen.citizenId,
          phoneNumber: validCitizen.phoneNumber,
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('DCS-01-CN-001-TC-04: Kiểm toán & Đồng bộ bất biến (Audit Trail)', () => {
    it('phải ghi lại nhật ký kiểm toán với mã băm SHA-256 sau khi đăng nhập thành công', async () => {
      const sendRes = await authService.sendCitizenOtp({
        citizenId: validCitizen.citizenId,
        phoneNumber: validCitizen.phoneNumber,
      });

      const verifyRes = await authService.verifyCitizenOtp({
        citizenId: validCitizen.citizenId,
        phoneNumber: validCitizen.phoneNumber,
        otpCode: sendRes.mockOtp!,
      });

      // Xác minh DB insert được gọi cho bảng audit_logs
      expect(mockDb.insert).toHaveBeenCalled();
      expect(verifyRes.auditHash).toMatch(/^[a-f0-9]{64}$/); // Đúng chuẩn SHA-256
    });
  });
});
