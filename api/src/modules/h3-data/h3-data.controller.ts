import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { H3DataService } from 'modules/h3-data/h3-data.service';
import { H3Data } from 'modules/h3-data/h3-data.entity';

@Controller('api/v1/h3-data')
@ApiTags(H3Data.name)
export class H3DataController {
  constructor(protected readonly h3DataService: H3DataService) {}

  @ApiOperation({ description: 'Get all H3 table info' })
  @ApiOkResponse({ type: () => H3Data })
  @Get()
  async findAll(): Promise<H3Data[]> {
    return await this.h3DataService.findAll();
  }
  @ApiOperation({ description: 'Retrieve one H3 data providing its name' })
  @Get(':h3name')
  async findOneByName(@Param('h3name') h3tableName: string): Promise<unknown> {
    return await this.h3DataService.findOne(h3tableName);
  }
}
