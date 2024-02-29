import { Injectable } from '@nestjs/common';
import { IEudrRepository } from './eudr.repositoty.interface';

@Injectable()
export class EudrService {
  constructor(private readonly eudrRepository: IEudrRepository) {}
}
