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
import {
  ImportDataProducer,
  importQueueName,
} from 'modules/import-data/workers/import-data.producer';
import { ImportDataConsumer } from 'modules/import-data/workers/import-data.consumer';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { JobEventsModule } from 'modules/job-events/job-events.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: importQueueName.value,
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
    JobEventsModule,
  ],
  providers: [
    SourcingDataImportService,
    FileService,
    SourcingRecordsDtoProcessorService,
    ImportDataProducer,
    ImportDataConsumer,
    ImportDataService,
  ],
  controllers: [ImportDataController],
})
export class ImportDataModule {}
