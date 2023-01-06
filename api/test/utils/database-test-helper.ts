import { BaseEntity, DataSource } from 'typeorm';

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
