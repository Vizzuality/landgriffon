import { Module } from '@nestjs/common';
import { H3DataController } from 'modules/h3-data/h3-data.controller';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { H3DataRepository } from 'modules/h3-data/h3-data.repository';

@Module({
  imports: [TypeOrmModule.forFeature([H3DataRepository])],
  controllers: [H3DataController],
  providers: [H3DataService],
})
export class H3DataModule {}
