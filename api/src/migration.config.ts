import { typeOrmConfig } from 'typeorm.config';
import { DataSource, DataSourceOptions } from 'typeorm';

const migrationConfig: DataSourceOptions = { ...typeOrmConfig };

export = migrationConfig;
