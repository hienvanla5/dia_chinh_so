import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './common/redis/redis.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ParcelModule } from './modules/parcel/parcel.module';
import { LockModule } from './modules/lock/lock.module';
import { CertificateModule } from './modules/certificate/certificate.module';
import { DossierModule } from './modules/dossier/dossier.module';
import { SpatialModule } from './modules/spatial/spatial.module';
import { JurisdictionModule } from './modules/jurisdiction/jurisdiction.module';
import { DigitalSignatureModule } from './modules/digital-signature/digital-signature.module';
import { SessionSecurityModule } from './modules/session-security/session-security.module';
import { OfficerLifecycleModule } from './modules/officer-lifecycle/officer-lifecycle.module';
import { PasswordPolicyModule } from './modules/password-policy/password-policy.module';
import { DelegationModule } from './modules/delegation/delegation.module';
import { EnterpriseIdpModule } from './modules/enterprise-idp/enterprise-idp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    ParcelModule,
    LockModule,
    CertificateModule,
    DossierModule,
    SpatialModule,
    JurisdictionModule,
    DigitalSignatureModule,
    SessionSecurityModule,
    OfficerLifecycleModule,
    PasswordPolicyModule,
    DelegationModule,
    EnterpriseIdpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
