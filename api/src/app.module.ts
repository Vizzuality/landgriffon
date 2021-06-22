import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'typeorm.config';
import { AuthenticationModule } from 'modules/authentication/authentication.module';
import { UsersModule } from 'modules/users/users.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from 'filters/all-exceptions.exception.filter';
import { SuppliersModule } from 'modules/suppliers/suppliers.module';
import { BusinessUnitsModule } from 'modules/business-units/business-units.module';
import { MaterialsModule } from 'modules/materials/materials.module';
import { LayersModule } from 'modules/layers/layers.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    AuthenticationModule,
    UsersModule,
    SuppliersModule,
    BusinessUnitsModule,
    MaterialsModule,
    LayersModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
