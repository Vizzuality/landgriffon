import { DataSource, QueryRunner } from 'typeorm';
import { IndicatorRecord } from 'modules/indicator-records/indicator-record.entity';
import { Injectable, Logger } from '@nestjs/common';
import { AppBaseRepository } from 'utils/app-base.repository';
import { SaveOptions } from 'typeorm/repository/SaveOptions';
import { chunk } from 'lodash';
import { AppConfig } from 'utils/app.config';
import { ImportProgressTrackerFactory } from 'modules/events/import-data/import-progress.tracker.factory';
import { ImpactCalculationProgressTracker } from 'modules/impact/progress-tracker/impact-calculation.progress-tracker';

const dbConfig: any = AppConfig.get('db');
const batchChunkSize: number = parseInt(`${dbConfig.batchChunkSize}`, 10);

@Injectable()
export class IndicatorRecordRepository extends AppBaseRepository<IndicatorRecord> {
  constructor(
    protected dataSource: DataSource,
    private readonly importProgressTrackerFactory: ImportProgressTrackerFactory,
  ) {
    super(IndicatorRecord, dataSource.createEntityManager());
  }

  logger: Logger = new Logger(IndicatorRecordRepository.name);

  async saveChunks<IndicatorRecord>(
    entities: IndicatorRecord[],
    options?: SaveOptions,
  ): Promise<IndicatorRecord[]> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const result: IndicatorRecord[][] = [];
    const totalEntities: number = entities.length;
    const totalChunks: number = Math.ceil(totalEntities / batchChunkSize);
    const tracker: ImpactCalculationProgressTracker =
      this.importProgressTrackerFactory.createImpactCalculationProgressTracker({
        totalRecords: totalEntities,
        totalChunks: totalChunks,
        startingPercentage: 50,
      });

    try {
      for (const [index, dataChunk] of chunk(
        entities,
        batchChunkSize,
      ).entries()) {
        this.logger.debug(
          `Inserting chunk #${index} (${dataChunk.length} items) from a total of ${totalChunks}...`,
        );
        const promises: Promise<IndicatorRecord>[] = dataChunk.map(
          (row: IndicatorRecord) => queryRunner.manager.save(row, options),
        );
        const saved: IndicatorRecord[] = await Promise.all(promises);
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
