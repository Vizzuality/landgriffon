import {
  Body,
  Controller,
  Get,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';
import { PaginationMeta } from 'utils/app-base.service';
import { CreateTargetDto } from './dto/create-target.dto';
import { Target, targetResource } from './target.entity';
import { TargetsService } from './targets.service';

@Controller('api/v1/targets')
@ApiTags(targetResource.className)
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

  @ApiOperation({ description: 'Create a target' })
  @ApiOkResponse({ type: Target })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @UsePipes(ValidationPipe)
  @Post()
  async create(@Body() dto: CreateTargetDto): Promise<Target> {
    return await this.targetsService.serialize(
      await this.targetsService.create(dto),
    );
  }
}
