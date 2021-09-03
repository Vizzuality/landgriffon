import { getManager } from 'typeorm';
import { h3Fixtures } from './h3-fixtures';

export const createFakeH3Data = async (
  h3TableName: string,
  h3ColumnName: string,
  bulk?: boolean,
): Promise<string> => {
  await getManager().query(
    `CREATE TABLE ${h3TableName} (h3index h3index, ${h3ColumnName} float4);` +
      `INSERT INTO ${h3TableName} (h3index, ${h3ColumnName} ) VALUES ('861203a4fffffff', 1000);` +
      `INSERT INTO h3_data ("h3tableName", "h3columnName", "h3resolution") VALUES ('${h3TableName}', '${h3ColumnName}', 6 );`,
  );
  if (bulk) {
    let query = `INSERT INTO ${h3TableName} (h3index,  ${h3ColumnName}) VALUES `;
    const queryArr = [];
    for (const [key, value] of Object.entries(h3Fixtures)) {
      queryArr.push(`('${key}', ${value})`);
    }
    query = query.concat(queryArr.join());
    await getManager().query(query);
  }

  const res = await getManager().query(`SELECT id FROM h3_data;`);
  return res[0].id;
};

export const dropFakeH3Data = async (h3TableName: string): Promise<void> => {
  await getManager().query(`DROP TABLE IF EXISTS ${h3TableName};`);
};
