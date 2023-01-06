import { DataSource, Repository } from 'typeorm';
import { UrlParam } from 'modules/url-params/url-param.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UrlParamRepository extends Repository<UrlParam> {
  constructor(private dataSource: DataSource) {
    super(UrlParam, dataSource.createEntityManager());
  }
}
