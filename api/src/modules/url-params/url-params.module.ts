import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlParam } from 'modules/url-params/url-param.entity';
import { UrlParamsService } from 'modules/url-params/url-params.service';
import { UrlParamsController } from 'modules/url-params/url-params.controller';
import { UrlParamRepository } from 'modules/url-params/url-param.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UrlParam])],
  controllers: [UrlParamsController],
  providers: [UrlParamsService, UrlParamRepository],
  exports: [UrlParamsService],
})
export class UrlParamsModule {}
