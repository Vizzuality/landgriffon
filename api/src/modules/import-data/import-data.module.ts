import { Module } from '@nestjs/common';
import { ImportDataController } from 'modules/import-data/import-data.controller';
import { MaterialsModule } from 'modules/materials/materials.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { SourcingLocationGroupsModule } from 'modules/sourcing-location-groups/sourcing-location-groups.module';
import { FileService } from 'modules/import-data/file.service';
import { SourcingDataImportService } from 'modules/import-data/sourcing-data/sourcing-data-import.service';
import { SourcingRecordsDtoProcessorService } from 'modules/import-data/sourcing-data/dto-processor.service';
import { GeoCodingModule } from 'modules/geo-coding/geo-coding.module';
import { GeoRegionsModule } from 'modules/geo-regions/geo-regions.module';
import { IndicatorRecordsModule } from 'modules/indicator-records/indicator-records.module';
import { BullModule } from '@nestjs/bull';
import { ImportDataProducer } from 'modules/import-data/workers/import-data.producer';
import { ImportDataConsumer } from 'modules/import-data/workers/import-data.consumer';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { TasksModule } from 'modules/tasks/tasks.module';
import { importQueueName } from 'modules/import-data/workers/import-queue.name';
import { ScenariosModule } from 'modules/scenarios/scenarios.module';
import { IndicatorsModule } from 'modules/indicators/indicators.module';
import { MulterModule } from '@nestjs/platform-express';
import * as config from 'config';
import MulterConfigService from 'modules/import-data/multer-config.service';
import { ImpactModule } from 'modules/impact/impact.module';
import { EudrImportService } from 'modules/import-data/eudr/eudr.import.service';
import { EUDRDTOProcessor } from 'modules/import-data/eudr/eudr.dto-processor.service';

// TODO: Move EUDR related stuff to EUDR modules

@Module({
  imports: [
    MulterModule.registerAsync({
      useExisting: MulterConfigService,
      imports: [ImportDataModule],
    }),
    BullModule.registerQueue({
      name: importQueueName,
    }),
    BullModule.registerQueue({
      name: 'eudr',
    }),
    MaterialsModule,
    BusinessUnitsModule,
    SuppliersModule,
    AdminRegionsModule,
    SourcingLocationsModule,
    SourcingRecordsModule,
    SourcingLocationGroupsModule,
    GeoCodingModule,
    GeoRegionsModule,
    IndicatorRecordsModule,
    TasksModule,
    ScenariosModule,
    IndicatorsModule,
    ImpactModule,
  ],
  providers: [
    MulterConfigService,
    SourcingDataImportService,
    FileService,
    SourcingRecordsDtoProcessorService,
    ImportDataProducer,
    ImportDataConsumer,
    ImportDataService,
    EudrImportService,
    EUDRDTOProcessor,
    {
      provide: 'FILE_UPLOAD_SIZE_LIMIT',
      useValue: config.get('fileUploads.sizeLimit'),
    },
    {
      provide: 'FILE_UPLOAD_ALLOWED_FILE_EXTENSION',
      useValue: '.xlsx',
    },
    {
      provide: 'FILE_UPLOAD_STORAGE_PATH',
      useValue: config.get('fileUploads.storagePath'),
    },
  ],
  controllers: [ImportDataController],
  exports: [ImportDataService, MulterConfigService],
})
export class ImportDataModule {}
