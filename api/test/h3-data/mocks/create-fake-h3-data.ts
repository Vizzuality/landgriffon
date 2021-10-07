import { getManager } from 'typeorm';
import { H3Data } from 'modules/h3-data/h3-data.entity';

export const createFakeH3Data = async (
  h3TableName: string,
  h3ColumnName: string,
  additionalH3Data?: any,
  indicatorId?: string,
): Promise<H3Data> => {
  await getManager().query(
    `CREATE TABLE ${h3TableName} (h3index h3index, ${h3ColumnName} float4);` +
      `INSERT INTO ${h3TableName} (h3index, ${h3ColumnName} ) VALUES ('861203a4fffffff', 1000);`,
  );

  if (additionalH3Data) {
    let query = `INSERT INTO ${h3TableName} (h3index,  ${h3ColumnName}) VALUES `;
    const queryArr = [];
    for (const [key, value] of Object.entries(additionalH3Data)) {
      queryArr.push(`('${key}', ${value})`);
    }
    query = query.concat(queryArr.join());
    await getManager().query(query);
  }

  const h3data = new H3Data();
  h3data.h3tableName = h3TableName;
  h3data.h3columnName = h3ColumnName;
  h3data.h3resolution = 6;
  if (indicatorId) {
    h3data.indicatorId = indicatorId;
  }

  return h3data.save();
};

export const dropFakeH3Data = async (h3TableNames: string[]): Promise<void> => {
  for (const h3tableName of h3TableNames) {
    await getManager().query(`DROP TABLE IF EXISTS ${h3tableName};`);
  }
};
