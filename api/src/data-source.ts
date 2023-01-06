import { DataSource } from 'typeorm';
import { typeOrmConfig } from 'typeorm.config';

export const AppDataSource: DataSource = new DataSource(typeOrmConfig);
