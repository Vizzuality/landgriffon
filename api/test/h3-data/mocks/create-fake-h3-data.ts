import { getManager } from 'typeorm';

export const createFakeH3Data = async (
  h3TableName: string,
  h3ColumnName: string,
): Promise<void> => {
  await getManager().query(
    `CREATE TABLE ${h3TableName} (h3index h3index, ${h3ColumnName} float4);` +
      `INSERT INTO ${h3TableName} (h3index, ${h3ColumnName} ) VALUES ('861203a4fffffff', 1000);` +
      `INSERT INTO h3_data ("h3tableName", "h3columnName", "h3resolution") VALUES ('${h3TableName}', '${h3ColumnName}', 6 );`,
  );
};

export const dropFakeH3Data = async (h3TableName: string): Promise<void> => {
  await getManager().query(`DROP TABLE ${h3TableName};`);
};
