import { Module } from '@nestjs/common';
import { EnterpriseIdpService } from './enterprise-idp.service';
import { EnterpriseIdpController } from './enterprise-idp.controller';

@Module({
  controllers: [EnterpriseIdpController],
  providers: [EnterpriseIdpService],
  exports: [EnterpriseIdpService],
})
export class EnterpriseIdpModule {}
