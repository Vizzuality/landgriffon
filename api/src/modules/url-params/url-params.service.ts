import { Injectable, NotFoundException } from '@nestjs/common';
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
      attributes: ['encodedParams', 'id'],
      keyForAttribute: 'camelCase',
    };
  }

  async getUrlParamsById(id: string): Promise<Record<string, any>> {
    const encodedResult: UrlParam | undefined =
      await this.urlParamRepository.findOne(id);

    if (!encodedResult) {
      throw new NotFoundException(` URL APrams set with ID "${id}" not found`);
    }

    const decodedParams: Record<string, any> = JSON.parse(
      encodedResult.encodedParams,
    );

    return { data: decodedParams };
  }

  async saveUrlParams(dto: Record<string, any>): Promise<Partial<UrlParam>> {
    const encodedParams: string = JSON.stringify(dto);

    const savedParams: UrlParam | undefined =
      await this.urlParamRepository.findOne({
        encodedParams,
      });

    if (!savedParams) {
      const newParams: UrlParam = await this.urlParamRepository.save({
        encodedParams,
      });
      return { id: newParams.id };
    }

    return { id: savedParams.id };
  }

  async deleteUrlParams(id: string) {
    await this.urlParamRepository.delete({ id });
  }
}
