import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EudrService } from 'modules/eudr/eudr.service';
import { EudrController } from 'modules/eudr/eudr.controller';
import { CartodbRepository } from 'modules/eudr/cartodb.repository';

@Module({
  imports: [HttpModule],
  providers: [EudrService, CartodbRepository],
  controllers: [EudrController],
})
export class EudrModule {}
