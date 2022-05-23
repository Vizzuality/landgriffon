import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UrlParamRepository } from './url-param.repository';
import { UrlParam } from './url-param.entity';

@Injectable()
export class UrlParamsService {
  constructor(
    @InjectRepository(UrlParamRepository)
    protected readonly urlParamRepository: UrlParamRepository,
  ) {}

  async getUrlParamsById(id: string): Promise<Record<string, any>> {
    const encodedResult: UrlParam | undefined =
      await this.urlParamRepository.findOne(id);

    if (!encodedResult) {
      throw new NotFoundException(` URL APrams set with ID "${id}" not found`);
    }

    const decodedParams: Record<string, any> = JSON.parse(
      encodedResult.encodedParams,
    );

    return decodedParams;
  }

  async saveUrlParams(dto: Record<string, any>): Promise<string> {
    const encodedParams: string = JSON.stringify(dto);

    let savedParams: UrlParam | undefined =
      await this.urlParamRepository.findOne({
        encodedParams,
      });

    if (!savedParams) {
      savedParams = this.urlParamRepository.create({
        encodedParams,
      });
    }

    return savedParams.id;
  }

  async deleteUrlParams(id: string) {
    await this.urlParamRepository.delete({ id });
  }
}
