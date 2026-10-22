import { Module } from '@nestjs/common';
import { OfficerLifecycleService } from './officer-lifecycle.service';
import { OfficerLifecycleController } from './officer-lifecycle.controller';

@Module({
  controllers: [OfficerLifecycleController],
  providers: [OfficerLifecycleService],
  exports: [OfficerLifecycleService],
})
export class OfficerLifecycleModule {}
