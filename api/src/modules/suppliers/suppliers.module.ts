import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { SuppliersController } from 'modules/suppliers/suppliers.controller';
import { SuppliersService } from 'modules/suppliers/suppliers.service';
import { SourcingLocationsModule } from 'modules/sourcing-locations/sourcing-locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SupplierRepository]),
    SourcingLocationsModule,
  ],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
