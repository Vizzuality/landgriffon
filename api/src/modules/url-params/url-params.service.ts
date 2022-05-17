import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UrlParamRepository } from './url-param.repository';
import { UrlParam } from './url-param.entity';
import { string } from 'yargs';

@Injectable()
export class UrlParamsService {
  constructor(
    @InjectRepository(UrlParamRepository)
    protected readonly urlParamRepository: UrlParamRepository,
  ) {}

  async getUrlParamsById(id: string): Promise<Record<string, any>> {
    const encodedParams: UrlParam | undefined =
      await this.urlParamRepository.findOne(id);

    if (!encodedParams) {
      throw new NotFoundException(` URL APrams set with ID "${id}" not found`);
    }

    const decodedParams: Record<string, any> = JSON.parse(
      Buffer.from(encodedParams.encodedParams, 'base64').toString(),
    );

    return decodedParams;
  }

  async saveUrlParams(dto: Record<string, any>): Promise<string> {
    const encodedParams: string = Buffer.from(JSON.stringify(dto)).toString(
      'base64',
    );

    const savedParams: UrlParam = this.urlParamRepository.create({
      encodedParams,
    });

    return savedParams.id;
  }

  async deleteUrlParams(id: string) {}
}
