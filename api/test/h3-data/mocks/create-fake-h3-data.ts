import { getManager } from 'typeorm';
import { H3IndexValueData } from '../../../src/modules/h3-data/h3-data.entity';

export const createFakeH3Data = async (
  h3TableName: string,
  h3ColumnName: string,
  aditionalH3Data?: H3IndexValueData,
): Promise<string> => {
  await getManager().query(
    `CREATE TABLE ${h3TableName} (h3index h3index, ${h3ColumnName} float4);` +
      `INSERT INTO ${h3TableName} (h3index, ${h3ColumnName} ) VALUES ('861203a4fffffff', 1000);` +
      `INSERT INTO h3_data ("h3tableName", "h3columnName", "h3resolution") VALUES ('${h3TableName}', '${h3ColumnName}', 6 );`,
  );
  if (aditionalH3Data) {
    let query = `INSERT INTO ${h3TableName} (h3index,  ${h3ColumnName}) VALUES `;
    const queryArr = [];
    for (const [key, value] of Object.entries(aditionalH3Data)) {
      queryArr.push(`('${key}', ${value})`);
    }
    query = query.concat(queryArr.join());
    await getManager().query(query);
  }
  const res = await getManager().query(
    `SELECT id FROM h3_data WHERE "h3columnName" = '${h3ColumnName}';`,
  );
  return res[0].id;
};

export const dropFakeH3Data = async (h3TableNames: string[]): Promise<void> => {
  for (const h3tableName of h3TableNames) {
    await getManager().query(`DROP TABLE IF EXISTS ${h3tableName};`);
  }
};
