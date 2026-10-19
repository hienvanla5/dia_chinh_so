import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DRIZZLE, DrizzleDB } from '../../database/drizzle.provider';
import { users } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { UserRole } from '@diachinhso/shared';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private readonly jwtService: JwtService,
  ) {}

  // 1. Xác thực Người dân qua Mock Citizen IdP (Thay thế VNeID Sandbox trong Môi trường Dev/Staging)
  async citizenLogin(citizenId: string, fullName: string, phoneNumber: string) {
    // Tìm hoặc tạo tài khoản người dân sandbox
    let [user] = await this.db.select().from(users).where(eq(users.citizenId, citizenId)).limit(1);

    if (!user) {
      const [newUser] = await this.db
        .insert(users)
        .values({
          citizenId,
          fullName,
          phoneNumber,
          role: UserRole.LAND_USER,
        })
        .returning();
      user = newUser;
    }

    const payload = {
      sub: user.id,
      citizenId: user.citizenId,
      fullName: user.fullName,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        citizenId: user.citizenId,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  // 2. Đăng nhập Cán bộ nghiệp vụ (Xã, VPĐKĐĐ, Công chứng/Ngân hàng, Thanh tra, Admin)
  async officerLogin(username: string, passwordHash: string, role: UserRole) {
    let [user] = await this.db.select().from(users).where(eq(users.username, username)).limit(1);

    // Seed cán bộ mặc định trong môi trường dev nếu chưa có
    if (!user) {
      const [newUser] = await this.db
        .insert(users)
        .values({
          username,
          fullName: `Cán bộ ${username.toUpperCase()}`,
          passwordHash: 'seeded_demo_hash',
          role,
          department: 'Hệ thống Quản lý Địa chính số',
        })
        .returning();
      user = newUser;
    }

    const payload = {
      sub: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      organizationName: user.department,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
      },
    };
  }
}
