import { Module } from '@nestjs/common';
import { SessionSecurityService } from './session-security.service';
import { SessionSecurityController } from './session-security.controller';

@Module({
  controllers: [SessionSecurityController],
  providers: [SessionSecurityService],
  exports: [SessionSecurityService],
})
export class SessionSecurityModule {}
