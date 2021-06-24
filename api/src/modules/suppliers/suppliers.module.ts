import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierRepository } from 'modules/suppliers/supplier.repository';
import { SuppliersController } from 'modules/suppliers/suppliers.controller';
import { SuppliersService } from 'modules/suppliers/suppliers.service';

@Module({
  imports: [TypeOrmModule.forFeature([SupplierRepository])],
  controllers: [SuppliersController],
  providers: [SuppliersService],
  exports: [SuppliersService],
})
export class SuppliersModule {}
