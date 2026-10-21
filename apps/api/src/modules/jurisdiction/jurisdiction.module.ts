import { Module } from '@nestjs/common';
import { JurisdictionController } from './jurisdiction.controller';
import { JurisdictionService } from './jurisdiction.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [JurisdictionController],
  providers: [JurisdictionService],
  exports: [JurisdictionService],
})
export class JurisdictionModule {}
