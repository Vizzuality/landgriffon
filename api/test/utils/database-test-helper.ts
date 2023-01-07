import { BaseEntity, DataSource, EntityMetadata } from 'typeorm';
import { difference } from 'lodash';

/**
 * Drops all Tables starting with prefix h3_grid_
 */

export async function dropH3GridTables(dataSource: DataSource): Promise<void> {
  const h3GridPrefix = 'h3_grid_';
  const tableList: any[] = await dataSource.query(`select table_name
                                                     from information_schema.tables
                                                     where table_name like '%${h3GridPrefix}%'`);
  await dropTables(
    dataSource,
    tableList.map((table: any) => table.table_name),
  );
}

export async function dropTables(
  dataSource: DataSource,
  tableNameList: string[],
): Promise<void> {
  if (tableNameList.length) {
    await dataSource.query(`DROP TABLE ${tableNameList.join(', ')}`);
  }
}

/**
 * Clear all tables of given Entities defined in the API
 * @param entityList
 */
export async function clearEntityTables(
  dataSource: DataSource,
  entityList: typeof BaseEntity[],
): Promise<void> {
  for await (const model of entityList) {
    const repository = dataSource.getRepository(model.name); // Get repository
    await repository.delete({}); // Clear each
  }
}

/**
 * Clear all data from managed tables
 * Drops all non-managed tables
 */
export async function clearTestDataFromDatabase(
  dataSource: DataSource,
): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();
  try {
    const entityTableNames: string[] = dataSource.entityMetadatas
      .filter(
        (entityMetadata: EntityMetadata) =>
          entityMetadata.tableType === 'regular' ||
          entityMetadata.tableType === 'junction',
      )
      .map((entityMetadata: EntityMetadata) => entityMetadata.tableName);

    await Promise.all(
      entityTableNames.map((entityTableName: string) =>
        queryRunner.query(`TRUNCATE TABLE "${entityTableName}" CASCADE`),
      ),
    );

    entityTableNames.push(dataSource.metadataTableName);
    entityTableNames.push(
      dataSource.options.migrationsTableName || 'migrations',
    );
    entityTableNames.push('spatial_ref_sys');

    const databaseTableNames: string[] = (
      await dataSource.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`,
      )
    ).map((e: Record<string, any>) => e.table_name);

    const tablesToDrop = difference(databaseTableNames, entityTableNames);

    await Promise.all(
      tablesToDrop.map((tableToDrop: string) =>
        queryRunner.dropTable(tableToDrop),
      ),
    );
    await queryRunner.commitTransaction();
  } catch (err) {
    // rollback changes before throwing error
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    // release query runner which is manually created
    await queryRunner.release();
  }
}
