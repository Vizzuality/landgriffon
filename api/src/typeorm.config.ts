import * as config from 'config';
import { DataSourceOptions } from 'typeorm';

const dbConfig: any = config.get('db');

export const typeOrmConfig: DataSourceOptions = {
  type: dbConfig.type,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  logging: dbConfig.logging,
  maxQueryExecutionTime: dbConfig.maxQueryExecutionTime,
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  migrationsRun: true,
  dropSchema: false,
  cache:
    dbConfig.cacheEnabled === true || dbConfig.cacheEnabled === 'true'
      ? {
          type: 'redis',
          options: {
            host: dbConfig.cacheHost,
            port: dbConfig.cachePort ? parseInt(dbConfig.cachePort) : 6379,
            db: dbConfig.cacheDatabase ? parseInt(dbConfig.cacheDatabase) : 1,
          },
        }
      : false,
  uuidExtension: 'pgcrypto',
  entities: [
    __dirname + '/modules/**/**.entity.ts',
    __dirname + '/modules/**/**.entity.js',
  ],
};
