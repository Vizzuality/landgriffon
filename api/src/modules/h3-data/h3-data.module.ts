import { forwardRef, Module } from '@nestjs/common';
import { H3DataController } from 'modules/h3-data/h3-data.controller';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';
import { RiskMapModule } from 'modules/risk-map/risk-map.module';
import { MaterialsModule } from 'modules/materials/materials.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([H3DataRepository]),
    forwardRef(() => RiskMapModule),
    MaterialsModule,
  ],
  controllers: [H3DataController],
  providers: [H3DataService],
  exports: [H3DataService],
})
export class H3DataModule {}
