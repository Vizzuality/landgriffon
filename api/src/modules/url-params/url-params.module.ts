import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlParamRepository } from 'modules/url-params/url-param.repository';
import { UrlParamsService } from 'modules/url-params/url-params.service';
import { UrlParamsController } from 'modules/url-params/url-params.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UrlParamRepository])],
  controllers: [UrlParamsController],
  providers: [UrlParamsService],
  exports: [UrlParamsService],
})
export class UrlParamsModule {}
