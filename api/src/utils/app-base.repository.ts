import { DataSource, ObjectLiteral, QueryRunner, Repository } from 'typeorm';
import { SaveOptions } from 'typeorm/repository/SaveOptions';
import { chunk } from 'lodash';
import { Injectable, Logger } from '@nestjs/common';
import * as config from 'config';
import { ImportProgressEmitter } from '../modules/events/import-data/import-progress.emitter';

const dbConfig: any = config.get('db');
const batchChunkSize: number = parseInt(`${dbConfig.batchChunkSize}`, 10);

@Injectable()
export abstract class AppBaseRepository<
  Entity extends ObjectLiteral,
> extends Repository<Entity> {
  logger: Logger = new Logger(this.constructor.name);
  protected dataSource: DataSource;
  protected importProgress: ImportProgressEmitter;

  async saveChunks<Entity>(
    entities: Entity[],
    options?: SaveOptions,
    trackingOptions?: {
      step: string;
      progressStartingPoint: number;
    },
  ): Promise<Entity[]> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const result: Entity[][] = [];
    const totalEntities: number = entities.length;
    const totalChunks: number = Math.ceil(totalEntities / batchChunkSize);
    const progressStartingPoint: number =
      trackingOptions?.progressStartingPoint ?? 0;
    let progress: number = progressStartingPoint;
    const progressPerChunk: number =
      (100 - progressStartingPoint ?? 0) / totalChunks; // Distribuir el progreso restante entre los chunks

    try {
      for (const [index, dataChunk] of chunk(
        entities,
        batchChunkSize,
      ).entries()) {
        this.logger.debug(
          `Inserting chunk #${index} (${dataChunk.length} items) from a total of ${totalChunks}...`,
        );
        const promises: Promise<Entity>[] = dataChunk.map((row: Entity) =>
          queryRunner.manager.save(row, options),
        );
        const saved: Entity[] = await Promise.all(promises);
        result.push(saved);
        progress += progressPerChunk;
        if (trackingOptions?.step === 'IMPORTING_DATA') {
          this.importProgress.emitImportProgress({
            progress,
          });
        }
        if (trackingOptions?.step === 'CALCULATING_IMPACT') {
          this.importProgress.emitImpactCalculationProgress({
            progress,
          });
        }
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
