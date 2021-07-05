import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { UnitsService } from 'modules/units/units.service';
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
import { Unit, unitResource } from 'modules/units/unit.entity';
import { CreateUnitDto } from 'modules/units/dto/create.unit.dto';
import { UpdateUnitDto } from 'modules/units/dto/update.unit.dto';

@Controller(`/api/v1/units`)
@ApiTags(unitResource.className)
export class UnitsController {
  constructor(public readonly unitsService: UnitsService) {}

  @ApiOperation({
    description: 'Find all units',
  })
  @ApiOkResponse({
    type: Unit,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<Unit> {
    const results = await this.unitsService.findAllPaginated(
      fetchSpecification,
    );
    return this.unitsService.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find unit by id' })
  @ApiOkResponse({ type: Unit })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Unit> {
    return await this.unitsService.serialize(
      await this.unitsService.getById(id),
    );
  }

  @ApiOperation({ description: 'Create a unit' })
  @ApiOkResponse({ type: Unit })
  @Post()
  async create(@Body() dto: CreateUnitDto): Promise<Unit> {
    return await this.unitsService.serialize(
      await this.unitsService.create(dto),
    );
  }

  @ApiOperation({ description: 'Updates a unit' })
  @ApiOkResponse({ type: Unit })
  @Patch(':id')
  async update(
    @Body(new ValidationPipe()) dto: UpdateUnitDto,
    @Param('id') id: string,
  ): Promise<Unit> {
    return await this.unitsService.serialize(
      await this.unitsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a unit' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.unitsService.remove(id);
  }
}
