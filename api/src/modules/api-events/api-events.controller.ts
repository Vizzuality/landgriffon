import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RequestWithAuthenticatedUser } from 'app.controller';
import { JSONAPIQueryParams } from 'decorators/json-api-parameters.decorator';
import {
  FetchSpecification,
  ProcessFetchSpecification,
} from 'nestjs-base-service';

import { DeleteResult } from 'typeorm';

import {
  API_EVENT_KINDS,
  ApiEvent,
  ApiEventResult,
  QualifiedEventTopic,
} from 'modules/api-events/api-event.entity';
import { ApiEventsService } from 'modules/api-events/api-events.service';
import { CreateApiEventDTO } from 'modules/api-events/dto/create.api-event.dto';
import { PaginationMeta } from 'utils/app-base.service';

@Controller(`/api/v1/api-events`)
@ApiTags('ApiEvents')
export class ApiEventsController {
  constructor(public service: ApiEventsService) {}

  @ApiOperation({
    description: 'Find all API events',
  })
  @ApiOkResponse({
    type: ApiEventResult,
  })
  @ApiUnauthorizedResponse()
  @ApiForbiddenResponse()
  @JSONAPIQueryParams()
  @Get()
  async findAll(
    @ProcessFetchSpecification() fetchSpecification: FetchSpecification,
  ): Promise<ApiEventResult> {
    const results: {
      data: (Partial<ApiEvent> | undefined)[];
      metadata: PaginationMeta | undefined;
    } = await this.service.findAllPaginated(fetchSpecification);
    return this.service.serialize(results.data, results.metadata);
  }

  @ApiOperation({
    description: 'Find latest API event by kind for a given topic',
  })
  @ApiOkResponse({ type: ApiEvent })
  @Get('kind/:kind/topic/:topic/latest')
  async findLatestEventByKindAndTopic(
    @Param('kind') kind: API_EVENT_KINDS,
    @Param('topic') topic: string,
  ): Promise<ApiEventResult> {
    return await this.service.serialize(
      (await this.service.getLatestEventForTopic({ topic, kind })) as ApiEvent,
    );
  }

  @ApiOperation({ description: 'Create an API event' })
  @ApiOkResponse({ type: ApiEvent })
  @Post()
  @UsePipes(ValidationPipe)
  async create(
    @Body() dto: CreateApiEventDTO,
    @Req() req: RequestWithAuthenticatedUser,
  ): Promise<ApiEventResult> {
    return await this.service.serialize(
      await this.service.create(dto, { authenticatedUser: req.user }),
    );
  }

  @ApiOperation({
    description: 'Delete API event series by kind for a given topic',
  })
  @ApiOkResponse({ type: ApiEvent })
  @Delete('kind/:kind/topic/:topic')
  async deleteEventSeriesByKindAndTopic(
    @Param('kind') kind: API_EVENT_KINDS,
    @Param('topic') topic: string,
  ): Promise<DeleteResult> {
    return await this.service.purgeAll({ kind, topic } as QualifiedEventTopic);
  }
}
