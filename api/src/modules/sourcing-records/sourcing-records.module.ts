import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SourcingRecordRepository } from 'modules/sourcing-records/sourcing-record.repository';
import { SourcingRecordsController } from 'modules/sourcing-records/sourcing-records.controller';
import { SourcingRecordsService } from 'modules/sourcing-records/sourcing-records.service';
import { FileModule } from 'modules/files/file.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SourcingRecordRepository]),
    FileModule,
    MaterialsModule,
    BusinessUnitsModule,
    SuppliersModule,
  ],
  controllers: [SourcingRecordsController],
  providers: [SourcingRecordsService],
  exports: [SourcingRecordsService],
})
export class SourcingRecordsModule {}
