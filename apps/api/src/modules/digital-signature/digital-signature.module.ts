import { Module } from '@nestjs/common';
import { DigitalSignatureService } from './digital-signature.service';
import { DigitalSignatureController } from './digital-signature.controller';

@Module({
  controllers: [DigitalSignatureController],
  providers: [DigitalSignatureService],
  exports: [DigitalSignatureService],
})
export class DigitalSignatureModule {}
