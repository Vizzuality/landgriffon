import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DeleteResult, Repository } from 'typeorm';

import {
  ApiEvent,
  apiEventResource,
  QualifiedEventTopic,
} from 'modules/api-events/api-event.entity';
import {
  ApiEventByTopicAndKind,
  LatestApiEventByTopicAndKind,
} from 'modules/api-events/api-event.topic+kind.entity';

import { isNil } from 'lodash';
import {
  AppBaseService,
  JSONAPISerializerConfig,
} from 'utils/app-base.service';
import { CreateApiEventDTO } from 'modules/api-events/dto/create.api-event.dto';
import { UpdateApiEventDTO } from 'modules/api-events/dto/update.api-event.dto';
import { AppInfoDTO } from 'dto/info.dto';

@Injectable()
/**
 * API Events
 */
export class ApiEventsService extends AppBaseService<
  ApiEvent,
  CreateApiEventDTO,
  UpdateApiEventDTO,
  AppInfoDTO
> {
  protected readonly logger: Logger = new Logger(ApiEventsService.name);

  constructor(
    @InjectRepository(ApiEvent) readonly repo: Repository<ApiEvent>,
    @InjectRepository(LatestApiEventByTopicAndKind)
    readonly latestEventByTopicAndKindRepo: Repository<LatestApiEventByTopicAndKind>,
  ) {
    super(repo, apiEventResource.name.singular, apiEventResource.name.plural);
  }

  get serializerConfig(): JSONAPISerializerConfig<ApiEvent> {
    return {
      attributes: ['timestamp', 'topic', 'kind', 'data'],
      keyForAttribute: 'camelCase',
    };
  }

  /**
   * Given a `QualifiedEventTopic` (topic qualified by `kind` and `apiEvent`),
   * return the matching event with latest timestamp.
   */
  public async getLatestEventForTopic(
    qualifiedTopic: QualifiedEventTopic,
  ): Promise<ApiEventByTopicAndKind | undefined> {
    const result: LatestApiEventByTopicAndKind | null =
      await this.latestEventByTopicAndKindRepo.findOne({
        where: { topic: qualifiedTopic.topic, kind: qualifiedTopic.kind },
      });
    if (!result) {
      throw new NotFoundException(
        `No events found for topic ${qualifiedTopic.topic} and kind ${qualifiedTopic.kind}.`,
      );
    }

    return result;
  }

  /**
   * Purge all events. Optionally this can be limited to events of a given
   * `QualifiedEventTopic` (i.e. a topic qualified by `kind` and `apiVersion`).
   */
  public async purgeAll(
    qualifiedTopic?: QualifiedEventTopic,
  ): Promise<DeleteResult> {
    if (!isNil(qualifiedTopic)) {
      this.logger.log(
        `Purging events for topic ${qualifiedTopic.topic}/${qualifiedTopic.kind}}`,
      );
      return this.repo.delete({
        topic: qualifiedTopic.topic,
        kind: qualifiedTopic.kind,
      });
    } else {
      this.logger.log(`Purging events`);
      await this.repo.clear();
      return new DeleteResult();
    }
  }
}
