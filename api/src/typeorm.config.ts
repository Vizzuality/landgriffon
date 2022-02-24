import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';

const dbConfig: any = config.get('db');

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: dbConfig.type,
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  logging: dbConfig.logging,
  autoLoadEntities: true,
  synchronize: dbConfig.synchronize === true || dbConfig.synchronize === 'true',
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  /** Migrations will run automatically on startup, unless the
   * `API_RUN_MIGRATIONS_ON_STARTUP` or `GEOPROCESSING_RUN_MIGRATIONS_ON_STARTUP`
   * environment variables are set and their value matches, case-insensitively,
   * the string `false`.
   *
   * @debt I think this should be way more resilient to user input.
   */
  migrationsRun:
    dbConfig.migrationsRun === true || dbConfig.migrationsRun === 'true',
  dropSchema: dbConfig.dropSchema === true || dbConfig.dropSchema === 'true',
  cli: {
    migrationsDir: 'migrations',
  },
  uuidExtension: 'pgcrypto',
};
