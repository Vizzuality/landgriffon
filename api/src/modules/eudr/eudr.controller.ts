import { Controller, Get } from '@nestjs/common';
import { Public } from 'decorators/public.decorator';
import { CartodbRepository } from 'modules/eudr/carto/cartodb.repository';

@Controller('/api/v1/eudr')
export class EudrController {
  constructor(private readonly eudr: CartodbRepository) {}

  @Public()
  @Get()
  async select(): Promise<any> {
    return this.eudr.select();
  }
}
