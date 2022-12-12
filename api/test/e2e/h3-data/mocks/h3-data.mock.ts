import { DataSource } from 'typeorm';
import { H3Data } from 'modules/h3-data/h3-data.entity';
import { snakeCase, camelCase } from 'typeorm/util/StringUtils';

export const h3DataMock = async (
  dataSource: DataSource,
  h3DataMockParams: {
    h3TableName: string;
    h3ColumnName: string;
    additionalH3Data?: Record<string, any> | null;
    indicatorId?: string | null;
    year: number;
    contextualLayerId?: string | null;
  },
): Promise<H3Data> => {
  const formattedTableName: string = snakeCase(h3DataMockParams.h3TableName);
  const formattedColumnName: string = camelCase(h3DataMockParams.h3ColumnName);

  await dataSource.query(
    `CREATE TABLE "${formattedTableName}" (h3index h3index, "${formattedColumnName}" float4);`,
  );

  if (h3DataMockParams.additionalH3Data) {
    let query = `INSERT INTO "${formattedTableName}" (h3index, "${formattedColumnName}") VALUES `;
    const queryArr = [];
    for (const [key, value] of Object.entries(
      h3DataMockParams.additionalH3Data,
    )) {
      queryArr.push(`('${key}', ${value})`);
    }
    query = query.concat(queryArr.join());
    await dataSource.query(query);
  }

  const h3data = new H3Data();
  h3data.h3tableName = formattedTableName;
  h3data.h3columnName = formattedColumnName;
  h3data.h3resolution = 6;
  h3data.year = h3DataMockParams.year;
  if (h3DataMockParams.indicatorId) {
    h3data.indicatorId = h3DataMockParams.indicatorId;
  }
  if (h3DataMockParams.contextualLayerId) {
    h3data.contextualLayerId = h3DataMockParams.contextualLayerId;
  }
  return h3data.save();
};

export const dropH3DataMock = async (
  dataSource: DataSource,
  h3TableNames: string[],
): Promise<void> => {
  for (const h3TableName of h3TableNames) {
    await dataSource.query(`DROP TABLE IF EXISTS ${snakeCase(h3TableName)};`);
  }
};

export const createRandomNamesForH3TableAndColumns = (): string =>
  (Math.random() + 1).toString(36).substring(2);

export const createRandomIndicatorNameCode = (): string =>
  `${Math.random() + 1}_${Math.random() + 1}`;
