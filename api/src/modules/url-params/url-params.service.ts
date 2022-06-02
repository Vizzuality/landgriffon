import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UrlParamRepository } from './url-param.repository';
import { UrlParam, urlParamResource } from './url-param.entity';
import { AppInfoDTO } from 'dto/info.dto';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';

@Injectable()
export class UrlParamsService extends AppBaseService<
  UrlParam,
  Record<string, any>,
  Record<string, any>,
  AppInfoDTO
> {
  constructor(
    @InjectRepository(UrlParamRepository)
    protected readonly urlParamRepository: UrlParamRepository,
  ) {
    super(
      urlParamRepository,
      urlParamResource.name.singular,
      urlParamResource.name.plural,
    );
  }

  get serializerConfig(): JSONAPISerializerConfig<UrlParam> {
    return {
      attributes: ['params'],
      keyForAttribute: 'camelCase',
    };
  }

  async saveUrlParams(dto: Record<string, any>): Promise<Partial<UrlParam>> {
    const savedParams: UrlParam | undefined =
      await this.urlParamRepository.findOne({
        params: dto,
      });

    if (!savedParams) {
      const newParams: UrlParam = await this.urlParamRepository.save({
        params: dto,
      });
      return { id: newParams.id };
    }

    return { id: savedParams.id };
  }

  async deleteUrlParams(id: string) {
    await this.urlParamRepository.delete({ id });
  }
}
