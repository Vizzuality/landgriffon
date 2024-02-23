import { HttpService } from '@nestjs/axios';
import { IEudrRepository } from 'modules/eudr/eudr.repositoty.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CartodbRepository implements IEudrRepository {
  constructor(private readonly http: HttpService) {}

  async select(): Promise<any> {}
}
