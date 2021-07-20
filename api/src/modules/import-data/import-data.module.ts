import { Module } from '@nestjs/common';
import { ImportDataService } from 'modules/import-data/import-data.service';
import { ImportDataController } from 'modules/import-data/import-data.controller';
import { FileModule } from 'modules/files/file.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { AdminRegionsModule } from 'modules/admin-regions/admin-regions.module';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';
import { SourcingRecordsModule } from 'modules/sourcing-records/sourcing-records.module';
import { SourcingRecordGroupsModule } from 'modules/sourcing-record-groups/sourcing-record-groups.module';

@Module({
  imports: [
    FileModule,
    MaterialsModule,
    BusinessUnitsModule,
    SuppliersModule,
    AdminRegionsModule,
    SourcingLocationsModule,
    SourcingRecordsModule,
    SourcingRecordGroupsModule,
  ],
  providers: [ImportDataService],
  controllers: [ImportDataController],
})
export class ImportDataModule {}
