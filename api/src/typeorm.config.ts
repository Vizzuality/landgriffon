import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as config from 'config';
import { ImpactMaterializedView } from 'modules/impact/views/impact.materialized-view.entity';

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
  migrationsRun:
    dbConfig.migrationsRun === true || dbConfig.migrationsRun === 'true',
  dropSchema: dbConfig.dropSchema === true || dbConfig.dropSchema === 'true',
  cli: {
    migrationsDir: 'migrations',
  },
  uuidExtension: 'pgcrypto',
  entities: [ImpactMaterializedView],
};
