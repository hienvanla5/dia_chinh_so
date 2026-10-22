import { Module } from '@nestjs/common';
import { AuthAuditService } from './auth-audit.service';
import { AuthAuditController } from './auth-audit.controller';

@Module({
  controllers: [AuthAuditController],
  providers: [AuthAuditService],
  exports: [AuthAuditService],
})
export class AuthAuditModule {}
