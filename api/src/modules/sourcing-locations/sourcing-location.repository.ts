import {
  DataSource,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { SourcingLocation } from 'modules/sourcing-locations/sourcing-location.entity';
import { GetLocationTypesDto } from 'modules/sourcing-locations/dto/location-types-options.sourcing-locations.dto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BaseQueryBuilder } from 'utils/base.query-builder';
import { SaveOptions } from 'typeorm/repository/SaveOptions';
import { chunk } from 'lodash';
import { SourcingDataImportProgressTracker } from 'modules/sourcing-locations/progress-tracker/sourcing-data.progress-tracker';
import { ImportProgressTrackerFactory } from 'modules/events/import-data/import-progress.tracker.factory';
import { AppConfig } from 'utils/app.config';

const dbConfig: any = AppConfig.get('db');
const batchChunkSize: number = parseInt(`${dbConfig.batchChunkSize}`, 10);

@Injectable()
export class SourcingLocationRepository extends Repository<SourcingLocation> {
  logger: Logger = new Logger(this.constructor.name);

  constructor(
    protected dataSource: DataSource,
    protected readonly trackerFactory: ImportProgressTrackerFactory,
  ) {
    super(SourcingLocation, dataSource.createEntityManager());
  }

  async getAvailableLocationTypes(
    locationTypesOptions: GetLocationTypesDto,
  ): Promise<{ locationType: string }[]> {
    const queryBuilder: SelectQueryBuilder<SourcingLocation> =
      this.createQueryBuilder('sl')
        .select('sl.locationType', 'locationType')
        .distinct()
        .orderBy('sl.locationType', locationTypesOptions.sort ?? 'DESC');

    const queryBuilderWithFilters: SelectQueryBuilder<SourcingLocation> =
      BaseQueryBuilder.addFilters(queryBuilder, locationTypesOptions);

    const locationTypes: { locationType: string }[] =
      await queryBuilderWithFilters.getRawMany();

    if (!locationTypes) {
      throw new NotFoundException(`No Location Types were found`);
    }

    return locationTypes;
  }

  async saveChunks(
    entities: SourcingLocation[],
    options?: SaveOptions,
  ): Promise<SourcingLocation[]> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const result: SourcingLocation[][] = [];
    const totalEntities: number = entities.length;
    const totalChunks: number = Math.ceil(totalEntities / batchChunkSize);
    const tracker: SourcingDataImportProgressTracker =
      this.trackerFactory.createSourcingDataImportTracker({
        totalRecords: entities.length,
        totalChunks,
      });

    try {
      for (const [index, dataChunk] of chunk(
        entities,
        batchChunkSize,
      ).entries()) {
        this.logger.debug(
          `Inserting Sourcing Location chunk #${index} (${dataChunk.length} items) from a total of ${totalChunks} Sourcing Locations...`,
        );
        const promises: Promise<SourcingLocation>[] = dataChunk.map(
          (row: SourcingLocation) => queryRunner.manager.save(row, options),
        );
        const saved: SourcingLocation[] = await Promise.all(promises);
        result.push(saved);
        tracker.trackProgress();
      }

      // commit transaction if every chunk was saved successfully
      await queryRunner.commitTransaction();
    } catch (err) {
      // rollback changes before throwing error
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // release query runner which is manually created
      await queryRunner.release();
    }
    return result.flat();
  }
}
