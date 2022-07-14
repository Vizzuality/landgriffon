import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { cachedDataResource } from 'modules/cached-data/cached.data.entity';

@Controller(`/api/v1/indicator-records`)
@ApiTags(cachedDataResource.className)
@ApiBearerAuth()
export class CachedDataController {}
