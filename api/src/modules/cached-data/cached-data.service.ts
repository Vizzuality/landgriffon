import { Injectable } from '@nestjs/common';
import { CachedDataRepository } from 'modules/cached-data/cached-data.repository';
import {
  CachedData,
  CACHED_DATA_TYPE,
} from 'modules/cached-data/cached.data.entity';
import { InjectRepository } from '@nestjs/typeorm';
import objectHash = require('object-hash');

@Injectable()
export class CachedDataService {
  constructor(
    @InjectRepository(CachedDataRepository)
    private readonly cachedDataRepository: CachedDataRepository,
  ) {}

  /**
   * Generates a MD5 hash string from the incoming object. UnorderedArrays is to true so that objectHash
   * orders the arrays before hashing. respectTypes is set to false in order to ignore all special attributes
   * (prototype, constructor, etc); only the data of the object is relevant
   *
   * NOTE keep in mind that objectHash, hashes the object based on *all* the information from the object,
   * including types; so, it's best used for simple objects, instead of composition of Entities to avoid
   * weird cases of non matching hashes of virtually identical objects because of runtime typing.
   * @param keyToBeHashed
   */
  generateKeyHash(keyToBeHashed: any): string {
    return objectHash(keyToBeHashed, {
      unorderedArrays: true,
      respectType: false,
    });
  }

  async getCachedDataByKey(
    keyToBeHashed: any,
    type: CACHED_DATA_TYPE,
  ): Promise<CachedData | undefined> {
    return this.cachedDataRepository.findOne({
      hashedKey: this.generateKeyHash(keyToBeHashed),
      type,
    });
  }

  async createCachedData(
    keyToBeHashed: any,
    data: any,
    type: CACHED_DATA_TYPE,
  ): Promise<CachedData> {
    const cachedData: any = {
      hashedKey: this.generateKeyHash(keyToBeHashed),
      data,
      type,
    };
    return this.cachedDataRepository.save(cachedData);
  }
}
