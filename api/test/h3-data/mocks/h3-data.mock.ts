import { getManager } from 'typeorm';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { snakeCase, camelCase } from 'typeorm/util/StringUtils';

export const h3DataMock = async (
  h3TableName: string,
  h3ColumnName: string,
  additionalH3Data?: any,
  indicatorId?: string,
  year: number = 2000,
): Promise<H3Data> => {
  const formattedTableName: string = snakeCase(h3TableName);
  const formattedColumnName: string = camelCase(h3ColumnName);

  await getManager().query(
    `CREATE TABLE ${formattedTableName} (h3index h3index, "${formattedColumnName}" float4);` +
      `INSERT INTO ${formattedTableName} (h3index, "${formattedColumnName}" ) VALUES ('861203a4fffffff', 1000);`,
  );

  if (additionalH3Data) {
    let query = `INSERT INTO ${formattedTableName} (h3index, "${formattedColumnName}") VALUES `;
    const queryArr = [];
    for (const [key, value] of Object.entries(additionalH3Data)) {
      queryArr.push(`('${key}', ${value})`);
    }
    query = query.concat(queryArr.join());
    await getManager().query(query);
  }

  const h3data = new H3Data();
  h3data.h3tableName = formattedTableName;
  h3data.h3columnName = formattedColumnName;
  h3data.h3resolution = 6;
  h3data.year = year;
  if (indicatorId) {
    h3data.indicatorId = indicatorId;
  }

  return h3data.save();
};

export const dropH3DataMock = async (h3TableNames: string[]): Promise<void> => {
  for (const h3TableName of h3TableNames) {
    await getManager().query(`DROP TABLE IF EXISTS ${snakeCase(h3TableName)};`);
  }
};

export const createRandomNamesForH3TableAndColumns = (): string =>
  (Math.random() + 1).toString(36).substring(2);
