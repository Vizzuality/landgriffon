import { Connection, getConnection, QueryRunner, Repository } from 'typeorm';
import { SaveOptions } from 'typeorm/repository/SaveOptions';
import { chunk } from 'lodash';
import { Logger } from '@nestjs/common';
import * as config from 'config';
const dbConfig: any = config.get('db');
const batchChunkSize: number = parseInt(`${dbConfig.batchChunkSize}`, 10);

export abstract class AppBaseRepository<Entity> extends Repository<Entity> {
  logger: Logger = new Logger(this.constructor.name);

  async saveChunks<Entity>(
    entities: Entity[],
    options?: SaveOptions,
  ): Promise<Entity[]> {
    const connection: Connection = getConnection();
    const queryRunner: QueryRunner = connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const result: Entity[][] = [];

    try {
      for (const [index, dataChunk] of chunk(
        entities,
        batchChunkSize,
      ).entries()) {
        this.logger.debug(
          `Inserting chunk #${index} (${dataChunk.length} items)...`,
        );
        const promises: Promise<Entity>[] = dataChunk.map((row: Entity) =>
          queryRunner.manager.save(row, options),
        );
        const saved: Entity[] = await Promise.all(promises);
        result.push(saved);
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
