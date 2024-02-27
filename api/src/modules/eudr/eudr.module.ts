import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EudrService } from 'modules/eudr/eudr.service';
import { EudrController } from 'modules/eudr/eudr.controller';
import { CartodbRepository } from 'modules/eudr/carto/cartodb.repository';
import { CartoConnector } from './carto/carto.connector';

@Module({
  imports: [HttpModule],
  providers: [EudrService, CartodbRepository, CartoConnector],
  controllers: [EudrController],
})
export class EudrModule {}
