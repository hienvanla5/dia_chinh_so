import { Module } from '@nestjs/common';
import { DossierService } from './dossier.service';
import { DossierController } from './dossier.controller';

@Module({
  controllers: [DossierController],
  providers: [DossierService],
  exports: [DossierService],
})
export class DossierModule {}
