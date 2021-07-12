import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UnitConversionsService } from 'modules/unit-conversions/unit-conversions.service';
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
  UnitConversion,
  unitConversionResource,
} from 'modules/unit-conversions/unit-conversion.entity';
import { CreateUnitConversionDto } from 'modules/unit-conversions/dto/create.unit-conversion.dto';
import { UpdateUnitConversionDto } from 'modules/unit-conversions/dto/update.unit-conversion.dto';

@Controller(`/api/v1/unit-conversions`)
@ApiTags(unitConversionResource.className)
export class UnitConversionsController {
  constructor(public readonly unitConversionsService: UnitConversionsService) {}

  @ApiOperation({
    description: 'Find all conversion units',
  })
  @ApiOkResponse({
    type: UnitConversion,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<UnitConversion> {
    const results = await this.unitConversionsService.findAllPaginated(
      fetchSpecification,
    );
    return this.unitConversionsService.serialize(
      results.data,
      results.metadata,
    );
  }

  @ApiOperation({ description: 'Find conversion unit by id' })
  @ApiOkResponse({ type: UnitConversion })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UnitConversion> {
    return await this.unitConversionsService.serialize(
      await this.unitConversionsService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a conversion unit' })
  @ApiOkResponse({ type: UnitConversion })
  @Post()
  @UsePipes(ValidationPipe)
  async create(@Body() dto: CreateUnitConversionDto): Promise<UnitConversion> {
    return await this.unitConversionsService.serialize(
      await this.unitConversionsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a conversion unit' })
  @ApiOkResponse({ type: UnitConversion })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateUnitConversionDto,
    @Param('id') id: string,
  ): Promise<UnitConversion> {
    return await this.unitConversionsService.serialize(
      await this.unitConversionsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a conversion unit' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.unitConversionsService.remove(id);
  }
}
