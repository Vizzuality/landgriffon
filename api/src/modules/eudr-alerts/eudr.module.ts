import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EudrService } from 'modules/eudr-alerts/eudr.service';
import { EudrController } from 'modules/eudr-alerts/eudr.controller';
import { MaterialsModule } from 'modules/materials/materials.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { GeoRegionsModule } from 'modules/geo-regions/geo-regions.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { AlertsRepository } from 'modules/eudr-alerts/alerts.repository';
import { AppConfig } from 'utils/app.config';

export const IEUDRAlertsRepositoryToken: symbol = Symbol(
  'IEUDRAlertsRepository',
);
export const EUDRDataSetToken: symbol = Symbol('EUDRDataSet');
export const EUDRCredentialsToken: symbol = Symbol('EUDRCredentials');

const { credentials, dataset } = AppConfig.get('eudr');

// TODO: Use token injection and refer to the interface, right now I am having a dependencv issue
@Module({
  imports: [
    HttpModule,
    MaterialsModule,
    SuppliersModule,
    GeoRegionsModule,
    AdminRegionsModule,
  ],
  providers: [
    EudrService,
    { provide: 'IEUDRAlertsRepository', useClass: AlertsRepository },
    { provide: 'EUDRDataset', useValue: dataset },
    { provide: 'EUDRCredentials', useValue: credentials },
  ],
  controllers: [EudrController],
})
export class EudrModule {}
