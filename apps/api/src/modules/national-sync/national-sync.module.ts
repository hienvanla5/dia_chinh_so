import { Module } from '@nestjs/common';
import { NationalSyncService } from './national-sync.service';
import { NationalSyncController } from './national-sync.controller';

@Module({
  controllers: [NationalSyncController],
  providers: [NationalSyncService],
  exports: [NationalSyncService],
})
export class NationalSyncModule {}
