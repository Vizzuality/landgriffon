import { Module } from '@nestjs/common';
import { ImportDataController } from 'modules/import-data/import-data.controller';
import { MaterialsModule } from 'modules/materials/materials.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { SourcingLocationGroupsModule } from 'modules/sourcing-location-groups/sourcing-location-groups.module';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { SourcingRecordsImportService } from 'modules/import-data/sourcing-records/import.service';
import { SourcingRecordsDtoProcessorService } from 'modules/import-data/sourcing-records/dto-processor.service';

@Module({
  imports: [
    MaterialsModule,
    BusinessUnitsModule,
    SuppliersModule,
    AdminRegionsModule,
    SourcingLocationsModule,
    SourcingRecordsModule,
    SourcingLocationGroupsModule,
  ],
  providers: [
    SourcingRecordsImportService,
    ImportDataService,
    SourcingRecordsDtoProcessorService,
  ],
  controllers: [ImportDataController],
})
export class ImportDataModule {}
