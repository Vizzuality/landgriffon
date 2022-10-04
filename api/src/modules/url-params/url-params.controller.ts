import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import {
  UrlParam,
  urlParamResource,
} from 'modules/url-params/url-param.entity';
import { UrlParamsService } from 'modules/url-params/url-params.service';
import { SerializedUrlResponseDto } from 'modules/url-params/dto/url-param.response.dto';

@Controller(`/api/v1/url-params`)
@ApiTags(urlParamResource.className)
@ApiBearerAuth()
export class UrlParamsController {
  constructor(public readonly urlParamService: UrlParamsService) {}

  @ApiOperation({ description: 'Find URL params set by id' })
  @ApiOkResponse({ type: SerializedUrlResponseDto })
  @ApiNotFoundResponse({ description: 'URL params not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Partial<UrlParam>> {
    return this.urlParamService.serialize(
      await this.urlParamService.getById(id),
    );
  }

  @ApiOperation({ description: 'Save URL params set' })
  @ApiOkResponse({ type: SerializedUrlResponseDto })
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  async create(@Body() dto: Record<string, any>): Promise<Partial<UrlParam>> {
    return this.urlParamService.serialize(
      await this.urlParamService.saveUrlParams(dto),
    );
  }

  @ApiOperation({ description: 'Deletes a set of URL Params' })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: 'URL Params not found' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.urlParamService.deleteUrlParams(id);
  }
}
