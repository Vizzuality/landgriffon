import { EntityRepository, Repository } from 'typeorm';
import { UrlParam } from 'modules/url-params/url-param.entity';

@EntityRepository(UrlParam)
export class UrlParamRepository extends Repository<UrlParam> {}
