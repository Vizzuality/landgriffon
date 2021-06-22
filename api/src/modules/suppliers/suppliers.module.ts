import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuppliersRepository } from './suppliers.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SuppliersRepository])],
})
export class SuppliersModule {}
