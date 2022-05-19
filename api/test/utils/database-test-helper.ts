import { BaseEntity, getConnection, getManager } from 'typeorm';

/**
 * Drops all Tables starting with prefix h3_grid_
 */

export async function dropH3GridTables(): Promise<void> {
  const h3GridPrefix = 'h3_grid_';
  const tableList: any[] = await getManager().query(`select table_name
                                                     from information_schema.tables
                                                     where table_name like '%${h3GridPrefix}%'`);
  await dropTables(tableList.map((table: any) => table.table_name));
}

export async function dropTables(tableNameList: string[]): Promise<void> {
  if (tableNameList.length) {
    await getManager().query(`DROP TABLE ${tableNameList.join(', ')}`);
  }
}

/**
 * Clear all tables of given Entities defined in the API
 * @param entityList
 */
export async function clearEntityTables(
  entityList: typeof BaseEntity[],
): Promise<void> {
  for await (const model of entityList) {
    const repository = getConnection().getRepository(model.name); // Get repository
    await repository.delete({}); // Clear eacj
  }
}
