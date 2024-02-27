import { Controller, Get } from '@nestjs/common';
import { Public } from 'decorators/public.decorator';
import { CartoConnector } from 'modules/eudr/carto/carto.connector';

@Controller('/api/v1/eudr')
export class EudrController {
  constructor(private readonly carto: CartoConnector) {}

  @Public()
  @Get('test')
  async select(): Promise<any> {
    return this.carto.select('select * from cartobq.eudr.mock_data limit 10');
  }
}
