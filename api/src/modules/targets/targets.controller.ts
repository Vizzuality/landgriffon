import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JSONAPISingleEntityQueryParams } from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { PaginationMeta } from 'utils/app-base.service';
import { CreateTargetDto } from 'modules/targets/dto/create-target.dto';
import { UpdateTargetDto } from 'modules/targets/dto/update-target.dto';
import { Target, targetResource } from 'modules/targets/target.entity';
import { TargetsService } from 'modules/targets/targets.service';
import { SetUserInterceptor } from 'decorators/set-user.interceptor';

@Controller('api/v1/targets')
@ApiTags(targetResource.className)
@ApiBearerAuth()
export class TargetsController {
  constructor(protected readonly targetsService: TargetsService) {}

  @ApiOperation({ description: 'Find all targets' })
  @ApiOkResponse({ type: Target })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @Get()
  async findAll(
    @ProcessFetchSpecification({
      allowedFilters: targetResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<Target> {
    const results: {
      data: (Partial<Target> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.targetsService.findAllPaginated(fetchSpecification);
    return this.targetsService.serialize(results.data, results.metadata);
  }

  @ApiOperation({ description: 'Find target by id' })
  @ApiOkResponse({ type: Target })
  @ApiNotFoundResponse({ description: 'Target not found' })
  @JSONAPISingleEntityQueryParams()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @ProcessFetchSpecification({
      allowedFilters: targetResource.columnsAllowedAsFilter,
    })
    fetchSpecification: FetchSpecification,
  ): Promise<Target> {
    return this.targetsService.serialize(
      await this.targetsService.getById(id, fetchSpecification),
    );
  }

  @ApiOperation({ description: 'Create a target' })
  @ApiOkResponse({ type: Target })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @UsePipes(ValidationPipe)
  @Post()
  async create(@Body() dto: CreateTargetDto): Promise<Target> {
    return this.targetsService.serialize(await this.targetsService.create(dto));
  }

  @ApiOperation({ description: 'Updates a target' })
  @ApiOkResponse({ type: Target })
  @ApiNotFoundResponse({ description: 'Target not found' })
  @UsePipes(ValidationPipe)
  @UseInterceptors(SetUserInterceptor)
  @Patch(':id')
  async update(
    @Body() dto: UpdateTargetDto,
    @Param('id') id: string,
  ): Promise<Target> {
    return this.targetsService.serialize(
      await this.targetsService.update(id, dto),
    );
  }

  @ApiOperation({ description: 'Deletes a target' })
  @ApiNotFoundResponse({ description: 'Target not found' })
  @ApiOkResponse()
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.targetsService.remove(id);
  }
}
