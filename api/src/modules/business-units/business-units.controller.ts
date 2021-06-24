import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Delete,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { BusinessUnitsService } from 'modules/business-units/business-units.service';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  JSONAPIQueryParams,
  JSONAPISingleEntityQueryParams,
} from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import {
  BusinessUnit,
  businessUnitResource,
} from 'modules/business-units/business-unit.entity';
import { CreateBusinessUnitsDto } from 'modules/business-units/dto/create.business-units.dto';
import { UpdateBusinessUnitsDto } from 'modules/business-units/dto/update.business-units.dto';

@Controller(`/api/v1/business-units`)
@ApiTags(businessUnitResource.className)
export class BusinessUnitsController {
  constructor(public readonly service: BusinessUnitsService) {}

  @ApiOperation({
    description: 'Find all business units',
  })
  @ApiOkResponse({
    type: BusinessUnit,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<BusinessUnit> {
    const results = await this.service.findAllPaginated(fetchSpecification);
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find business unit by id' })
  @ApiOkResponse({ type: BusinessUnit })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BusinessUnit> {
    return await this.service.serialize(await this.service.getById(id));
  }

  @ApiOperation({ description: 'Create a business unit' })
  @ApiOkResponse({ type: BusinessUnit })
  @Post()
  async create(@Body() dto: CreateBusinessUnitsDto): Promise<BusinessUnit> {
    return await this.service.serialize(await this.service.create(dto));
  }

  @ApiOperation({ description: 'Updates a business unit' })
  @ApiOkResponse({ type: BusinessUnit })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateBusinessUnitsDto,
    @Param('id') id: string,
  ): Promise<BusinessUnit> {
    return await this.service.serialize(await this.service.update(id, dto));
  }

  @ApiOperation({ description: 'Deletes a business unit' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.service.remove(id);
  }
}
