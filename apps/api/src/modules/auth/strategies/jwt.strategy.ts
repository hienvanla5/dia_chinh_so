import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret') || 'diachinhso_jwt_development_secret_key_2026',
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
    }
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
      citizenId: payload.citizenId,
      fullName: payload.fullName,
      organizationName: payload.organizationName,
    };
  }
}
