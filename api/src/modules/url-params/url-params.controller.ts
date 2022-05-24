import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { UrlParam } from 'modules/url-params/url-param.entity';
import { UrlParamsService } from 'modules/url-params/url-params.service';

@Controller(`/api/v1/url-params`)
export class UrlParamsController {
  constructor(public readonly urlParamService: UrlParamsService) {}

  @ApiOperation({ description: 'Find URL params set by id' })
  @ApiOkResponse({ type: UrlParam })
  @ApiNotFoundResponse({ description: 'URL params not found' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Record<string, any>> {
    return this.urlParamService.getUrlParamsById(id);
  }

  @ApiOperation({ description: 'Save URL params set' })
  @ApiOkResponse()
  @ApiBadRequestResponse({
    description: 'Bad Request. Incorrect or missing parameters',
  })
  @Post()
  async create(@Body() dto: Record<string, any>): Promise<string> {
    const savedParamsId: string = await this.urlParamService.saveUrlParams(dto);
    return savedParamsId;
  }

  @ApiOperation({ description: 'Deletes a set of URL Params' })
  @ApiOkResponse()
  @ApiNotFoundResponse({ description: 'URL Params not found' })
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.urlParamService.deleteUrlParams(id);
  }
}
